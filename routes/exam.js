import express from "express";
import Test from "../models/Test.js";
import { authMiddleware } from "../middlewares/authMiddle.js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
})

// ================== Create Exam ==================
router.post('/make_exam', authMiddleware, async (req, res) => {
    console.log(req.body)
    try{
        const aiRes = await fetch(`${process.env.AI_URL_DEVELOPMENT}/make_exam`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await aiRes.json()
        return res.status(aiRes.status).json(data)
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
})

// ================== Analyze and Save Exam ==================
router.post("/aiAnalyze", authMiddleware, upload.array("audio_files"),
    async (req, res) => {
        console.log(req.body)
        try {
        const userId = req.userId;

        // text fields from multipart
        const { startTime, endTime, answers_json } = req.body;

        if (!userId || !startTime || !endTime || !answers_json) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let answersList;
        try {
            answersList = JSON.parse(answers_json);
            if (!Array.isArray(answersList) || answersList.length === 0) {
            return res.status(400).json({ message: "answers_json must be a non-empty array" });
            }
        } catch {
            return res.status(400).json({ message: "Invalid JSON in answers_json" });
        }

        const start = new Date(startTime);
        const existing = await Test.findOne({ userId, startTime: start });
        if (existing) {
            return res.status(409).json({ message: "Test already submitted" });
        }

        // Forward to FastAPI as multipart/form-data
        const aiForm = new FormData();
        aiForm.append("answers_json", answers_json);

        // req.files from multer
        const files = req.files || [];

        for (const f of files) {
            const blob = new Blob([f.buffer], { type: f.mimetype || "audio/webm" });
            aiForm.append("audio_files", blob, f.originalname || "speaking.webm");
        }

        const aiRes = await fetch(`${process.env.AI_URL_DEVELOPMENT}/submit_exam`, {
            method: "POST",
            body: aiForm,
        });

        if (!aiRes.ok) {
            const errText = await aiRes.text();
            return res.status(aiRes.status).json({ message: errText || "AI analysis failed" });
        }

        const examResult = await aiRes.json();
        console.log('Result: ', examResult)
        const questions = [];
        console.log('Questions: ', questions)
        Object.values(examResult.scores || {}).forEach((section) => {
            (section.details || []).forEach((q) => {
            questions.push({
                question: q.question,
                correctAnswer: q.correct_answer,
                userAnswer: q.student_answer ?? null,
                isCorrect: q.correct ?? null,
            });
            });
        });

        const newTest = await Test.create({
            userId,
            questions,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            level: examResult.level || null,
        });

        return res.status(201).json({
            message: "Test submitted successfully",
            examId: newTest._id,
        });
        } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error." });
        }
    }
);

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
        return res.status(200).json({ exam });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
});


export default router;