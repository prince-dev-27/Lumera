const multer = require('multer');

// Store uploaded files in memory as Buffers (No disk storage, no MongoDB binary storage)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif, etc.) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image file
  },
  fileFilter,
});

module.exports = upload;
