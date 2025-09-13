import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbsql.js";
import userRoutes from "./routes/user.js";
import eventRoutes from "./routes/event.js";
import User from "./models/user.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Connect DB and optionally seed admin
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // Optional auto-seed admin from .env
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASS) {
      const existing = await User.findOne({
        email: process.env.ADMIN_EMAIL.toLowerCase(),
      });
      if (!existing) {
        const bcrypt = (await import("bcryptjs")).default;
        const hashed = await bcrypt.hash(process.env.ADMIN_PASS, 12);
        await User.create({
          username: "admin",
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          password: hashed,
          role: "admin",
        });
        console.log("✅ Admin seeded from .env (ADMIN_EMAIL/ADMIN_PASS).");
      } else {
        console.log("⚡ Admin already exists — skipping seed.");
      }
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();
