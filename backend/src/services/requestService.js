const requestModel = require("../models/requestModel");

// GET ALL REQUEST (business logic layer)
exports.getAllRequests = async (userId, role) => {
    const data = await requestModel.getAllRequests(userId, role);

    // OPTIONAL: enrichment logic (future ready)
    return data.map(item => ({
        ...item,
        statusLabel: item.request_status.toUpperCase()
    }));
};


// DETAIL REQUEST (admin modal)
exports.getRequestDetail = async (id) => {
    const data = await requestModel.getRequestById(id);

    if (!data) {
        throw new Error("Request tidak ditemukan");
    }

    return data;
};


// UPDATE STATUS (admin approve/reject)
exports.updateRequestStatus = async (id, statusId) => {
    const result = await requestModel.updateStatus(id, statusId);

    if (result.affectedRows === 0) {
        throw new Error("Gagal update status");
    }

    return true;
};