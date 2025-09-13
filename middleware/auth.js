import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
