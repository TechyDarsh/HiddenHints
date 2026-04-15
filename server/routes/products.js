const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Multer config for CSV upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Validation rules for product
const productValidation = [
  body('code').trim().notEmpty().withMessage('Product code is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('mfg_date').notEmpty().withMessage('Manufacturing date is required'),
  body('expiry_date').notEmpty().withMessage('Expiry date is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
];

// @route   POST /api/products
// @desc    Add a new product
// @access  Private/Admin
router.post('/', protect, adminOnly, productValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if product code already exists
    const existing = await Product.findOne({ code: req.body.code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A product with this code already exists'
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/products/bulk
// @desc    Bulk upload products via CSV
// @access  Private/Admin
router.post('/bulk', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    const products = [];
    const errors = [];
    let rowIndex = 0;

    const stream = Readable.from(req.file.buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowIndex++;
          // Map CSV columns to product fields
          const product = {
            code: row.code || row.product_code || '',
            name: row.name || row.product_name || '',
            brand: row.brand || '',
            ingredients: row.ingredients || '',
            mfg_date: row.mfg_date || row.manufacturing_date || '',
            expiry_date: row.expiry_date || row.expiry || '',
            allergens: row.allergens || '',
            nutrition: row.nutrition || row.nutritional_info || '',
            usage: row.usage || row.usage_instructions || '',
            warnings: row.warnings || row.safety_warnings || '',
            category: row.category || ''
          };

          if (!product.code || !product.name || !product.brand || !product.category) {
            errors.push({ row: rowIndex, message: 'Missing required fields (code, name, brand, category)' });
          } else {
            products.push(product);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert valid products, skip duplicates
    let inserted = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        await Product.create(product);
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          skipped++;
          errors.push({ code: product.code, message: 'Duplicate product code - skipped' });
        } else {
          errors.push({ code: product.code, message: err.message });
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalRows: rowIndex,
        inserted,
        skipped,
        errors: errors.length,
        errorDetails: errors.slice(0, 20) // Limit error details
      }
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Error processing CSV file' });
  }
});

// @route   GET /api/products
// @desc    Get all products (with search & pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50, sort = '-createdAt' } = req.query;
    const query = {};

    // Search by name, brand, or category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/scan/:code
// @desc    Get product by code (for scanning) - increments scan count
// @access  Public
router.get('/scan/:code', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { scanCount: 1 }, lastScannedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found. This code is not registered in our system.'
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Scan product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    // Check if code is being changed and if new code already exists
    if (req.body.code) {
      const existing = await Product.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A product with this code already exists'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
