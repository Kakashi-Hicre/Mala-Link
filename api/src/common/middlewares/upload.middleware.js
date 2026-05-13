const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Where files get saved
const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Make sure the uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure where and how files are stored on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organise uploads into subfolders by applicationId
    // So uploads/abc-123/ holds all files for that application
    const appFolder = path.join(UPLOAD_DIR, req.params.applicationId || 'general');

    if (!fs.existsSync(appFolder)) {
      fs.mkdirSync(appFolder, { recursive: true });
    }

    cb(null, appFolder);
  },

  filename: (req, file, cb) => {
    // Rename file to: timestamp-originalname
    // Prevents name collisions if two people upload "passport.jpg"
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

// Only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // accept the file
  } else {
    cb(new Error('Only JPEG, PNG and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

module.exports = upload;