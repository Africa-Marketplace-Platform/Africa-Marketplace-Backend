const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Service = require('../models/Service');

// Get Admin Analytics
/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get admin analytics
 *     description: Retrieves analytics for admins, including the total number of users, businesses, products, and services.
 *     tags:
 *       - Admin Analytics
 *     responses:
 *       200:
 *         description: Successfully retrieved admin analytics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: integer
 *                   description: The total number of users.
 *                 businesses:
 *                   type: integer
 *                   description: The total number of businesses.
 *                 products:
 *                   type: integer
 *                   description: The total number of products.
 *                 services:
 *                   type: integer
 *                   description: The total number of services.
 *       500:
 *         description: Server error. Failed to retrieve admin analytics.
 */
exports.getAdminAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const businessCount = await Business.countDocuments();
    const productCount = await Product.countDocuments();
    const serviceCount = await Service.countDocuments();

    res.status(200).json({
      message: 'Admin analytics retrieved successfully.',
      users: userCount,
      businesses: businessCount,
      products: productCount,
      services: serviceCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error. Failed to retrieve admin analytics.' });
  }
};
