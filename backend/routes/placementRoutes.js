const express = require("express");
const multer = require("multer");
const path = require("path");
const Placement = require("../models/Placement");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Configure storage for offer letters
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/offerLetters");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

// Get all placements with student info
router.get("/", authMiddleware, async (req, res) => {
  try {
    const placements = await Placement.find()
      .populate("student", "name rollNo department");
    res.json(placements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get placement statistics
router.get("/statistics", authMiddleware, async (req, res) => {
  try {
    // Get total placements
    const totalPlacements = await Placement.countDocuments();
    
    // Get all packages to calculate avg and max
    const placements = await Placement.find({}, 'package');
    
    // Calculate average package
    let totalPackage = 0;
    let validPackages = 0;
    let highestPackage = 0;
    
    placements.forEach(placement => {
      const packageValue = parseFloat(placement.package);
      if (!isNaN(packageValue)) {
        totalPackage += packageValue;
        validPackages++;
        highestPackage = Math.max(highestPackage, packageValue);
      }
    });
    
    const avgPackage = validPackages > 0 ? (totalPackage / validPackages).toFixed(2) : 0;
    
    // Calculate placement rate (assuming total students information is available)
    const totalEligibleStudents = await Student.countDocuments({ batch: new Date().getFullYear() });
    const placementRate = totalEligibleStudents > 0 
      ? Math.round((totalPlacements / totalEligibleStudents) * 100)
      : 0;
    
    res.json({
      totalPlacements,
      avgPackage,
      highestPackage,
      placementRate
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to add placement with file upload
router.post("/", authMiddleware, upload.single("offerLetter"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const placementData = {
      ...req.body
    };
    
    // Add file path if an offer letter was uploaded
    if (req.file) {
      placementData.offerLetter = req.file.path;
    }
    
    const placement = new Placement(placementData);
    await placement.save();
    
    res.status(201).json(placement);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;