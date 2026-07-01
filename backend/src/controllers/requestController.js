// backend/src/controllers/requestController.js

const requestModel = require("../models/requestModel");

// ── GET semua request ──────────────────────────────────────────────────────
const getAllRequests = async (req, res) => {
    try {
        const data = await requestModel.getAllRequests(req.user.id, req.user.role);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST buat request ambulans ─────────────────────────────────────────────
const createAmbulanceRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            ambulance_id, patient_name, phone, gender,
            birth_date, address, patient_condition, destination
        } = req.body;

        if (!ambulance_id || !patient_name || !phone || !address || !patient_condition || !destination)
            return res.status(400).json({ success: false, message: "Semua field wajib diisi." });

        // Buat service_request (service_id=1 = Ambulance)
        const requestId = await requestModel.createServiceRequest(userId, 1);

        // Simpan detail ambulance_request
        await requestModel.createAmbulanceRequest({
            request_id: requestId, ambulance_id,
            patient_name, phone, gender, birth_date,
            address, patient_condition, destination
        });

        // Simpan dokumen
        await saveDocuments(requestId, req.files);

        res.status(201).json({ success: true, message: "Permintaan ambulans berhasil dikirim." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST buat request kursi roda ───────────────────────────────────────────
const createWheelchairRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            wheelchair_id, patient_name, phone, gender,
            birth_date, borrow_date, patient_condition, address
        } = req.body;

        if (!wheelchair_id || !patient_name || !phone || !address || !borrow_date)
            return res.status(400).json({ success: false, message: "Semua field wajib diisi." });

        const requestId = await requestModel.createServiceRequest(userId, 2); // service_id=2

        await requestModel.createWheelchairRequest({
            request_id: requestId, wheelchair_id,
            patient_name, phone, gender, birth_date,
            borrow_date, patient_condition, address
        });

        await saveDocuments(requestId, req.files);

        res.status(201).json({ success: true, message: "Permintaan kursi roda berhasil dikirim." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST buat request khitan ───────────────────────────────────────────────
const createKhitanRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { khitan_event_id, patient_name, parent_name, phone, birth_date, address } = req.body;

        if (!khitan_event_id || !patient_name || !phone)
            return res.status(400).json({ success: false, message: "Semua field wajib diisi." });

        const requestId = await requestModel.createServiceRequest(userId, 3); // service_id=3

        await requestModel.createKhitanRequest({
            request_id: requestId, khitan_event_id,
            patient_name, parent_name, phone, birth_date, address
        });

        await saveDocuments(requestId, req.files);

        res.status(201).json({ success: true, message: "Pendaftaran khitan berhasil dikirim." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT admin update status ────────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin." });

        const { id }        = req.params;
        const { status_id } = req.body;

        if (!status_id)
            return res.status(400).json({ success: false, message: "status_id wajib diisi." });

        await requestModel.updateStatus(id, status_id);
        res.json({ success: true, message: "Status berhasil diperbarui." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT user edit detail ───────────────────────────────────────────────────
const updateRequestDetail = async (req, res) => {
    try {
        const { id }                      = req.params;
        const { service_name, ...detail } = req.body;

        if (!service_name)
            return res.status(400).json({ success: false, message: "service_name wajib." });

        const request = await requestModel.getRequestById(id);
        if (!request)
            return res.status(404).json({ success: false, message: "Tidak ditemukan." });
        if (request.user_id !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Akses ditolak." });
        if (request.status_name !== "pending")
            return res.status(400).json({ success: false, message: "Hanya bisa edit saat pending." });

        await requestModel.updateRequestDetail(id, service_name.toLowerCase(), detail);
        res.json({ success: true, message: "Data berhasil diperbarui." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET dokumen ────────────────────────────────────────────────────────────
const getDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role === "user") {
            const request = await requestModel.getRequestById(id);
            if (!request || request.user_id !== req.user.id)
                return res.status(403).json({ success: false, message: "Akses ditolak." });
        }
        const docs = await requestModel.getDocumentsByRequestId(id);
        res.json({ success: true, data: docs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT upload/update dokumen ──────────────────────────────────────────────
const uploadDocument = async (req, res) => {
    try {
        const { id }            = req.params;
        const { document_type } = req.body;
        const file              = req.files?.[document_type]?.[0];

        if (!file)
            return res.status(400).json({ success: false, message: "File tidak ditemukan." });

        const request = await requestModel.getRequestById(id);
        if (!request)
            return res.status(404).json({ success: false, message: "Request tidak ditemukan." });
        if (req.user.role === "user" && request.user_id !== req.user.id)
            return res.status(403).json({ success: false, message: "Akses ditolak." });
        if (request.status_name !== "pending")
            return res.status(400).json({ success: false, message: "Hanya bisa update dokumen saat pending." });

        const filePath     = file.path.replace(/\\/g, "/");
        const originalName = file.originalname;
        await requestModel.upsertDocument(id, document_type, originalName, filePath);

        res.json({ success: true, message: "Dokumen berhasil diupload.", filePath });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Helper: simpan semua dokumen dari req.files ────────────────────────────
async function saveDocuments(requestId, files) {
    if (!files) return;
    const docTypes = ["ktp", "kk", "sktm", "surat_rujukan"];
    for (const type of docTypes) {
        const fileArr = files[type];
        if (fileArr && fileArr[0]) {
            const file = fileArr[0];
            await requestModel.upsertDocument(
                requestId,
                type,
                file.originalname,
                file.path.replace(/\\/g, "/")
            );
        }
    }
}

module.exports = {
    getAllRequests,
    createAmbulanceRequest,
    createWheelchairRequest,
    createKhitanRequest,
    updateStatus,
    updateRequestDetail,
    getDocuments,
    uploadDocument
};