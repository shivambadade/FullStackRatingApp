const express = require("express");
const router = express.Router();
const { signup, login, updatePassword, registerNormalUser } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/signupbyuser", registerNormalUser);
router.post("/login", login);

router.put("/update-password", updatePassword);

module.exports = router;
