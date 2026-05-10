const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadLogs } = require("../controllers/uploadController");

const router = express.Router();

router.post("/logs", upload.single("logFile"), uploadLogs);

module.exports = router;
