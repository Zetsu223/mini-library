const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const connectDB = require("../database");
const Book = require("../models/bookModel"); // Import the Book model
const authenticateToken = require("../middleware/authMiddleware"); // Adjust the path if needed


// GET All Books
router.get("/", async (req, res) => {
    try {
        const db = await connectDB();
        const books = await db.collection("books").find().toArray();
        console.log("📚 Books from DB:", books);
        res.json(books);
    } catch (error) {
        console.error("❌ Error fetching books:", error);
        res.status(500).json({ message: "Error fetching books", error });
    }
});

// ADD a New Book
router.post("/", async (req, res) => {
    try {
        const { title, author, year, available } = req.body;

        const newBook = new Book(title, author, year, available);

        const db = await connectDB();
        await db.collection("books").insertOne(newBook);
        res.json({ message: "Book added successfully!", book: newBook });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error });
    }
});

// UPDATE a Book (by ID)
router.put("/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const bookId = req.params.id;
        const updatedBook = req.body;

        await db.collection("books").updateOne(
            { _id: new ObjectId(bookId) },
            { $set: updatedBook }
        );

        res.json({ message: "Book updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error });
    }
});

// DELETE a Book (by ID)
router.delete("/:id", async (req, res) => {
    try {
        const db = await connectDB();
        const bookId = req.params.id;

        await db.collection("books").deleteOne({ _id: new ObjectId(bookId) });
        res.json({ message: "Book deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error });
    }
});

// BORROW a Book (Updated Version)
router.post("/borrow", authenticateToken, async (req, res) => {
    try {
        const { title, genre, userId } = req.body;
        const db = await connectDB();

        // Ensure the user exists
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Ensure the book exists
        const book = await db.collection("books").findOne({ title, genre });
        if (!book) {
            return res.status(400).json({ message: "Book not found" });
        }

        // Add book to borrowedBooks array in user document
        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) }, // Find user by ObjectId
            { 
                $push: { 
                    borrowedBooks: { title, genre, borrowedAt: new Date() }
                }
            });

        res.json({ success: true, message: "Book borrowed successfully" });
    } catch (error) {
        console.error("Error borrowing book:", error);
        res.status(500).json({ message: "Error borrowing book", error });
    }
});


// RETURN a Book
router.post("/return", async (req, res) => {
    try {
        const { title, userId } = req.body;

        // Validate inputs
        if (!title || !userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid input." });
        }

        const userObjectId = new ObjectId(userId);
        const db = await connectDB();
        const usersCollection = db.collection("users");

        // Find user
        const user = await usersCollection.findOne({ _id: userObjectId });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Find the book and update the return date
        const borrowedBook = user.borrowedBooks.find(book => book.title === title && !book.returnedOn);

        if (!borrowedBook) {
            return res.status(404).json({ success: false, message: "Book not found or already returned." });
        }

        const returnedOn = new Date().toISOString().split("T")[0];

        // Update the book in the user's borrowedBooks array
        await usersCollection.updateOne(
            { _id: userObjectId },
            { $set: { 
                "borrowedBooks.$[elem].returnedOn": returnedOn 
            }},
            { arrayFilters: [{ "elem.title": title, "elem.returnedOn": null }] }
        );

        res.json({ success: true, message: `"${title}" has been returned!` });
    } catch (error) {
        console.error("❌ Return error:", error);
        res.status(500).json({ success: false, message: "Internal server error.", error });
    }
});



module.exports = router;
