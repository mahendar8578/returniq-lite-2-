const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { calculateReturnRate } = require('../utils/returnRate');

/**
 * @desc    Get dashboard summary metrics
 * @route   GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const threshold = settings.returnRateThreshold;

    // Fetch aggregate sums for sold and returned units across all products
    const [aggregateResult] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnitsSold: { $sum: '$totalSold' },
          totalReturns: { $sum: '$totalReturned' }
        }
      }
    ]);

    const totalProducts = aggregateResult ? aggregateResult.totalProducts : 0;
    const totalUnitsSold = aggregateResult ? aggregateResult.totalUnitsSold : 0;
    const totalReturns = aggregateResult ? aggregateResult.totalReturns : 0;

    // Overall Average Return Rate = (Total Returns / Total Units Sold) * 100
    const averageReturnRate = calculateReturnRate(totalReturns, totalUnitsSold);

    // Calculate count of products currently at or above the threshold
    // Fetch products to compute rates dynamically (avoiding division-by-zero errors in DB)
    const products = await Product.find({}, 'totalSold totalReturned');
    const productsWithAlerts = products.filter(product => {
      const rate = calculateReturnRate(product.totalReturned, product.totalSold);
      return rate >= threshold;
    }).length;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalUnitsSold,
        totalReturns,
        averageReturnRate,
        productsWithAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};

