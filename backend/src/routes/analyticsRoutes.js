// backend/src/routes/analyticsRoutes.js

const express    = require("express");
const router     = express.Router();
const { getDashboard } = require("../controllers/analyticsController");
const { verifyToken }  = require("../middlewares/authMiddleware");

// GET /api/analytics/dashboard
router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;