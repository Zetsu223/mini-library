const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
let db = null;

// Function to Connect to MongoDB
async function connectDB() {
    if (db) return db; // Use existing connection
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db("LibroMini"); // Change this to your actual database name
    console.log("Connected to MongoDB");
    return db;
}

module.exports = connectDB;
