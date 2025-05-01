const express = require("express");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all students
router.get("/", authMiddleware, async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get a specific student
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// In your studentRoutes.js file
router.get("/", authMiddleware, async (req, res) => {
    try {
      const students = await Student.find().select("name rollNo email");
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

// Add new student (Admin Only)
router.post("/", authMiddleware, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    try {
        const student = new Student(req.body);
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// In your studentRoutes.js backend file
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
module.exports = router;