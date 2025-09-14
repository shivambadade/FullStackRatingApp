const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


const registerNormalUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        if (!name || !email || !address || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (result.length > 0) {
                return res.status(409).json({ message: "Email already registered" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)",
                [name, email, address, hashedPassword, "normaluser"],
                (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error("Database error:", insertErr);
                        return res.status(500).json({ message: "Server error" });
                    }
                    res.status(201).json({ message: "User registered successfully" });
                }
            );
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const signup = (req, res) => {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, password required" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, address, role || "normaluser"], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "User registered successfully", userId: result.insertId });
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(400).json({ message: "Invalid credentials" });

        const user = results[0];
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: "8h" }
        );



        res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, role: user.role } });
    });
};

const updatePassword = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET); 

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new password required" });
        }

        const sql = "SELECT password FROM users WHERE id = ?";
        db.query(sql, [decoded.id], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (results.length === 0) return res.status(404).json({ message: "User not found" });

            const isValid = bcrypt.compareSync(oldPassword, results[0].password);
            if (!isValid) return res.status(400).json({ message: "Old password is incorrect" });

            const hashed = bcrypt.hashSync(newPassword, 10);
            db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, decoded.id], (err2) => {
                if (err2) return res.status(500).json({ message: "Database error" });
                res.json({ message: "Password updated successfully" });
            });
        });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { signup, login, updatePassword, registerNormalUser};
