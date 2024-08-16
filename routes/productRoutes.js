const express = require('express');
const router = express.Router();
const { protect, authorize, checkBusinessOwner } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  applyCouponToProduct,
  deleteProduct,
  addProductReview,
  voteReview
} = require('../controllers/productController');
const couponController = require('../controllers/couponController'); // Ensure couponController is imported

// Routes for managing products
router.route('/')
  .get(getProducts)
  .post(protect, authorize(['business_owner', 'admin']), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize(['business_owner', 'admin']), checkBusinessOwner, updateProduct)
  .delete(protect, authorize(['business_owner', 'admin']), checkBusinessOwner, deleteProduct);

// Route for adding a review to a product
router.route('/:id/reviews')
  .post(protect, addProductReview);

// Route for voting on a product review
router.route('/:id/reviews/vote')
  .post(protect, voteReview);

// Route for applying a coupon to a product
router.route('/:id/coupon')
  .post(protect, authorize(['regular-user']), applyCouponToProduct);

// Route for creating a new coupon
// router.route('/coupon')
//   .post(protect, authorize(['business_owner', 'admin']), couponController.createCoupon);

module.exports = router;
