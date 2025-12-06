import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  assistantName: { type: String, default: "Assistant" },
  assistantImage: { type: String },
  personality: { type: String, default: "friendly" },
  voicePreference: { type: String, default: "female" },
  history: [{ type: Array }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
},{timestamps:true }
);

const User = mongoose.model("User", userSchema);

export default User;
