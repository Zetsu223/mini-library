const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const connectDB = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Import the User model
require("dotenv").config();

// GET All Users
router.get("/", async (req, res) => {
    try {
        const db = await connectDB();
        const users = await db.collection("users").find().toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
});

// ADD a New User (Register)
router.post("/", async (req, res) => {
    try {
        const { name, email, password, borrowedBooks } = req.body;

        const db = await connectDB();
        const usersCollection = db.collection("users");

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new User instance
        const newUser = new User(name, email, hashedPassword, borrowedBooks || []);

        await usersCollection.insertOne(newUser);
        res.json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error adding user", error });
    }
});

// User Login Route
router.post("/login", async (req, res) => {
    try {
        console.log("Login attempt:", req.body); // Debug request payload

        const { username, password } = req.body;
        const db = await connectDB();
        const user = await db.collection("users").findOne({ username });

        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("Incorrect password");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Ensure JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in the environment variables.");
            return res.status(500).json({ message: "Server error. Try again later." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { name: user.name, username: user.username } });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



// UPDATE a User (by ID)
router.put("/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.params.id;
        const updatedUser = req.body;

        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: updatedUser }
        );

        res.json({ message: "User updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
});

// DELETE a User (by ID)
router.delete("/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const userId = req.params.id;

        await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
        res.json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
});


// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = user; // Attach decoded user info to request
        next();
    });
}



// Get current user details
router.get("/current", authenticateToken, async (req, res) => {
    try {
        const db = await connectDB();
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { name: 1, username: 1, email: 1 } } // Only return necessary fields
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data", error });
    }
});


module.exports = router;
