import User from "../models/user.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, adminKey } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // If role is admin via API, require ADMIN_KEY
    let userRole = role || "user";
    if (userRole === "admin") {
      if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin key — cannot create admin",
        });
      }
    }

    const user = await User.create({
      username,
      email: normalizedEmail,
      password,
      role: userRole,
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    // handle duplicate key error gracefully
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
