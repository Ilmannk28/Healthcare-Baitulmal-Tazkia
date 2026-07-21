const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Ambil token dari header request frontend
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak, token tidak ditemukan!"
    });
  }

  try {
    // Verifikasi menggunakan JWT_SECRET dari .env
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user (id, role) ke object req
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa!"
    });
  }
};

module.exports = { verifyToken };