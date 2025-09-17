const express = require("express");
const Student = require("../models/Student");
const Internship = require("../models/Internship");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/students - list (basic fields for table)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().select("name rollNo email cgpa skills");
    res.json(students);
  } catch (error) {
    console.error('[Students] List error', error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/students/:id - detailed record with embedded internships from separate collection
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const internships = await Internship.find({ studentId: req.params.id }).lean();

    res.json({
      ...student.toObject(),
      internships
    });
  } catch (error) {
    console.error('[Students] Detail error', error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/students - create (admin only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  try {
    const { skills, cgpa, ...rest } = req.body;
    const student = new Student({ ...rest, cgpa, skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []) });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    console.error('[Students] Create error', error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/students/:id - update
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { skills, cgpa, ...rest } = req.body;
    const update = { ...rest };
    if (cgpa !== undefined) update.cgpa = cgpa;
    if (skills !== undefined) update.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    const student = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error('[Students] Update error', error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/students/:id - delete (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('[Students] Delete error', error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;