const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { ALLOWED_REASONS } = require('../models/Return');

const createReturnRules = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid product ID format'),
  body('reason')
    .notEmpty()
    .withMessage('Return reason is required')
    .isIn(ALLOWED_REASONS)
    .withMessage(`Reason must be one of: ${ALLOWED_REASONS.join(', ')}`),
  body('quantity')
    .exists()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('returnDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Return date must be a valid date')
];

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
  createReturnRules,
  validate
};

