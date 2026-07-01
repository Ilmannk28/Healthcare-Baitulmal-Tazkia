// backend/src/models/khitanModel.js
// Kolom DB: id, location, event_date, city, quota, unit_status_id
// quota ditambah via migration_khitan_quota.sql

const db = require("../config/database");

const getAll = async () => {
    const [rows] = await db.query(`
        SELECT
            ke.id,
            ke.location,
            ke.event_date,
            ke.city,
            ke.quota,
            ke.unit_status_id   AS status_id,
            us.name             AS status_name,
            COUNT(kr.id)        AS peserta_terdaftar,
            ke.quota - COUNT(kr.id) AS sisa_kuota
        FROM   khitan_events ke
        JOIN   unit_statuses us ON ke.unit_status_id = us.id
        LEFT JOIN khitan_requests kr ON kr.khitan_event_id = ke.id
        LEFT JOIN service_requests sr
               ON kr.request_id = sr.id
              AND sr.request_status_id NOT IN (3)
        GROUP  BY ke.id, ke.location, ke.event_date, ke.city,
                  ke.quota, ke.unit_status_id, us.name
        ORDER  BY ke.event_date ASC
    `);
    return rows;
};

const create = async ({ location, event_date, city, quota, status_id }) => {
    return db.query(
        "INSERT INTO khitan_events (location, event_date, city, quota, unit_status_id) VALUES (?, ?, ?, ?, ?)",
        [location, event_date, city, quota || 0, status_id || 1]
    );
};

const update = async (id, { location, event_date, city, quota, status_id }) => {
    return db.query(
        "UPDATE khitan_events SET location=?, event_date=?, city=?, quota=?, unit_status_id=? WHERE id=?",
        [location, event_date, city, quota, status_id, id]
    );
};

const remove = async (id) => {
    return db.query("DELETE FROM khitan_events WHERE id=?", [id]);
};

module.exports = { getAll, create, update, remove };