const express = require("express");
const router = express.Router();
const { getStoreDashboard, getStoreRatings, getAverageRating, getAllStoresForUser, submitUserRating } = require("../controllers/storeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/dashboard", verifyToken(["store_owner"]), getStoreDashboard);
router.get("/ratings", verifyToken(["store_owner"]), getStoreRatings);
router.get("/average-rating", verifyToken(["store_owner"]), getAverageRating);

router.get("/all", verifyToken(["normaluser"]), getAllStoresForUser);
router.post("/rate", verifyToken(["normaluser"]), submitUserRating);

module.exports = router;
