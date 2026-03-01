import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7, header.length) : null;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.id || decoded._id;
    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}