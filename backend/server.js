const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(); 

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes')
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/stores', storeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));