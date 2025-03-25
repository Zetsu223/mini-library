const bcrypt = require("bcryptjs");

class User {
    constructor(name, yearlvl, username, email, password, borrowedBooks = []) {
        this.name = name;           // Full name
        this.yearlvl = yearlvl;     // Year Level
        this.username = username;   // Unique Username
        this.email = email;         // Email
        this.password = this.hashPassword(password); // Hashed Password
        this.borrowedBooks = borrowedBooks; // List of borrowed books
    }

    // Method to hash password
    hashPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    // Method to compare passwords (for login)
    comparePassword(inputPassword) {
        return bcrypt.compareSync(inputPassword, this.password);
    }
}

module.exports = User;
