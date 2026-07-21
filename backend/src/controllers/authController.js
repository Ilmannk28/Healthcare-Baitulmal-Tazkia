const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

const register = async (req, res) => {
  try {
    const {
      name,
      birth_date,
      gender,
      phone,
      password
    } = req.body;

    if (
      !name ||
      !birth_date ||
      !gender ||
      !phone ||
      !password 
    ) {
      return res.status(400).json({
        success: false,
        message: "Mohon lengkapi data pendaftaran"
      });
    }

    const checkValue = phone 
    const existingUser =
      await authModel.findByIndentifier(checkValue);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Nomor Telepon atau Email sudah terdaftar"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const userId =
      await authModel.createUser({
        name,
        birth_date,
        gender,
        phone: phone || null,
        password: hashedPassword
      });

    return res.status(201).json({
      success: true,
      message: "Register berhasil",
      userId
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


const login = async (req, res) => {

  try {

    const {
      identifier,
      password
    } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Nomor Telepon/Email dan Password wajib diisi"
      });
    }

    const user =
      await authModel.findByIndentifier(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Nomor Telepon atau password salah"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d"
        }
      );

    return res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  register,
  login
};