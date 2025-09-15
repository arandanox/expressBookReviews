const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
        const decoded = jwt.verify(token, "contrasena"); // usar la misma key que al generar JWT
        req.username = decoded.username; // asigna el username al request
        next(); // continúa a la ruta
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
});

 
const PORT =5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
