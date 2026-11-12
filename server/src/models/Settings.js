const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    returnRateThreshold: {
      type: Number,
      required: [true, 'Return rate threshold is required'],
      min: [0.01, 'Threshold must be greater than 0'],
      max: [100, 'Threshold cannot exceed 100'],
      default: 10
    }
  },
  {
    timestamps: true
  }
);

/**
 * Static method to retrieve the single active settings document
 * or initialize it with the default 10% threshold if not yet created.
 */
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ returnRateThreshold: 10 });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

