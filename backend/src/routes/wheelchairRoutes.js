// backend/src/routes/wheelchairRoutes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/wheelchairController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/",       ctrl.getAll);
router.post("/",      verifyToken, ctrl.create);
router.put("/:id",    verifyToken, ctrl.update);
router.delete("/:id", verifyToken, ctrl.remove);

module.exports = router;