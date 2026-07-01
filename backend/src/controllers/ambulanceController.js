// backend/src/controllers/ambulanceController.js

const model = require("../models/ambulanceModel");

const getAll = async (req, res) => {
    try {
        const data = await model.getAll();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin yang dapat menambah unit." });

        const { code, coverage_area, location, status_id } = req.body;
        if (!code || !coverage_area || !location)
            return res.status(400).json({ success: false, message: "code, coverage_area, dan location wajib diisi." });

        await model.create({ code, coverage_area, location, status_id: status_id || 1 });
        res.status(201).json({ success: true, message: "Unit ambulans berhasil ditambahkan." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin." });

        const { id } = req.params;
        const { code, coverage_area, location, status_id } = req.body;
        await model.update(id, { code, coverage_area, location, status_id });
        res.json({ success: true, message: "Unit ambulans berhasil diperbarui." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin." });
        await model.remove(req.params.id);
        res.json({ success: true, message: "Unit ambulans berhasil dihapus." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, create, update, remove };