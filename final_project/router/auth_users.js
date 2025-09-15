const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => users.some(u => u.username === username);

// Authenticate user
const authenticatedUser = (username, password) =>
    users.some(u => u.username === username && u.password === password);

// Register
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required" });
    if (isValid(username)) return res.status(400).json({ message: "Username already exists" });

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!authenticatedUser(username, password)) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ username }, "contrasena", { expiresIn: "1h" });
    return res.status(200).json({ message: "Logged in", token });
});

// Middleware for auth
regd_users.use("/auth/*", (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Token required" });

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.username = decoded.username;
        next();
    });
});

// Add or modify book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.query.username || "alex"; // <- usa un usuario de prueba
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
    if (!review) return res.status(400).json({ message: "Review required" });

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});


// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

    if (books[isbn].reviews[req.username]) {
        delete books[isbn].reviews[req.username];
        return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
    }
    return res.status(404).json({ message: "Review by user not found" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
