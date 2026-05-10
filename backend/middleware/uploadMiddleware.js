const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(log|txt)$/i)) {
    return cb(new Error("Only .log and .txt files are allowed."));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
