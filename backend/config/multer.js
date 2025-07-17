const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.split(ext)[0];
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
