const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getAlertProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const {
  createProductRules,
  updateProductRules,
  validate
} = require('../middleware/productValidator');

// Collection routes
router.route('/')
  .post(createProductRules, validate, createProduct)
  .get(getProducts);

// Alerts route MUST be registered before /:id parameter route
router.route('/alerts')
  .get(getAlertProducts);

// Single product routes
router.route('/:id')
  .get(getProductById)
  .put(updateProductRules, validate, updateProduct)
  .delete(deleteProduct);

module.exports = router;
