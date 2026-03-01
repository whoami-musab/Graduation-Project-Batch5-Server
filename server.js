import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import examRoutes from './routes/exam.js'
import connDB from "./scripts/conn.js";
import { helmetGuards, limiter } from "./scripts/protectApp.js";
import { bannIP } from "./middlewares/bannIP.js";

// ===========================================================================================
// ===================================== Server Config =======================================
// ===========================================================================================
dotenv.config();
const server = express();
connDB();

const PORT = process.env.PORT || 4000
const expiry = 24 * 60 * 60 * 1000; // 24 hour

// ===========================================================================================
// ===================================== Server Allowed & Session ======================================
// ===========================================================================================
server.use(bannIP)
server.use(helmetGuards);
server.use(limiter);
server.set("trust proxy", 1); // trust first proxy

server.use(express.json());
const allowedOrigins = process.env.CLIENT_HOST.split(',').map(origin => origin.trim());
server.use(
  cors({
    origin: (origin, cb)=> {

      if (!origin) return cb(null, true);

      if(allowedOrigins.includes(origin)){
        return cb(null, true);
      }

      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ["PUT", "DELETE", "POST", "GET", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
server.use(
  session({
    name: process.env.SESSION_NAME,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: expiry,
    },
  })
);
// ===========================================================================================
// ===================================== Server Routes =======================================
// ===========================================================================================

server.get("/", (req, res) => {
  res.send("English level determination system.");
});
server.use("/auth", authRoutes);
server.use("/exam", examRoutes);

// ===========================================================================================
// ===================================== Server Routes =======================================
// ===========================================================================================
server.listen(PORT, '0.0.0.0', () =>
  console.log(
    `Server running on http://localhost:${PORT}`
  )
);
