const express = require('express');
const router = express.Router();
const { protect, authorize, checkBusinessOwner } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
} = require('../controllers/productController');

router.route('/')
  .get(getProducts)
  .post(protect, authorize(['business_owner', 'admin']), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize(['business_owner', 'admin']), checkBusinessOwner, updateProduct)
  .delete(protect, authorize(['business_owner', 'admin']), checkBusinessOwner, deleteProduct);

router.route('/:id/reviews')
  .post(protect, addProductReview);

module.exports = router;
