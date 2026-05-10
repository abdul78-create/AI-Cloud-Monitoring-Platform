const express = require("express");
const { analyzeLogs } = require("../controllers/aiController");

const router = express.Router();

router.post("/analyze", analyzeLogs);

module.exports = router;
