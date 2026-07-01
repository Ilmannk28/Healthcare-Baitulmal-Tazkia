// backend/src/controllers/khitanController.js

const model = require("../models/khitanModel");

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
            return res.status(403).json({ success: false, message: "Hanya admin." });

        const { location, event_date, city, quota, status_id } = req.body;
        if (!location || !event_date || !city || !quota)
            return res.status(400).json({ success: false, message: "location, event_date, city, quota wajib diisi." });

        await model.create({ location, event_date, city, quota, status_id });
        res.status(201).json({ success: true, message: "Jadwal khitan berhasil ditambahkan." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin." });

        const { location, event_date, city, quota, status_id } = req.body;
        await model.update(req.params.id, { location, event_date, city, quota, status_id });
        res.json({ success: true, message: "Jadwal khitan berhasil diperbarui." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const remove = async (req, res) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ success: false, message: "Hanya admin." });

        await model.remove(req.params.id);
        res.json({ success: true, message: "Jadwal khitan berhasil dihapus." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAll, create, update, remove };