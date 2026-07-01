// backend/src/models/requestModel.js

const db = require("../config/database");

// ── GET semua request ──────────────────────────────────────────────────────
const getAllRequests = async (userId, role) => {
    let query = `
        SELECT
            sr.id           AS request_id,
            sr.created_at,
            sr.user_id,
            s.name          AS service_name,
            rs.name         AS status_name,
            u.name          AS user_name,

            ar.patient_name AS amb_patient,
            ar.phone        AS amb_phone,
            ar.patient_condition AS amb_condition,
            ar.address      AS amb_address,
            ar.destination  AS amb_destination,
            ar.gender       AS amb_gender,
            ar.birth_date   AS amb_birth_date,
            a.code          AS amb_code,

            wr.patient_name AS wc_patient,
            wr.phone        AS wc_phone,
            wr.borrow_date  AS wc_borrow_date,
            wr.patient_condition AS wc_condition,
            wr.address      AS wc_address,
            wr.gender       AS wc_gender,
            wr.birth_date   AS wc_birth_date,
            w.code          AS wc_code,

            kr.patient_name AS khitan_patient,
            kr.parent_name  AS khitan_parent,
            kr.phone        AS khitan_phone,
            kr.address      AS khitan_address,
            kr.birth_date   AS khitan_birth_date
            

        FROM service_requests sr
        JOIN services          s  ON sr.service_id          = s.id
        JOIN request_statuses  rs ON sr.request_status_id   = rs.id
        JOIN users             u  ON sr.user_id             = u.id

        LEFT JOIN ambulance_requests  ar ON ar.request_id = sr.id
        LEFT JOIN ambulances          a  ON a.id            = ar.ambulance_id

        LEFT JOIN wheelchair_requests wr ON wr.request_id = sr.id
        LEFT JOIN wheelchairs         w  ON w.id            = wr.wheelchair_id

        LEFT JOIN khitan_requests     kr ON kr.request_id = sr.id
        LEFT JOIN khitan_events       ke ON ke.id           = kr.khitan_event_id
    `;

    const params = [];
    if (role === "user") {
        query += " WHERE sr.user_id = ?";
        params.push(userId);
    }
    query += " ORDER BY sr.created_at DESC";

    const [rows] = await db.query(query, params);
    return rows;
};

// ── GET satu request by ID ─────────────────────────────────────────────────
const getRequestById = async (id) => {
    const [rows] = await db.query(
        `SELECT sr.id, sr.user_id, rs.name AS status_name
         FROM service_requests sr
         JOIN request_statuses rs ON sr.request_status_id = rs.id
         WHERE sr.id = ?`,
        [id]
    );
    return rows[0] || null;
};

// ── CREATE service_request (induk) ────────────────────────────────────────
// Mengembalikan ID yang baru dibuat
const createServiceRequest = async (userId, serviceId) => {
    const [result] = await db.query(
        "INSERT INTO service_requests (user_id, service_id, request_status_id) VALUES (?, ?, 1)",
        [userId, serviceId]  // status_id=1 = pending
    );
    return result.insertId;
};

