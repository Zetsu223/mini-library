require("dotenv").config();

const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/users");
const uri = process.env.MONGO_URI;

const app = express();
app.use(express.json());
app.use(cors());

// Use Routes
app.use("/books", bookRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
