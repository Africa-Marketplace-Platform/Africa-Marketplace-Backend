const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  bulkImportProducts,
  bulkExportProducts
} = require('../controllers/productController');

// Only business owners and admins can create and manage products
router.post('/', protect, authorize(['business_owner', 'admin']), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateProduct);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteProduct);
router.post('/:id/reviews', protect, addProductReview);
router.post('/bulk-import', protect, authorize(['admin']), bulkImportProducts);
router.get('/bulk-export', protect, authorize(['admin']), bulkExportProducts);

module.exports = router;
