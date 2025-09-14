const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT and user role
const verifyToken = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log("🔍 Decoded Token Payload:", decoded); // <-- ADD THIS
            req.user = decoded;

            // If roles array is provided, check if user role is allowed
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: Insufficient rights" });
            }

            next();
        } catch (err) {
            console.error("JWT verification failed:", err.message);
            return res.status(401).json({ message: "Invalid token" });
        }
    };
};

module.exports = { verifyToken };
