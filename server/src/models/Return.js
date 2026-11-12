const mongoose = require('mongoose');

const ALLOWED_REASONS = [
  'Damaged',
  'Wrong Product',
  'Size/Fit',
  'Quality Issue',
  'Customer Changed Mind',
  'Late Delivery',
  'Other'
];

const returnSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    reason: {
      type: String,
      required: [true, 'Return reason is required'],
      enum: {
        values: ALLOWED_REASONS,
        message: '{VALUE} is not a valid return reason'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    returnDate: {
      type: Date,
      required: [true, 'Return date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = {
  Return: mongoose.model('Return', returnSchema),
  ALLOWED_REASONS
};

