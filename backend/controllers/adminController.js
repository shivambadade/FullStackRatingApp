const db = require("../config/db");
const bcrypt = require("bcrypt");
const util = require("util");

const query = util.promisify(db.query).bind(db);

// Admin can Add new user 
const addUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await query(
            "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, address, role]
        );

        res.status(201).json({ message: "User added successfully", userId: result.insertId });
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// Admin can Add new store 
const addStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        if (!name) return res.status(400).json({ message: "Store name is required" });

        const result = await query(
            "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
            [name, email || null, address || null, owner_id || null]
        );

        res.status(201).json({ message: "Store added successfully", storeId: result.insertId });
    } catch (err) {
        console.error("Error adding store:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const usersResult = await query("SELECT COUNT(*) AS totalUsers FROM users");
        const storesResult = await query("SELECT COUNT(*) AS totalStores FROM stores");
        const ratingsResult = await query("SELECT COUNT(*) AS totalRatings FROM ratings");

        res.json({
            totalUsers: usersResult[0].totalUsers,
            totalStores: storesResult[0].totalStores,
            totalRatings: ratingsResult[0].totalRatings,
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let sql = "SELECT id, name, email, address, role FROM users";
        const { name, email, address, role } = req.query;
        const filters = [];
        const params = [];

        if (name) { filters.push("name LIKE ?"); params.push(`%${name}%`); }
        if (email) { filters.push("email LIKE ?"); params.push(`%${email}%`); }
        if (address) { filters.push("address LIKE ?"); params.push(`%${address}%`); }
        if (role) { filters.push("role = ?"); params.push(role); }

        if (filters.length) sql += " WHERE " + filters.join(" AND ");
        sql += " ORDER BY name ASC";

        const results = await query(sql, params);
        res.json(results);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

const getAllStores = async (req, res) => {
    try {
        let sql = `
            SELECT s.id, s.name, s.email, s.address, u.name AS owner_name,
            (SELECT AVG(rating) FROM ratings r WHERE r.store_id = s.id) AS avgRating
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
        `;

        const { name, email, address } = req.query;
        const filters = [];
        const params = [];

        if (name) { filters.push("s.name LIKE ?"); params.push(`%${name}%`); }
        if (email) { filters.push("s.email LIKE ?"); params.push(`%${email}%`); }
        if (address) { filters.push("s.address LIKE ?"); params.push(`%${address}%`); }

        if (filters.length) sql += " WHERE " + filters.join(" AND ");
        sql += " ORDER BY s.name ASC";

        const results = await query(sql, params);
        res.json(results);
    } catch (err) {
        console.error("Error fetching stores:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

module.exports = {
    addUser,
    addStore,
    getDashboardStats,
    getAllUsers,
    getAllStores,
};
