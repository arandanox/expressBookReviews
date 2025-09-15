const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users store - shared with general.js via require('./auth_users.js').users
let users = [];

/**
 * isValid - basic username validation
 * Returns true if username is a non-empty string
 */
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

/**
 * authenticatedUser - checks credentials against users array
 */
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

/**
 * Task 7 - Login endpoint for registered users
 * POST /customer/login
 * Body: { username, password }
 * Returns: JWT token (signed with secret 'access')
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Sign JWT - secret 'access' and expiry (e.g., 1h)
  const token = jwt.sign({ username }, 'access', { expiresIn: '1h' });

  return res.status(200).json({ message: "Logged in successfully", token });
});

/**
 * Helper to extract token from Authorization header.
 * Accepts: "Bearer <token>" or raw token.
 */
function getTokenFromHeader(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return authHeader;
}

/**
 * Task 8 - Add or modify a book review
 * PUT /customer/auth/review/:isbn?review=...
 * The username is retrieved from the JWT (in Authorization header).
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  if (!isbn) return res.status(400).json({ message: "ISBN required" });
  if (!reviewText) return res.status(400).json({ message: "Review is required as a query parameter (?review=...)" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const decoded = jwt.verify(token, 'access');
    const username = decoded.username;

    // Create reviews object if not present
    if (!book.reviews) book.reviews = {};

    // Add or update review for this username
    book.reviews[username] = reviewText;

    return res.status(200).json({ message: "Review added/updated", reviews: book.reviews });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

/**
 * Task 9 - Delete a book review for the logged-in user
 * DELETE /customer/auth/review/:isbn
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!isbn) return res.status(400).json({ message: "ISBN required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ message: "Authorization token required" });

  try {
    const decoded = jwt.verify(token, 'access');
    const username = decoded.username;

    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review by this user not found" });
    }

    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: book.reviews });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
