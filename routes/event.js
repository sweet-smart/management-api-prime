import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  getEventById
} from "../controller/event.js";
import { verifyUser } from "../middleware/auth.js";
import { isOrganizerOrAdmin } from "../middleware/admin.js";

const router = express.Router();

// Event routes
router.post("/", verifyUser, isOrganizerOrAdmin, createEvent);
router.get("/", getEvents);
router.put("/:id", verifyUser, isOrganizerOrAdmin, updateEvent);    // 👈 Added missing comma
router.delete("/:id", verifyUser, isOrganizerOrAdmin, deleteEvent);
router.post("/:id/rsvp", verifyUser, rsvpEvent);
router.get("/:id", getEventById);  // 👈 Added missing import and route

export default router; // 👈 This fixes your error
