const mongoose = require('mongoose');
const Product = require('../models/Product');
const { Return } = require('../models/Return');
const Settings = require('../models/Settings');
const { enrichProduct } = require('../utils/returnRate');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const { productName, productCode, category, supplier, totalSold, totalReturned } = req.body;

    const normalizedCode = productCode.trim().toUpperCase();

    // Check for duplicate product code
    const existingProduct = await Product.findOne({ productCode: normalizedCode });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists'
      });
    }

    const product = new Product({
      productName,
      productCode: normalizedCode,
      category,
      supplier,
      totalSold: Number(totalSold) || 0,
      totalReturned: Number(totalReturned) || 0
    });

    const savedProduct = await product.save();
    const settings = await Settings.getSettings();
    const enriched = enrichProduct(savedProduct, settings.returnRateThreshold);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: enriched
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all products (with dynamic returnRate and status)
 * @route   GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const products = await Product.find().sort({ createdAt: -1 });

    const enrichedProducts = products.map(product =>
      enrichProduct(product, settings.returnRateThreshold)
    );

    res.status(200).json({
      success: true,
      data: enrichedProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get products that exceed the alert threshold
 * @route   GET /api/products/alerts
 */
const getAlertProducts = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const threshold = settings.returnRateThreshold;

    const products = await Product.find().sort({ createdAt: -1 });
    const alertProducts = products
      .map(product => enrichProduct(product, threshold))
      .filter(product => product.status === 'ALERT');

    res.status(200).json({
      success: true,
      data: alertProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product by ID (with dynamic returnRate and status)
 * @route   GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const settings = await Settings.getSettings();
    const enriched = enrichProduct(product, settings.returnRateThreshold);

    res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product by ID
 * @route   PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { productName, productCode, category, supplier, totalSold, totalReturned } = req.body;

    // Check duplicate productCode if productCode is being changed
    if (productCode) {
      const normalizedCode = productCode.trim().toUpperCase();
      const duplicate = await Product.findOne({
        productCode: normalizedCode,
        _id: { $ne: id }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Product code already exists'
        });
      }
      product.productCode = normalizedCode;
    }

    // Determine final values for totalSold and totalReturned to validate ratio
    const newSold = totalSold !== undefined ? Number(totalSold) : product.totalSold;
    const newReturned = totalReturned !== undefined ? Number(totalReturned) : product.totalReturned;

    if (newReturned > newSold) {
      return res.status(400).json({
        success: false,
        message: 'Total returned cannot be greater than total sold'
      });
    }

    if (productName !== undefined) product.productName = productName.trim();
    if (category !== undefined) product.category = category.trim();
    if (supplier !== undefined) product.supplier = supplier.trim();
    if (totalSold !== undefined) product.totalSold = newSold;
    if (totalReturned !== undefined) product.totalReturned = newReturned;

    const updatedProduct = await product.save();
    const settings = await Settings.getSettings();
    const enriched = enrichProduct(updatedProduct, settings.returnRateThreshold);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: enriched
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product code already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a product by ID
 * @route   DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Cascade delete any associated returns
    await Return.deleteMany({ productId: id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getAlertProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
