import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true },
  country: { type: String },
  level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', null], default: null },
  totalExams: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: "user" },
});

const User = mongoose.model("User", userSchema);

export default User;
