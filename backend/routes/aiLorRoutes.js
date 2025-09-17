
const express = require("express");
const router = express.Router();
// Import Gemini controller handlers
const { analyzeLORRecommendations, testStudentData, generateSmartLOR, getRecommendedTemplates } = require("../controllers/aiLorController");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to ensure faculty/admin role
const isFaculty = (req, res, next) => {
  if (req.user && (req.user.role === "faculty" || req.user.role === "admin")) return next();
  return res.status(403).json({ message: "Access denied. Faculty role required." });
};

// Gemini-based AI endpoints
router.get("/analyze/:studentId", authMiddleware, isFaculty, analyzeLORRecommendations);
router.get("/test/:studentId", authMiddleware, isFaculty, testStudentData);
router.post("/generate", authMiddleware, isFaculty, generateSmartLOR);
router.get("/recommended-templates/:studentId", authMiddleware, isFaculty, getRecommendedTemplates);

module.exports = router;