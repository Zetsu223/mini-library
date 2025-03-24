const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const connectDB = require("../database");
const Book = require("../models/bookModel"); // Import the Book model

// GET All Books
router.get("/", async (req, res) => {
    try {
        const db = await connectDB();
        const books = await db.collection("books").find().toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error });
    }
});

// ADD a New Book
router.post("/", async (req, res) => {
    try {
        const { title, author, year, available } = req.body;

        // Create a new Book instance
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
            { _id: new ObjectId(bookId) }, // Convert to ObjectId
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

        await db.collection("books").deleteOne({ _id: new ObjectId(bookId) }); // Convert to ObjectId
        res.json({ message: "Book deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error });
    }
});

module.exports = router;
