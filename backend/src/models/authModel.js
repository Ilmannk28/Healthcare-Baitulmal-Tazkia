// models/authModel.js
const db = require("../config/database");

const findByIndentifier = async (identifier) => {

    const [rows] =
        await db.query(
            "SELECT * FROM users WHERE phone = ?",
            [identifier]
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
                phone,
                password
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                user.name,
                user.birth_date,
                user.gender,
                user.phone || null,
                user.password
            ]
        );

    return result.insertId;
};

module.exports = {
    findByIndentifier,
    createUser
};