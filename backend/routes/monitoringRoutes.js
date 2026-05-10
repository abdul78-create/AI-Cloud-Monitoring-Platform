const express = require("express");
const { getMockMetrics, registerAgent, submitMetrics, submitLogs, submitHeartbeat } = require("../controllers/monitoringController");

const router = express.Router();

router.get("/metrics", getMockMetrics);
router.post("/register", registerAgent);
router.post("/metrics", submitMetrics);
router.post("/logs", submitLogs);
router.post("/heartbeat", submitHeartbeat);

module.exports = router;
