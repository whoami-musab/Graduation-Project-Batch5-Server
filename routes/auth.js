import express from "express";
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

dotenv.config();
const router = express.Router();

router.post("/login", async (req, res) => {
  const {username, password} = req.body;
  try {
    if(!username || !password){
      return res.status(400).json({message: 'All fields are required.'})
    }
    const user = await User.findOne({$or: [{username}, {email: username}]})
    if(!user){
      return res.status(404).json({message: 'Invalid Credentials.'})
    }
    const isPassword = await bcrypt.compare(password, user.password)
    if(!isPassword){
      return res.status(401).json({message: 'Invalid Credentials.'})
    }
    const token = jwt.sign({id: user._id, user: username, role: user.role}, process.env.SECRET, {expiresIn: '1d'})

    const userSafe = user.toObject()
    delete userSafe.password

    return res.status(200).json({message: 'Login successfully!.', token, user: userSafe})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const {username, firstName, lastName, email, phone, password} = req.body;

  if(!username || !firstName || !lastName || !email || !phone || !password){
    return res.status(400).json({message: 'All fields are required.'})
  }

  try {
    const user = await User.findOne({$or: [{username}, {email}, {phone}]})
    if(user){
      return res.status(400).json({message: 'User already exists.'})
    }
    const hashedPass = await bcrypt.hash(password, 10)
    await User.create({
      username,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPass,
      level: null,
      role: 'user'
    })
    return res.status(201).json({message: 'Registered successfully ✅'})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update", async (req, res) => {
  const {} = req.body; // TODO:
  try {
    // TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id; // TODO:
  try {
    // TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getUserData", async (req, res) => {
  const authHeader = req.headers.authorization
  try {
    if(!authHeader || !authHeader.startsWith('Bearer ')){
      return res.status(401).json({message: 'Unauthorized access.'})
    }
    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.SECRET)


    const user = await User.findById(decoded.id).select('-password -__v')

    return res.status(200).json({user})

  } catch (error) {
    console.error(error);
    if(error.name === 'JsonWebTokenError'){
      return res.status(401).json({message: 'Unauthorized access.'})
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
