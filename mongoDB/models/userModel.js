const { ObjectId } = require("mongodb"); // Import ObjectId from MongoDB

class User {
    constructor(name, yearlvl, username, email, password, borrowedBooks = []) {
        this._id = new ObjectId();  // Generate a new MongoDB ObjectId for _id field
        this.name = name;
        this.yearlvl = yearlvl;
        this.username = username;
        this.email = email;
        this.password = this.hashPassword(password);
        this.borrowedBooks = borrowedBooks;
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
