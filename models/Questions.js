import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
    questions: { type: String, required: true },
    score: { type: Number, required: true },
    testID: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
});

const Questions = mongoose.model("Question", questionsSchema);

export default Questions;
