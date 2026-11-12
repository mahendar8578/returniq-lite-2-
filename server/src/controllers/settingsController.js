const Settings = require('../models/Settings');

/**
 * @desc    Get current system settings
 * @route   GET /api/settings
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({
      success: true,
      data: {
        returnRateThreshold: settings.returnRateThreshold
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update return-rate alert threshold
 * @route   PUT /api/settings
 */
const updateSettings = async (req, res, next) => {
  try {
    const { returnRateThreshold } = req.body;

    if (returnRateThreshold === undefined || returnRateThreshold === null || isNaN(Number(returnRateThreshold))) {
      return res.status(400).json({
        success: false,
        message: 'Threshold must be a valid number'
      });
    }

    const thresholdNum = Number(returnRateThreshold);

    if (thresholdNum <= 0 || thresholdNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Threshold must be between 0 and 100'
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ returnRateThreshold: thresholdNum });
    } else {
      settings.returnRateThreshold = thresholdNum;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        returnRateThreshold: settings.returnRateThreshold
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};

