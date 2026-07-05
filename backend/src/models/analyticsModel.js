// backend/src/models/analyticsModel.js

const db = require("../config/database");

// Ringkasan bulan ini 
const getSummary = async () => {
    const [[summary]] = await db.query(`
        SELECT
            COUNT(*)                                          AS total_requests,
            SUM(request_status_id = 1)                        AS total_pending,
            SUM(request_status_id = 2)                        AS total_approved,
            SUM(request_status_id = 3)                        AS total_rejected,
            SUM(request_status_id = 4)                        AS total_completed,
            COUNT(DISTINCT user_id)                           AS total_users,
            SUM(MONTH(created_at) = MONTH(CURDATE())
                AND YEAR(created_at)  = YEAR(CURDATE()))      AS requests_this_month,
            SUM(MONTH(created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH)
                AND YEAR(created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH)) AS requests_last_month
        FROM service_requests
    `);
    return summary;
};

// Tren bulanan per layanan (6 bulan terakhir)
 const getMonthlyTrend = async () => {
    const [rows] = await db.query(`
        SELECT
            DATE_FORMAT(sr.created_at, '%Y-%m') AS month,
            s.name                               AS service_name,
            COUNT(*)                             AS total
        FROM   service_requests sr
        JOIN   services s ON sr.service_id = s.id
        WHERE  sr.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP  BY month, s.name
        ORDER  BY month ASC
    `);
    return rows;
};

// Distribusi per layanan (all time) 
const getServiceDistribution = async () => {
    const [rows] = await db.query(`
        SELECT
            s.name   AS service_name,
            COUNT(*) AS total
        FROM   service_requests sr
        JOIN   services s ON sr.service_id = s.id
        GROUP  BY s.name
    `);
    return rows;
};

// 5 permintaan terbaru 
const getRecentRequests = async () => {
    const [rows] = await db.query(`
        SELECT
            sr.id          AS request_id,
            u.name         AS user_name,
            s.name         AS service_name,
            rs.name        AS status_name,
            sr.created_at
        FROM   service_requests sr
        JOIN   users            u  ON u.id  = sr.user_id
        JOIN   services         s  ON s.id  = sr.service_id
        JOIN   request_statuses rs ON rs.id = sr.request_status_id
        ORDER  BY sr.created_at DESC
        LIMIT  5
    `);
    return rows;
};

// Distribusi status per layanan 
const getStatusByService = async () => {
    const [rows] = await db.query(`
        SELECT
            s.name  AS service_name,
            rs.name AS status_name,
            COUNT(*) AS total
        FROM   service_requests sr
        JOIN   services         s  ON s.id  = sr.service_id
        JOIN   request_statuses rs ON rs.id = sr.request_status_id
        GROUP  BY s.name, rs.name
        ORDER  BY s.name, rs.name
    `);
    return rows;
};

module.exports = {
    getSummary,
    getMonthlyTrend,
    getServiceDistribution,
    getRecentRequests,
    getStatusByService
};