// models/authModel.js
const db = require("../config/database");

const findByEmail = async (email) => {

    const [rows] =
        await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

    return rows[0];
};

const createUser = async (user) => {

    const [result] =
        await db.query(
            `
            INSERT INTO users
            (
                name,
                birth_date,
                gender,
                email,
                password
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                user.name,
                user.birth_date,
                user.gender,
                user.email,
                user.password
            ]
        );

    return result.insertId;
};

module.exports = {
    findByEmail,
    createUser
};