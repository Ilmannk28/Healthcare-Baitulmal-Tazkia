const db = require("../config/database");

const getAll = async () => {
    const [rows] = await db.query(`
        SELECT a.id, a.code, a.location, a.coverage_area, 
               us.name AS status_name, a.unit_status_id AS status_id
        FROM   ambulances a
        JOIN   unit_statuses us ON a.unit_status_id = us.id
        ORDER  BY a.id ASC
    `);
    return rows;
};

const create = async ({ code, location, coverage_area, status_id }) => {
    return db.query(
        `INSERT INTO ambulances (code, location, coverage_area,  unit_status_id)
         VALUES (?, ?, ?, ?)`,
        [code, location, coverage_area, status_id]
    );
};

const update = async (id, { code, location, coverage_area, status_id }) => {
    return db.query(
        `UPDATE ambulances
         SET code = ?, location = ?, coverage_area = ?, unit_status_id = ?
         WHERE id = ?`,
        [code, location, coverage_area || null, status_id, id]
    );
};

const remove = async (id) => {
    return db.query("DELETE FROM ambulances WHERE id = ?", [id]);
};

module.exports = { getAll, create, update, remove };