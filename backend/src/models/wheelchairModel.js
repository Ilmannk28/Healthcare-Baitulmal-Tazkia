// backend/src/models/wheelchairModel.js
const db = require("../config/database");

const getAll = async () => {
    const [rows] = await db.query(`
        SELECT w.id, w.code, w.location, w.coverage_area, 
               us.name AS status_name, w.unit_status_id AS status_id
        FROM   wheelchairs w
        JOIN   unit_statuses us ON w.unit_status_id = us.id
        ORDER  BY w.id ASC
    `);
    return rows;
};
const create = async ({ code, coverage_area, location, status_id }) => {
    return db.query(
        "INSERT INTO wheelchairs (code, coverage_area, location, unit_status_id) VALUES (?,?,?,?)",
        [code, coverage_area, location, status_id]
    );
};
const update = async (id, { code, coverage_area, location, status_id }) => {
    return db.query(
        "UPDATE wheelchairs SET code=?, coverage_area=?, location=?, unit_status_id=? WHERE id=?",
        [code, coverage_area, location, status_id, id]
    );
};
const remove = async (id) => db.query("DELETE FROM wheelchairs WHERE id=?", [id]);

module.exports = { getAll, create, update, remove };