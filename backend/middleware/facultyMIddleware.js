module.exports = (req, res, next) => {
  // Check if user is faculty or admin
  if (req.user && (req.user.role === "faculty" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Faculty or admin role required." });
  }
};