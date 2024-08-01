const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createService, getServices, addReview } = require('../controllers/serviceController');

router.post('/', auth, createService);
router.get('/', getServices);
router.post('/review', auth, addReview);

module.exports = router;
