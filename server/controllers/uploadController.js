const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * Upload buffer to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer
 * @param {string} originalName
 * @returns {Promise<Object>} Cloudinary result object
 */
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'lumera/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Upload product images to Cloudinary or local storage
// @route   POST /api/upload/images
// @access  Private/Admin
const uploadProductImages = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    res.status(400);
    throw new Error('Please select at least one image file to upload.');
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const isMockConfig =
    !cloudName ||
    cloudName === 'your_cloud_name' ||
    cloudName === 'demo';

  const uploadPromises = files.map(async (file, index) => {
    try {
      if (!isMockConfig) {
        try {
          const result = await uploadToCloudinary(file.buffer, file.originalname);
          return result.secure_url;
        } catch (err) {
          console.warn('Cloudinary upload failed, falling back to local storage:', err.message);
        }
      }

      // Local storage fallback (when mock config or Cloudinary upload failed)
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const cleanName = (file.originalname || `item_${index}`)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .toLowerCase();
      const filename = `${Date.now()}_${Math.round(Math.random() * 1000)}_${cleanName}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return `/uploads/${filename}`;
    } catch (err) {
      console.error(`Error uploading image ${file.originalname}:`, err.message);
      throw new Error(`Failed to upload image ${file.originalname}: ${err.message}`);
    }
  });

  const urls = await Promise.all(uploadPromises);

  res.status(200).json({
    success: true,
    message: `${urls.length} product image(s) uploaded successfully`,
    count: urls.length,
    urls,
  });
});

// @desc    Remove an image from Cloudinary or local storage
// @route   DELETE /api/upload/image
// @access  Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const { publicId, imageUrl } = req.body;

  let targetPublicId = publicId;

  // Extract publicId from Cloudinary URL if not directly passed
  if (!targetPublicId && imageUrl && imageUrl.includes('cloudinary.com')) {
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1) {
      const publicPathParts = parts.slice(uploadIndex + 2); // after upload/vXXXXXX/
      const pathWithExt = publicPathParts.join('/');
      targetPublicId = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
    }
  }

  if (targetPublicId) {
    try {
      await cloudinary.uploader.destroy(targetPublicId);
    } catch (err) {
      console.warn('Cloudinary destroy warning:', err.message);
    }
  }

  if (imageUrl && imageUrl.includes('/uploads/')) {
    try {
      const relativePath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      const filename = path.basename(relativePath);
      const localPath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.warn('Local file delete warning:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Image removed successfully',
  });
});

module.exports = {
  uploadProductImages,
  deleteProductImage,
};
