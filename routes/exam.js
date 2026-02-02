import express from "express";
import Test from "../models/Test.js";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddle.js";

const router = express.Router();

// ================== Save Exam ==================
router.post('/saveExam', authMiddleware, async (req, res) => {
    const { questions, startTime, endTime, level } = req.body;

    if(!req.userId || !Array.isArray(questions) || questions.length === 0 || !startTime || !endTime || !level) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingTest = await Test.findOne({ userId: req.userId, startTime });

        if (existingTest) {
            return res.status(409).json({ message: "Test already submitted" });
        }

        const newTest = new Test({
            userId: req.userId,
            questions,
            startTime,
            endTime,
            level: level || null,
        });

        await newTest.save();
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {level},
            {new: true}
        )
        res.status(201).json({ message: "Test submitted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error.' });
    }
})

// ================== Get Exams ==================
router.get('/getExams', authMiddleware, async (req, res) => {

    try {
        const exams = await Test.find({ userId: req.userId }).sort({ createdAt: -1 });
        if(exams.length === 0){
            return res.status(200).json({message: 'No exams for this user', exams: []})
        }
        return res.status(200).json({ exams });
    } catch (error) {
        res.status(500).json({ message: error.message || "Server Error" });
    }
})

// ================= Get Exam By ID ==================
router.get('/getExam/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Exam ID is required" });
    }
    try {
        const exam = await Test.findOne({ _id: id, userId: req.userId})
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        console.log(exam)
        return res.status(200).json({ exam });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
});


export default router;