// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const {
    addUser,
    addStore,
    getDashboardStats,
    getAllUsers,
    getAllStores,
} = require("../controllers/adminController");

// ✅ Middleware to check admin role
// For now, we just allow everything (since no auth middleware is implemented yet)
const allowAdmin = (req, res, next) => {
    // Later you can verify JWT or session here
    next();
};

// ---------- ROUTES ----------

// Add new user
router.post("/users", allowAdmin, addUser);

// Add new store
router.post("/stores", allowAdmin, addStore);

// Get dashboard stats
router.get("/dashboard-stats", allowAdmin, getDashboardStats);

// Get all users
router.get("/users", allowAdmin, getAllUsers);

// Get all stores
router.get("/stores", allowAdmin, getAllStores);

module.exports = router;
