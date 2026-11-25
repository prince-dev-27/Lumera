const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all products with filtering, sorting, search, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,   // slug or ObjectId
    featured,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    limit = 12,
    all,
  } = req.query;

  const filter = {};
  if (all !== 'true') {
    filter.isActive = true;
  }

  // --- Search (name + description) ---
  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  // --- Category filter (accept ObjectId OR slug) ---
  if (category && category !== 'all') {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      filter.category = category;
    } else {
      // Resolve slug to ObjectId
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category = cat._id;
      } else {
        // No matching category — return empty
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          pages: 0,
          data: [],
        });
      }
    }
  }

  // --- Featured filter ---
  if (featured === 'true') {
    filter.isFeatured = true;
  }

  // --- Price filter (effective price = discountPrice if set, else price) ---
  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Infinity;

    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        {
          discountPrice: { $ne: null, $gte: min, ...(max !== Infinity ? { $lte: max } : {}) },
        },
        {
          discountPrice: null,
          price: { $gte: min, ...(max !== Infinity ? { $lte: max } : {}) },
        },
      ],
    });
  }

  // --- Sorting ---
  let sortObj = {};
  switch (sort) {
    case 'price-low-high':
      sortObj = { price: 1 };
      break;
    case 'price-high-low':
      sortObj = { price: -1 };
      break;
    case 'featured':
      sortObj = { isFeatured: -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortObj = { createdAt: -1 };
      break;
  }

  // --- Pagination ---
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug image')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  let product;
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(req.params.id).populate('category', 'name slug image');
  } else {
    product = await Product.findOne({ slug: req.params.id }).populate('category', 'name slug image');
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  const populated = await product.populate('category', 'name slug image');

  res.status(201).json({
    success: true,
    data: populated,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category', 'name slug image');

  res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
