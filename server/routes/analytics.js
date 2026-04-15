const express = require('express');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private/Admin
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalScansAgg = await Product.aggregate([
      { $group: { _id: null, totalScans: { $sum: '$scanCount' } } }
    ]);

    const expiredProducts = await Product.countDocuments({
      expiry_date: { $lt: new Date() }
    });

    const expiringSoon = await Product.countDocuments({
      expiry_date: {
        $gt: new Date(),
        $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const mostScanned = await Product.find({ scanCount: { $gt: 0 } })
      .sort('-scanCount')
      .limit(10)
      .select('name brand code scanCount lastScannedAt category');

    const recentlyScanned = await Product.find({ lastScannedAt: { $ne: null } })
      .sort('-lastScannedAt')
      .limit(10)
      .select('name brand code scanCount lastScannedAt category');

    res.json({
      success: true,
      data: {
        totalProducts,
        totalScans: totalScansAgg[0]?.totalScans || 0,
        expiredProducts,
        expiringSoon,
        categories,
        mostScanned,
        recentlyScanned
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
