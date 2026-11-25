const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  uploadProductImages,
  deleteProductImage,
} = require('../controllers/uploadController');

// @route   POST /api/upload/images
// @desc    Upload multiple product images to Cloudinary (Max 10 files)
// @access  Private/Admin
router.post(
  '/images',
  protect,
  admin,
  upload.array('images', 10),
  uploadProductImages
);

// @route   DELETE /api/upload/image
// @desc    Delete single product image from Cloudinary
// @access  Private/Admin
router.delete(
  '/image',
  protect,
  admin,
  deleteProductImage
);

module.exports = router;
