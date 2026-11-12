const mongoose = require('mongoose');
const { Return } = require('../models/Return');
const Product = require('../models/Product');

/**
 * @desc    Create a new return record
 * @route   POST /api/returns
 */
const createReturn = async (req, res, next) => {
  try {
    const { productId, reason, quantity, notes, returnDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const returnQty = Number(quantity);

    // Prevent returns that exceed total units sold
    const newTotalReturned = product.totalReturned + returnQty;
    if (newTotalReturned > product.totalSold) {
      return res.status(400).json({
        success: false,
        message: 'Return quantity exceeds units sold'
      });
    }

    // Create and save return record
    const returnRecord = new Return({
      productId,
      reason,
      quantity: returnQty,
      notes: notes ? notes.trim() : '',
      returnDate: returnDate ? new Date(returnDate) : new Date()
    });

    const savedReturn = await returnRecord.save();

    // Update product totalReturned in MongoDB
    product.totalReturned = newTotalReturned;
    await product.save();

    // Populate product details for response
    await savedReturn.populate('productId', 'productName productCode category supplier');

    res.status(201).json({
      success: true,
      message: 'Return recorded successfully',
      data: savedReturn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all return records
 * @route   GET /api/returns
 */
const getReturns = async (req, res, next) => {
  try {
    const returns = await Return.find()
      .populate('productId', 'productName productCode category supplier')
      .sort({ returnDate: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: returns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single return record by ID
 * @route   GET /api/returns/:id
 */
const getReturnById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    const returnRecord = await Return.findById(id)
      .populate('productId', 'productName productCode category supplier');

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: returnRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a return record by ID
 * @route   DELETE /api/returns/:id
 */
const deleteReturn = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    const returnRecord = await Return.findById(id);
    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    // Reduce the product's totalReturned by the deleted return quantity
    const product = await Product.findById(returnRecord.productId);
    if (product) {
      product.totalReturned = Math.max(0, product.totalReturned - returnRecord.quantity);
      await product.save();
    }

    await Return.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Return record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReturn,
  getReturns,
  getReturnById,
  deleteReturn
};

