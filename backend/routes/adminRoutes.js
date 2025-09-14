const express = require("express");
const router = express.Router();
const {
    addUser,
    addStore,
    getDashboardStats,
    getAllUsers,
    getAllStores,
} = require("../controllers/adminController");

const allowAdmin = (req, res, next) => {
    next();
};

router.post("/users", allowAdmin, addUser);
router.post("/stores", allowAdmin, addStore);
router.get("/dashboard-stats", allowAdmin, getDashboardStats);
router.get("/users", allowAdmin, getAllUsers);
router.get("/stores", allowAdmin, getAllStores);
module.exports = router;