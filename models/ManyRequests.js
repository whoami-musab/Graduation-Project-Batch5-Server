import mongoose from "mongoose";

const manyRequestsSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    requestCount: { type: Number, required: true, default: 1 },
    lastRequestTime: { type: Date, required: true, default: Date.now },
    userAgent: { type: String, required: false },
    os: { type: String, required: false },
    expiresAt: {
        type: Date,
        default: ()=> new Date(Date.now() + 60 * 60 * 1000) // 1 hour from creation
    },
    banned: { type: Boolean, default: false }
}, {timestamps: true})

manyRequestsSchema.index({ip: 1}, {unique: true});
manyRequestsSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const TooManyRequests = mongoose.model('TooManyRequests', manyRequestsSchema);
export default TooManyRequests;