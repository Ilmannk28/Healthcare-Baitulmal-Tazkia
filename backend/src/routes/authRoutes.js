// routes/authRoutes.js

const express = require("express");

const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

router.post("/register", (req, res, next) => {
    console.log("REGISTER HIT");
    next();
}, register);

router.post("/login", login);

module.exports = router;