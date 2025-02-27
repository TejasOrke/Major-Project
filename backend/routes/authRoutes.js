const express = require("express");
const { requestRegistration, loginUser, approveUser, rejectUser } = require("../controllers/authController");

const router = express.Router();

router.post("/request-registration", requestRegistration);
router.post("/login", loginUser);
router.get("/approve-user", approveUser);
router.get("/reject-user", rejectUser);

module.exports = router;
