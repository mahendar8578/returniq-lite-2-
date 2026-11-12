const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    supplier: {
      type: String,
      required: [true, 'Supplier is required'],
      trim: true
    },
    totalSold: {
      type: Number,
      required: [true, 'Total sold is required'],
      min: [0, 'Total sold cannot be negative'],
      default: 0
    },
    totalReturned: {
      type: Number,
      required: [true, 'Total returned is required'],
      min: [0, 'Total returned cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);

