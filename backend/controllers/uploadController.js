const uploadLogs = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a .log or .txt file." });
  }

  return res.json({
    fileName: req.file.originalname,
    content: req.file.buffer.toString("utf-8")
  });
};

module.exports = { uploadLogs };
