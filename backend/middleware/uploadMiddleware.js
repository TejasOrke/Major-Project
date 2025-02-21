const multer = require("multer");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
