import { getClientIp } from "../scripts/protectApp.js"
import TooManyRequests from "../models/ManyRequests.js";

export const bannIP = async (req, res, next) => {
    const ip = getClientIp(req);
    const doc = await TooManyRequests.findOne({ip, banned: true});
    if(doc){
        return res.status(403).json({message: 'Suspicious requests. Please contact support.'});
    }
    next();
}