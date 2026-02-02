import mongoose from "mongoose";

const answersSchema = new mongoose.Schema({
    questionsID: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    questions: { type: String, required: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answer: { type: String, required: true },
});

const Answers = mongoose.model("Answer", answersSchema);

export default Answers;
