const express = require("express");
const router = express.Router();
const { signup, login, updatePassword, registerNormalUser } = require("../controllers/authController");

// Public routes
router.post("/signup", signup);
router.post("/signupbyuser", registerNormalUser);
router.post("/login", login);

// Protected route (frontend must send JWT)
router.put("/update-password", updatePassword);

module.exports = router;
