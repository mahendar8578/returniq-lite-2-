/**
 * Calculate product return rate percentage
 * Return Rate = (totalReturned / totalSold) * 100
 * Handles totalSold === 0 cleanly by returning 0 (avoiding division by zero)
 * 
 * @param {number} totalReturned 
 * @param {number} totalSold 
 * @returns {number} Return rate rounded to 2 decimal places
 */
const calculateReturnRate = (totalReturned = 0, totalSold = 0) => {
  const sold = Number(totalSold) || 0;
  const returned = Number(totalReturned) || 0;

  if (sold <= 0) {
    return 0;
  }

  const rate = (returned / sold) * 100;
  return Math.round(rate * 100) / 100;
};

/**
 * Determine product status based on return rate and threshold
 * 
 * @param {number} returnRate 
 * @param {number} threshold 
 * @returns {'ALERT' | 'HEALTHY'}
 */
const getProductStatus = (returnRate = 0, threshold = 10) => {
  return Number(returnRate) >= Number(threshold) ? 'ALERT' : 'HEALTHY';
};

/**
 * Enrich a product object with calculated returnRate and status
 * Does NOT alter or persist these fields into the database
 * 
 * @param {Object} product 
 * @param {number} threshold 
 * @returns {Object}
 */
const enrichProduct = (product, threshold = 10) => {
  const p = product.toObject ? product.toObject() : { ...product };
  const returnRate = calculateReturnRate(p.totalReturned, p.totalSold);
  const status = getProductStatus(returnRate, threshold);

  return {
    ...p,
    returnRate,
    status
  };
};

module.exports = {
  calculateReturnRate,
  getProductStatus,
  enrichProduct
};

