const express = require("express");
const { getAllLORs, addLOR } = require("../controllers/lorController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getAllLORs);
router.post("/", authMiddleware, addLOR);

module.exports = router;