// ── CREATE detail ambulance_request ───────────────────────────────────────
const createAmbulanceRequest = async ({ request_id, ambulance_id, patient_name, phone, gender, birth_date, address, patient_condition, destination }) => {
    return db.query(
        `INSERT INTO ambulance_requests
         (request_id, ambulance_id, patient_name, phone, gender, birth_date, address, patient_condition, destination)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [request_id, ambulance_id, patient_name, phone, gender || null, birth_date || null, address, patient_condition, destination]
    );
};

// ── CREATE detail wheelchair_request ──────────────────────────────────────
const createWheelchairRequest = async ({ request_id, wheelchair_id, patient_name, phone, gender, birth_date, borrow_date, patient_condition, address }) => {
    return db.query(
        `INSERT INTO wheelchair_requests
         (request_id, wheelchair_id, patient_name, phone, gender, birth_date, borrow_date, patient_condition, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [request_id, wheelchair_id, patient_name, phone, gender || null, birth_date || null, borrow_date, patient_condition || null, address]
    );
};

// ── CREATE detail khitan_request ──────────────────────────────────────────
const createKhitanRequest = async ({ request_id, khitan_event_id, patient_name, parent_name, phone, birth_date, address }) => {
    return db.query(
        `INSERT INTO khitan_requests
         (request_id, khitan_event_id, patient_name, parent_name, phone, birth_date, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [request_id, khitan_event_id, patient_name, parent_name || null, phone, birth_date || null, address || null]
    );
};

// ── UPDATE status ──────────────────────────────────────────────────────────
const updateStatus = async (id, statusId) => {
    await db.query(
        "UPDATE service_requests SET request_status_id = ? WHERE id = ?",
        [statusId, id]
    );

    const unitStatusMap = { 2: 2, 3: 1, 4: 1 };
    const newUnitStatus = unitStatusMap[Number(statusId)];
    if (!newUnitStatus) return;

    // 3. Cari unit ID dari request ini
    const [rows] = await db.query(`
        SELECT  s.name  AS service_name,
                ar.ambulance_id,
                wr.wheelchair_id,
                kr.khitan_event_id
        FROM    service_requests sr
        JOIN    services s ON sr.service_id = s.id
        LEFT JOIN ambulance_requests  ar ON ar.request_id = sr.id
        LEFT JOIN wheelchair_requests wr ON wr.request_id = sr.id
        LEFT JOIN khitan_requests     kr ON kr.request_id = sr.id
        WHERE   sr.id = ?
    `, [id]);

    if (!rows.length) return;
    const row = rows[0];
    const svc = row.service_name.toLowerCase();

    // 4. Update status unit yang bersangkutan
    if (svc === "ambulance" && row.ambulance_id) {
        await db.query(
            "UPDATE ambulances SET unit_status_id = ? WHERE id = ?",
            [newUnitStatus, row.ambulance_id]
        );
    } else if (svc === "wheelchair" && row.wheelchair_id) {
        await db.query(
            "UPDATE wheelchairs SET unit_status_id = ? WHERE id = ?",
            [newUnitStatus, row.wheelchair_id]
        );
    } else if (svc === "khitan" && row.khitan_event_id) {
        // Khitan: in_use = penuh, available = masih bisa daftar
        await db.query(
            "UPDATE khitan_events SET unit_status_id = ? WHERE id = ?",
            [newUnitStatus, row.khitan_event_id]
        );
    }
};

// ── UPDATE detail request ──────────────────────────────────────────────────
const updateRequestDetail = async (requestId, serviceName, data) => {
    if (serviceName === "ambulance") {
        const { patient_name, phone, patient_condition, address, destination } = data;
        return db.query(
            "UPDATE ambulance_requests SET patient_name=?, phone=?, patient_condition=?, address=?, destination=? WHERE request_id=?",
            [patient_name, phone, patient_condition, address, destination, requestId]
        );
    }
    if (serviceName === "wheelchair") {
        const { patient_name, phone, borrow_date, patient_condition, address } = data;
        return db.query(
            "UPDATE wheelchair_requests SET patient_name=?, phone=?, borrow_date=?, patient_condition=?, address=? WHERE request_id=?",
            [patient_name, phone, borrow_date, patient_condition, address, requestId]
        );
    }
    if (serviceName === "khitan") {
        const { patient_name, parent_name, phone, address } = data;
        return db.query(
            "UPDATE khitan_requests SET patient_name=?, parent_name=?, phone=?, address=? WHERE request_id=?",
            [patient_name, parent_name, phone, address, requestId]
        );
    }
    throw new Error("Service tidak dikenal: " + serviceName);
};

// ── DOKUMEN ────────────────────────────────────────────────────────────────
const getDocumentsByRequestId = async (requestId) => {
    const [rows] = await db.query(
        "SELECT id, document_type, original_name, file_path, uploaded_at FROM documents WHERE request_id = ? ORDER BY uploaded_at ASC",
        [requestId]
    );
    return rows;
};

const upsertDocument = async (requestId, documentType, originalName, filePath) => {
    await db.query(
        "DELETE FROM documents WHERE request_id = ? AND document_type = ?",
        [requestId, documentType]
    );
    return db.query(
        "INSERT INTO documents (request_id, document_type, original_name, file_path) VALUES (?, ?, ?, ?)",
        [requestId, documentType, originalName, filePath]
    );
};

module.exports = {
    getAllRequests,
    getRequestById,
    createServiceRequest,
    createAmbulanceRequest,
    createWheelchairRequest,
    createKhitanRequest,
    updateStatus,
    updateRequestDetail,
    getDocumentsByRequestId,
    upsertDocument
};