const express = require("express");
const Internship = require("../models/Internship");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all internships
// Get all internships with student info
router.get("/", authMiddleware, async (req, res) => {
    try {
      const internships = await Internship.find()
        .populate("studentId", "name rollNo email");
      res.json(internships);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// Get a specific student
router.get("/:id", authMiddleware, async (req, res) => {
    try {
      // Find the student
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ message: "Student not found" });
      
      // Find related internships
      const internships = await Internship.find({ studentId: req.params.id });
      
      // Include internships in the student response
      const studentWithInternships = {
        ...student.toObject(),
        internships: internships
      };
      
      res.json(studentWithInternships);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

// Get internships by student ID
router.get("/student/:studentId", authMiddleware, async (req, res) => {
  try {
    const internships = await Internship.find({ studentId: req.params.studentId });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add new internship (Admin Only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    // Verify student exists
    const student = await Student.findById(req.body.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update internship (Admin Only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;