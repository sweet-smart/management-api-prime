export const isOrganizerOrAdmin = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  if (req.user.role === "organizer" || req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Access denied" });
};

export const isAdmin = (req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  if (req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admins only" });
};
