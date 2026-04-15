const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  ingredients: {
    type: String,
    default: ''
  },
  mfg_date: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  expiry_date: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  allergens: {
    type: String,
    default: ''
  },
  nutrition: {
    type: String,
    default: ''
  },
  usage: {
    type: String,
    default: ''
  },
  warnings: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  scanCount: {
    type: Number,
    default: 0
  },
  lastScannedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for expiry check
productSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiry_date;
});

// Virtual for days until expiry
productSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const diff = this.expiry_date - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Text index for search
productSchema.index({ name: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
