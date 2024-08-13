const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createInfluencer,
  getInfluencerById,
  updateInfluencer,
  deleteInfluencer,
  searchInfluencers,
  contactInfluencer,
  manageCollaboration,
  rateInfluencer,
  postContent,
  getContentByInfluencer,
  getContentByBusiness,
} = require('../controllers/influencerController');

// Influencer Management Routes
router.post('/', protect, authorize(['business_owner', 'admin']), createInfluencer);
router.get('/search', searchInfluencers);
router.get('/:id', getInfluencerById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateInfluencer);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteInfluencer);

// Collaboration Management Routes
router.post('/contact', protect, authorize(['business_owner', 'admin']), contactInfluencer);
router.post('/manage-collaboration', protect, authorize(['business_owner', 'admin']), manageCollaboration);

// Rating and Content Management Routes
router.post('/rate', protect, authorize(['business_owner', 'admin']), rateInfluencer);
router.post('/content', protect, authorize(['influencer']), postContent);
router.get('/content/influencer/:influencerId', protect, getContentByInfluencer);
router.get('/content/business/:businessId', protect, getContentByBusiness);

module.exports = router;
