const express = require("express");
const {
    getAllStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllStudents);
router.get("/:id", authMiddleware, getStudentById);
router.post("/", authMiddleware, addStudent);
router.put("/:id", authMiddleware, updateStudent);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;
