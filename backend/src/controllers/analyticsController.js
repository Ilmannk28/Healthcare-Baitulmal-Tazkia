// backend/src/controllers/analyticsController.js

const analyticsModel = require("../models/analyticsModel");

const getDashboard = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Hanya admin." });
        }

        const [summary, monthlyTrend, serviceDistribution, recentRequests, statusByService] =
            await Promise.all([
                analyticsModel.getSummary(),
                analyticsModel.getMonthlyTrend(),
                analyticsModel.getServiceDistribution(),
                analyticsModel.getRecentRequests(),
                analyticsModel.getStatusByService()
            ]);

        res.json({
            success: true,
            data: {
                summary,
                monthlyTrend,
                serviceDistribution,
                recentRequests,
                statusByService
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getDashboard };