import Event from "../models/event.js";

// Utility: check if user can modify event
const canModify = (event, user) => {
  return (
    event.organizer.toString() === user.id.toString() || user.role === "admin"
  );
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    if (!["organizer", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Only organizers or admins can create events" });
    }

    const { title, description, date, location } = req.body;
    if (!title || !date || !location) {
      return res
        .status(400)
        .json({ message: "title, date and location are required" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user.id,
    });

    res.status(201).json({ message: "Event created", data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "username email role")
      .populate("participants", "username email");
    res.json({ count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "username email role")
      .populate("participants", "username email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!canModify(event, req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ message: "Event updated", data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!canModify(event, req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RSVP to Event
export const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "Already RSVPed" });
    }

    event.participants.push(req.user.id);
    await event.save();
    res.json({ message: "RSVP successful", data: event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
