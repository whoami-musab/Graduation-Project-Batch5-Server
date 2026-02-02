import express from "express";
import dotenv from "dotenv";
import User from "../models/User.js";
import Test from "../models/Test.js";
import Questions from "../models/Questions.js";
import Answers from "../models/Answers.js";
dotenv.config();

const router = express.Router();

router.get("/:id", async (req, res) => {
    const id = req.params.id; // TODO::
  try {
    //  TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/make", async (req, res) => {
    const {} = req.body; // TODO:
  try {
    //  TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update", async (req, res) => {
    const {} = req.body; // TODO:
  try {
    //  TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id; // TODO:
  try {
    //  TODO:
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
