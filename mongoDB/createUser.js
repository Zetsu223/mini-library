const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "LibroMini";
const collectionName = "users";

async function createUser() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection(collectionName);

        // Hash password
        const hashedPassword = await bcrypt.hash("password123", 10);
        const newUser = { name: "Admin User", username: "admin", email: "admin@libromini.com", password: hashedPassword, borrowedBooks: [] };

        await usersCollection.insertOne(newUser);
        console.log("User Created Successfully!");
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

createUser();