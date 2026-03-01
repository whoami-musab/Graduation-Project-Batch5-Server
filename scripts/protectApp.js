import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import TooManyRequests from '../models/ManyRequests.js';

dotenv.config();

// ++++++++++++++++++++++++++++++++ Helmet Guards ++++++++++++++++++++++++++++++++++++++++++++++
export const helmetGuards = helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
})

// ++++++++++++++++++++++++ Rate Limiter for Auth Routes +++++++++++++++++++++++++++++++++++++++
export const authLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit each IP to 10 requests per windowMs
});

// ++++++++++++++++++++++++++++++++ Get Client IP ++++++++++++++++++++++++++++++++++++++++++++++
export const getClientIp = (req)=>(
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
)?.replace("::ffff:", "");

// ++++++++++++++++++++++++++++++++ Rate Limiter ++++++++++++++++++++++++++++++++++++++++++++++
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    standardHeaders: true, // Enable the `RateLimit-*` headers
    skipSuccessfulRequests: false,
    handler: async (req, res) => {
        const ip = getClientIp(req);
        const ua = req.headers['user-agent'] || 'unknown';
        let os = 'unknown';

        if(ua.includes('Windows')) os = 'Windows';
        else if(ua.includes('Macintosh')) os = 'Macintosh';
        else if(ua.includes('Linux')) os = 'Linux';
        else if(ua.includes('Android')) os = 'Android';
        else if(ua.includes('iPhone')) os = 'iOS';
        else if(ua.includes('curl')) os = 'Linux/curl';
        
        console.log('Rate limit exceeded by IP: ', ip)
        console.log('Method:', req.method)
        console.log('URL:', req.originalUrl)
        console.log('Headers:', req.headers)
        console.log('Detected OS:', os)

        const doc = await TooManyRequests.findOneAndUpdate(
            { ip },
            {
                $inc: { requestCount: 1 },
                $set: { lastRequestTime: new Date() },
                userAgent: ua,
                os,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Extend expiry by 1 hour
            },
            {upsert: true, new: true }
        );
        if(doc.requestCount >= 100){
            doc.banned = true;
            await doc.save();
            console.log(`IP ${ip} has been banned due to excessive requests.`);
        }

        res.status(429).json({
            status: 429,
            error: "Too many requests.",
        });
    },
    skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for OPTIONS requests
});