class Book {
    constructor(title, author, year, available = true) {
        this.title = title;
        this.author = author;
        this.year = year;
        this.available = available;
    }
}

module.exports = Book;