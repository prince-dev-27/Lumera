const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (val) {
          if (val === null || val === undefined) return true;
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be less than original price'
      }
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category']
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    attributes: {
      material: { type: String, default: '' },
      plating: { type: String, default: '' },
      stoneType: { type: String, default: '' },
      size: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Slug generation hook
productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug =
      this.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      randomSuffix;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
