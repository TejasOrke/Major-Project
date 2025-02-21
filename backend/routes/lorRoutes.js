const express = require("express");
const LOR = require("../models/LOR");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route   GET /api/lors
 * @desc    Get all LORs (Admin & Faculty)
 * @access  Admin & Faculty
 */
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const query = req.user.role === "faculty" ? { faculty: req.user.id } : {};
        
        const lors = await LOR.find(query)
            .populate("student", "name rollNo email")
            .populate("faculty", "name email")
            .sort({ issuedAt: -1 });

        res.json(lors);
    } catch (error) {
        console.error("Error fetching LORs:", error);
        res.status(500).json({ message: "Error fetching LORs" });
    }
});

/**
 * @route   GET /api/lors/:lorId
 * @desc    Get single LOR details
 * @access  Admin & Faculty
 */
router.get("/:lorId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const query = req.user.role === "faculty"
            ? { _id: req.params.lorId, faculty: req.user.id }
            : { _id: req.params.lorId };

        const lor = await LOR.findOne(query)
            .populate("student", "name rollNo email")
            .populate("faculty", "name email");

        if (!lor) {
            return res.status(404).json({ message: "LOR not found" });
        }

        res.json(lor);
    } catch (error) {
        console.error("Error fetching LOR:", error);
        res.status(500).json({ message: "Error fetching LOR" });
    }
});

/**
 * @route   POST /api/lors
 * @desc    Add new LOR (Faculty Only)
 * @access  Faculty
 */
router.post("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { student, issuedAt, lorDocument } = req.body;

        if (!student || !issuedAt || !lorDocument) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newLOR = new LOR({
            student,
            faculty: req.user.id,
            issuedAt,
            lorDocument,
        });

        const savedLOR = await newLOR.save();
        res.status(201).json(savedLOR);
    } catch (error) {
        console.error("Error adding LOR:", error);
        res.status(500).json({ message: "Error adding LOR" });
    }
});

/**
 * @route   PUT /api/lors/:lorId/status
 * @desc    Update LOR Status (Faculty Only)
 * @access  Faculty
 */
router.put("/:lorId/status", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { status, remarks } = req.body;

        const lor = await LOR.findOneAndUpdate(
            { _id: req.params.lorId, faculty: req.user.id },
            {
                $set: {
                    status,
                    remarks,
                    updatedAt: Date.now(),
                },
            },
            { new: true }
        ).populate("student", "name rollNo email")
         .populate("faculty", "name email");

        if (!lor) {
            return res.status(404).json({ message: "LOR not found or unauthorized" });
        }

        res.json(lor);
    } catch (error) {
        console.error("Error updating LOR status:", error);
        res.status(500).json({ message: "Error updating LOR status" });
    }
});

/**
 * @route   DELETE /api/lors/:lorId
 * @desc    Delete LOR (Admin & Faculty)
 * @access  Admin & Faculty
 */
router.delete("/:lorId", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "faculty") {
            return res.status(403).json({ message: "Access denied" });
        }

        const query = req.user.role === "faculty"
            ? { _id: req.params.lorId, faculty: req.user.id }
            : { _id: req.params.lorId };

        const lor = await LOR.findOneAndDelete(query);

        if (!lor) {
            return res.status(404).json({ message: "LOR not found or unauthorized" });
        }

        res.json({ message: "LOR deleted successfully" });
    } catch (error) {
        console.error("Error deleting LOR:", error);
        res.status(500).json({ message: "Error deleting LOR" });
    }
});

module.exports = router;
