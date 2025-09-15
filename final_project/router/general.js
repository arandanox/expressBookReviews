const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Task 1
 * Get the book list available in the shop
 * Use JSON.stringify for neat output as requested
 */
public_users.get('/', function (req, res) {
  // Convertimos el objeto 'books' en un array de libros
  // pero como el enunciado sugiere JSON.stringify para "mostrarlo bonito",
  // devolvemos un string indentado
  try {
    const pretty = JSON.stringify(books, null, 4);
    return res.status(200).send(pretty);
  } catch (err) {
    return res.status(500).json({ message: "Error serializing books", error: err.message });
  }
});

/**
 * Task 2
 * Get book details based on ISBN
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) return res.status(400).json({ message: "ISBN required" });

  const book = books[isbn];
  if (book) {
    return res.status(200).json({ book: book });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

/**
 * Task 3
 * Get book details based on author
 */
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  if (!author) return res.status(400).json({ message: "Author required" });

  const keys = Object.keys(books);
  const results = [];

  for (let k of keys) {
    if (books[k].author && books[k].author.toLowerCase() === author.toLowerCase()) {
      // include isbn so the client knows which book it is
      results.push(Object.assign({ isbn: k }, books[k]));
    }
  }

  if (results.length > 0) {
    return res.status(200).json({ books: results });
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

/**
 * Task 4
 * Get all books based on title
 */
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  if (!title) return res.status(400).json({ message: "Title required" });

  const keys = Object.keys(books);
  const results = [];

  for (let k of keys) {
    if (books[k].title && books[k].title.toLowerCase() === title.toLowerCase()) {
      results.push(Object.assign({ isbn: k }, books[k]));
    }
  }

  if (results.length > 0) {
    return res.status(200).json({ books: results });
  } else {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

/**
 * Task 5
 * Get book review
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) return res.status(400).json({ message: "ISBN required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  // If there are no reviews, return empty object
  return res.status(200).json({ reviews: book.reviews || {} });
});

/**
 * Task 6
 * Register a new user
 * Body expected: { username: "...", password: "..." }
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Validate username (basic validation delegated to isValid)
  if (!isValid(username)) {
    return res.status(400).json({ message: "Username is not valid" });
  }

  // Add user
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
