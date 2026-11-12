const { body, validationResult } = require('express-validator');

// Validation rules for creating a product
const createProductRules = [
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('productCode')
    .trim()
    .notEmpty()
    .withMessage('Product code is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('supplier')
    .trim()
    .notEmpty()
    .withMessage('Supplier is required'),
  body('totalSold')
    .exists()
    .withMessage('Total sold is required')
    .isNumeric()
    .withMessage('Total sold must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Total sold cannot be negative'),
  body('totalReturned')
    .exists()
    .withMessage('Total returned is required')
    .isNumeric()
    .withMessage('Total returned must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Total returned cannot be negative')
    .custom((val, { req }) => {
      const sold = Number(req.body.totalSold);
      const returned = Number(val);
      if (!isNaN(sold) && !isNaN(returned) && returned > sold) {
        throw new Error('Total returned cannot be greater than total sold');
      }
      return true;
    })
];

// Validation rules for updating a product
const updateProductRules = [
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('productCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product code cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('supplier')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Supplier cannot be empty'),
  body('totalSold')
    .optional()
    .isNumeric()
    .withMessage('Total sold must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Total sold cannot be negative'),
  body('totalReturned')
    .optional()
    .isNumeric()
    .withMessage('Total returned must be a number')
    .custom((val) => Number(val) >= 0)
    .withMessage('Total returned cannot be negative')
    .custom((val, { req }) => {
      if (req.body.totalSold !== undefined) {
        const sold = Number(req.body.totalSold);
        const returned = Number(val);
        if (!isNaN(sold) && !isNaN(returned) && returned > sold) {
          throw new Error('Total returned cannot be greater than total sold');
        }
      }
      return true;
    })
];

// Handle validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  createProductRules,
  updateProductRules,
  validate
};

