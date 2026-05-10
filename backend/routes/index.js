const express = require("express");
const monitoringRoutes = require("./monitoringRoutes");
const aiRoutes = require("./aiRoutes");
const uploadRoutes = require("./uploadRoutes");

const router = express.Router();

router.use("/monitoring", monitoringRoutes);
router.use("/ai", aiRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
