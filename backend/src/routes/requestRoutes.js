// backend/src/routes/requestRoutes.js

const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const requestController = require("../controllers/requestController");
const { verifyToken }   = require("../middlewares/authMiddleware");

// ── Konfigurasi multer untuk upload dokumen ────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/documents";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext      = path.extname(file.originalname);
        const safeName = `doc_${Date.now()}_${file.fieldname}${ext}`;
        cb(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
        const ext     = path.extname(file.originalname).toLowerCase();
        allowed.includes(ext) ? cb(null, true) : cb(new Error("Format tidak didukung."));
    }
});

// Field dokumen yang diterima dari form
const docFields = upload.fields([
    { name: "ktp",          maxCount: 1 },
    { name: "kk",           maxCount: 1 },
    { name: "sktm",         maxCount: 1 },
    { name: "surat_rujukan",maxCount: 1 }
]);

// ── GET semua request ──────────────────────────────────────────────────────
router.get("/", verifyToken, requestController.getAllRequests);

// ── POST pemesanan per layanan ─────────────────────────────────────────────
router.post("/ambulance",  verifyToken, docFields, requestController.createAmbulanceRequest);
router.post("/wheelchair", verifyToken, docFields, requestController.createWheelchairRequest);
router.post("/khitan",     verifyToken, docFields, requestController.createKhitanRequest);

// ── PUT admin update status ────────────────────────────────────────────────
router.put("/admin/:id", verifyToken, requestController.updateStatus);

// ── PUT user edit detail ───────────────────────────────────────────────────
router.put("/:id", verifyToken, requestController.updateRequestDetail);

// ── GET dokumen per request ────────────────────────────────────────────────
router.get("/:id/documents", verifyToken, requestController.getDocuments);

// ── PUT upload/update dokumen ──────────────────────────────────────────────
router.put("/:id/documents", docFields, verifyToken, requestController.uploadDocument);

module.exports = router;