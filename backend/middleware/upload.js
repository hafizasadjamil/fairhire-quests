// middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Make sure "uploads" folder exists
const uploadPath = path.join("uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const unique = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${base}_${unique}${ext}`);
  },
});

const upload = multer({ storage });

export default upload;
