require("dotenv").config();
const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const axios = require("axios"); // Fetch data from OpenLibrary
const bookRoutes = require("./routes/books");
const userRoutes = require("./routes/users");

const uri = process.env.MONGO_URI;
const DB_NAME = "LibroMini";
const COLLECTION_NAME = "books";

const app = express();
app.use(express.json());
app.use(cors());

// Use Routes
app.use("/books", bookRoutes);
app.use("/users", userRoutes);

// Function to fetch book data (ISBN, cover, and year)
async function fetchBookData(title) {
  try {
    console.log(`🔍 Searching for: "${title}"`);
    
    // First API call: Search by title
    const searchResponse = await axios.get(`https://openlibrary.org/search.json`, {
      params: { title, limit: 1 }
    });

    if (!searchResponse.data.docs.length) {
      console.log(`⚠️ No results found for "${title}"`);
      return { isbn: null, coverUrl: null, year: null };
    }

    const bookData = searchResponse.data.docs[0]; // First matching book
    const workKey = bookData.key; // Unique Open Library Work Key (e.g., "/works/OL12345W")

    console.log(`📌 Found book key: ${workKey}`);

    // Second API call: Fetch details using Work Key
    const detailsResponse = await axios.get(`https://openlibrary.org${workKey}.json`);

    // Extract ISBN (some books store it under "identifiers")
    const isbn = detailsResponse.data.identifiers?.isbn_13?.[0] ||
                 detailsResponse.data.identifiers?.isbn_10?.[0] || null;

    // Extract Cover Image
    const coverUrl = bookData.cover_i
      ? `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`
      : null;

    // Extract Published Year
    const publishYear = bookData.first_publish_year || null;

    console.log(`✅ ISBN: ${isbn || "N/A"}, Cover: ${coverUrl || "N/A"}, Year: ${publishYear || "N/A"}`);
    return { isbn, coverUrl, year: publishYear };
  } catch (error) {
    console.error(`❌ API error for "${title}":`, error.message);
    return { isbn: null, coverUrl: null, year: null };
  }
}

// Function to update book details in MongoDB
async function updateBooks() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const booksCollection = db.collection(COLLECTION_NAME);

    // Fetch books missing any of the fields
    const books = await booksCollection.find({
      $or: [{ isbn: { $exists: false } }, { cover: { $exists: false } }, { year: { $exists: false } }]
    }).toArray();

    for (const book of books) {
      const { isbn, coverUrl, year } = await fetchBookData(book.title);

      const updateFields = {};
      if (isbn) updateFields.isbn = isbn;
      if (coverUrl) updateFields.cover = coverUrl;
      if (year) updateFields.year = year;

      if (Object.keys(updateFields).length > 0) {
        await booksCollection.updateOne({ _id: book._id }, { $set: updateFields });
        console.log(`🔄 Updated "${book.title}"`);
      } else {
        console.log(`⚠️ No data found for "${book.title}"`);
      }
    }
  } catch (error) {
    console.error("❌ Database error:", error.message);
  } finally {
    await client.close();
  }
}

// Run update function on server start
updateBooks();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
