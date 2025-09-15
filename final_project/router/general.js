const express = require('express');
let books = require("./booksdb.js");
const public_users = express.Router();

// Task 1 - Get all books
public_users.get('/', function (req, res) {
    const bookList = Object.keys(books).map(isbn => ({ isbn, ...books[isbn] }));
    return res.status(200).json({ books: bookList });
});

// Task 2 - Get book details by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) return res.status(200).json(books[isbn]);
    return res.status(404).json({ message: "Book not found" });
});

// Task 3 - Get books by author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const results = Object.keys(books)
        .filter(k => books[k].author.toLowerCase() === author)
        .map(k => ({ isbn: k, ...books[k] }));
    if (results.length) return res.status(200).json({ books: results });
    return res.status(404).json({ message: "No books found for the given author" });
});

// Task 4 - Get books by title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    const results = Object.keys(books)
        .filter(k => books[k].title.toLowerCase() === title)
        .map(k => ({ isbn: k, ...books[k] }));
    if (results.length) return res.status(200).json({ books: results });
    return res.status(404).json({ message: "No books found for the given title" });
});

// Task 5 - Get book reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) return res.status(200).json(books[isbn].reviews);
    return res.status(404).json({ message: "Book not found" });
});

public_users.get('/async', async (req, res) => {
    try {
        const bookList = await new Promise((resolve, reject) => {
            setTimeout(() => resolve(Object.values(books)), 100);
        });
        return res.status(200).json({ books: bookList });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});
// Task 11: Get book details by ISBN using Promises
public_users.get('/async/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) resolve({ isbn: isbn, ...books[isbn] });
            else reject("Book not found");
        }, 100); // simula delay async
    })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

// Task 12: Get book details by author using Promises
public_users.get('/async/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const results = [];
        keys.forEach(k => {
            if (books[k].author && books[k].author.toLowerCase() === author) {
                results.push({ isbn: k, ...books[k] });
            }
        });
        setTimeout(() => {
            if (results.length > 0) resolve(results);
            else reject("No books found for the given author");
        }, 100);
    })
    .then(books => res.status(200).json({ books }))
    .catch(err => res.status(404).json({ message: err }));
});
// Task 13: Get book details by title using Promises
public_users.get('/async/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        const results = [];
        keys.forEach(k => {
            if (books[k].title && books[k].title.toLowerCase() === title) {
                results.push({ isbn: k, ...books[k] });
            }
        });
        setTimeout(() => {
            if (results.length > 0) resolve(results);
            else reject("No books found for the given title");
        }, 100);
    })
    .then(books => res.status(200).json({ books }))
    .catch(err => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
