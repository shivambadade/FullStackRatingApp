// backend/controllers/storeController.js
const db = require("../config/db");

const getStoreDashboard = (req, res) => {
    const store_ownerId = req.user.id;

    const storeQuery = "SELECT id, name, address FROM stores WHERE owner_id = ?";
    db.query(storeQuery, [store_ownerId], (err, storeResults) => {
        if (err) {
            console.error("Error fetching store:", err);
            return res.status(500).json({ message: "Error fetching store details" });
        }

        if (storeResults.length === 0) {
            return res.status(404).json({ message: "No store found for this owner" });
        }

        const store = storeResults[0];

        const ratingQuery = `
            SELECT COUNT(*) AS totalRatings, 
                   AVG(rating) AS averageRating
            FROM ratings 
            WHERE store_id = ?
        `;

        db.query(ratingQuery, [store.id], (err, ratingResults) => {
            if (err) {
                console.error("Error fetching ratings:", err);
                return res.status(500).json({ message: "Error fetching ratings data" });
            }

            const { totalRatings, averageRating } = ratingResults[0];

            const safeAverage = averageRating ? Number(averageRating) : 0;

            return res.json({
                message: "Store dashboard data fetched successfully",
                store: {
                    id: store.id,
                    name: store.name,
                    address: store.address,
                    totalRatings,
                    averageRating: Number(safeAverage.toFixed(2)) // ✅ no more crash
                }
            });
        });
    });
};

const getStoreRatings = (req, res) => {
    const store_ownerId = req.user.id;
    const query = `
        SELECT r.id, r.rating, r.comment, r.created_at, u.name AS userName
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE s.owner_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(query, [store_ownerId], (err, results) => {
        if (err) {
            console.error("Error fetching store ratings:", err);
            return res.status(500).json({ message: "Error fetching store ratings" });
        }
        res.json({ ratings: results });
    });
};

const getAverageRating = (req, res) => {
    const store_ownerId = req.user.id;
    const query = `
        SELECT AVG(r.rating) AS averageRating
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        WHERE s.owner_id = ?
    `;

    db.query(query, [store_ownerId], (err, results) => {
        if (err) {
            console.error("Error fetching average rating:", err);
            return res.status(500).json({ message: "Error fetching average rating" });
        }

        const safeAverage = results[0].averageRating ? Number(results[0].averageRating) : 0;
        res.json({ averageRating: Number(safeAverage.toFixed(2)) });
    });
};

// Get all stores with user's submitted rating
const getAllStoresForUser = (req, res) => {
    const userId = req.user.id;
    const query = `
    SELECT s.id, s.name, s.address,
           AVG(r.rating) AS averageRating,
           (SELECT rating FROM ratings r2 WHERE r2.store_id = s.id AND r2.user_id = ?) AS userRatingValue,
           (SELECT comment FROM ratings r2 WHERE r2.store_id = s.id AND r2.user_id = ?) AS userComment
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    GROUP BY s.id
  `;
    db.query(query, [userId, userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching stores" });

        const data = results.map((store) => ({
            ...store,
            userRating: store.userRatingValue
                ? { rating: store.userRatingValue, comment: store.userComment }
                : null,
            averageRating: store.averageRating ? Number(store.averageRating) : 0, // ✅ ensure number
        }));

        res.json(data);
    });
};

// Submit or update rating
const submitUserRating = (req, res) => {
    const userId = req.user.id;
    const { storeId, rating, comment } = req.body;

    if (!storeId || !rating) return res.status(400).json({ message: "Store ID and rating required" });

    const checkQuery = "SELECT * FROM ratings WHERE user_id = ? AND store_id = ?";
    db.query(checkQuery, [userId, storeId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length > 0) {
            // Update existing
            const updateQuery = "UPDATE ratings SET rating = ?, comment = ? WHERE id = ?";
            db.query(updateQuery, [rating, comment || null, results[0].id], (err2) => {
                if (err2) return res.status(500).json({ message: "Database error" });
                res.json({ message: "Rating updated successfully" });
            });
        } else {
            // Insert new
            const insertQuery = "INSERT INTO ratings (store_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
            db.query(insertQuery, [storeId, userId, rating, comment || null], (err2) => {
                if (err2) return res.status(500).json({ message: "Database error" });
                res.json({ message: "Rating submitted successfully" });
            });
        }
    });
};



module.exports = {
    getStoreDashboard,
    getStoreRatings,
    getAverageRating,
    getAllStoresForUser,
    submitUserRating,
};
