const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authModel = require("../models/authModel");

const register = async (req, res) => {
  try {
    const {
      name,
      birth_date,
      gender,
      email,
      password
    } = req.body;

    if (
      !name ||
      !birth_date ||
      !gender ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi"
      });
    }

    const existingUser =
      await authModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const userId =
      await authModel.createUser({
        name,
        birth_date,
        gender,
        email,
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
      email,
      password
    } = req.body;

    const user =
      await authModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email tidak ditemukan"
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