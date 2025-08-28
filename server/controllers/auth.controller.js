import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";
import bcrypt from "bcryptjs";

// it is for signup
export const signUp = async (req, res) => {
  
  try {
    const { name, email, password } = req.body;
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });
    const token = await generateToken(user._id);

    res.cookie("token", token, { httpOnly: true , maxAge:7*24*60*60*1000,sameSite: 'Strict',secure:false});

    await user.save();
   return res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
   return res.status(500).json({ message: "Error creating user", error });
  }
};


// it is for login 

export const login = async (req, res) => {
  
  try {
    const {  email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }
  

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    res.cookie("token", token, { httpOnly: true , maxAge:7*24*60*60*1000,sameSite: 'Strict',secure:false});

    await user.save();
   return res.status(200).json({ message: "User logged in successfully", user, token });
  } catch (error) {
   return res.status(500).json({ message: "Error logging in user", error });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out user", error });
  }
};