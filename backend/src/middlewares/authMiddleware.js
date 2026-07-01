// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Ambil token dari header request frontend
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak, token tidak ditemukan!"
    });
  }

  try {
    // Verifikasi menggunakan JWT_SECRET dari .env
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Simpan data user (id, role) ke object req
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa!"
    });
  }
};

module.exports = { verifyToken };