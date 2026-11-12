const Product = require('../models/Product');
const { Return, ALLOWED_REASONS } = require('../models/Return');
const Settings = require('../models/Settings');
const { enrichProduct, calculateReturnRate } = require('../utils/returnRate');

/**
 * @desc    Get aggregated analytics and trends directly from MongoDB
 * @route   GET /api/analytics/summary
 */
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const threshold = settings.returnRateThreshold;

    // 1. Fetch and enrich all products
    const rawProducts = await Product.find().lean();
    const products = rawProducts.map(p => enrichProduct(p, threshold));

    // 2. Returns by Reason - MongoDB Aggregation
    const reasonAgg = await Return.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          units: { $sum: '$quantity' }
        }
      }
    ]);

    const totalReturnedUnits = reasonAgg.reduce((acc, curr) => acc + curr.units, 0);

    const reasonMap = new Map();
    reasonAgg.forEach(item => {
      reasonMap.set(item._id, { count: item.count, units: item.units });
    });

    // Ensure all standard reason categories exist in response
    const returnsByReason = ALLOWED_REASONS.map(reason => {
      const found = reasonMap.get(reason) || { count: 0, units: 0 };
      const percentage = totalReturnedUnits > 0
        ? Math.round((found.units / totalReturnedUnits) * 1000) / 10
        : 0;

      return {
        reason,
        count: found.count,
        units: found.units,
        percentage
      };
    }).sort((a, b) => b.units - a.units);

    // 3. Products sorted by highest return rate (descending)
    const returnRateByProduct = [...products]
      .sort((a, b) => b.returnRate - a.returnRate);

    // 4. Products sorted by highest total returned volume (descending)
    const topReturnedProducts = [...products]
      .sort((a, b) => b.totalReturned - a.totalReturned);

    // 5. Products currently exceeding threshold (ALERT status)
    const productsAboveThreshold = products.filter(p => p.status === 'ALERT');

    // 6. Returns by Category aggregation
    const categoryMap = new Map();
    products.forEach(p => {
      const cat = p.category || 'General';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { category: cat, sold: 0, returned: 0, productCount: 0 });
      }
      const entry = categoryMap.get(cat);
      entry.sold += p.totalSold;
      entry.returned += p.totalReturned;
      entry.productCount += 1;
    });

    const categorySummary = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      returnRate: calculateReturnRate(cat.returned, cat.sold)
    })).sort((a, b) => b.returnRate - a.returnRate);

    res.status(200).json({
      success: true,
      data: {
        threshold,
        totalProducts: products.length,
        totalReturnedUnits,
        returnsByReason,
        returnRateByProduct,
        topReturnedProducts,
        productsAboveThreshold,
        categorySummary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsSummary
};

