import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [
        {
            question: { type: String, required: true },
            correctAnswer: { type: String, required: true },
            userAnswer: { type: String, default: null },
            isCorrect: { type: Boolean, default: null },
        }
    ],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: null },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


testSchema.virtual('duration').get(function() {
    return Math.round((this.endTime - this.startTime) / 1000 / 60); // duration in minutes
})

const Test = mongoose.model("Test", testSchema);


export default Test;
