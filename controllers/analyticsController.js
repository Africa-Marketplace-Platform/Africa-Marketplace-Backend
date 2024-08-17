const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Business = require('../models/Business');

// Get sales performance data for a business
exports.getSalesPerformance = async (req, res) => {
  try {
    const { businessId } = req.user;

    const salesData = await Order.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      message: 'Sales performance data retrieved successfully.',
      salesData,
    });
  } catch (error) {
    console.error('Get sales performance error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve sales performance data.' });
  }
};

// Get customer demographics data
exports.getCustomerDemographics = async (req, res) => {
  try {
    const { businessId } = req.user;

    const customerData = await User.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      message: 'Customer demographics data retrieved successfully.',
      customerData,
    });
  } catch (error) {
    console.error('Get customer demographics error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve customer demographics data.' });
  }
};

// Get trending products/services data
exports.getTrendingProducts = async (req, res) => {
  try {
    const { businessId } = req.user;

    const trendingProducts = await Product.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: "$productName",
          totalSales: { $sum: "$sales" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }, // Limit to top 10 trending products
    ]);

    res.status(200).json({
      message: 'Trending products retrieved successfully.',
      trendingProducts,
    });
  } catch (error) {
    console.error('Get trending products error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve trending products.' });
  }
};

// Save dashboard preferences for the business
exports.saveDashboardPreferences = async (req, res) => {
  try {
    const { layoutConfig } = req.body;
    const businessId = req.user.businessId;

    const business = await Business.findById(businessId);
    if (business) {
      business.dashboardConfig = layoutConfig;
      await business.save();
      res.status(200).json({ message: 'Dashboard preferences saved successfully.' });
    } else {
      res.status(404).json({ message: 'Business not found.' });
    }
  } catch (error) {
    console.error('Save dashboard preferences error:', error.message);
    res.status(500).json({ message: 'Server error. Failed to save dashboard preferences.' });
  }
};
