import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Absolute Path Logic (VM Safe)
const uploadDir = path.join(process.cwd(), "public", "temp");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 2. Production: Unique filenames to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Replace spaces in filenames with hyphens to avoid URL issues
    const sanitizedName = file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix + '-' + sanitizedName);
  }
});

// 3. Production: Security Limits
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // Limit file size to 1MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
      "application/octet-stream"
    ];
    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".csv"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, XLSX, XLS, or CSV files are allowed!"), false);
    }
  }
});
