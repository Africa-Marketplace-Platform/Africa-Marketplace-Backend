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
  getFollowers,
  manageCollaboration,
  rateInfluencer,
  postContent,
  getContentByInfluencer,
  getContentByBusiness,
} = require('../controllers/influencerController');

// Influencer Management Routes
router.post('/', protect, authorize(['influencer', 'admin']), createInfluencer); // Create Influencer
router.get('/search', searchInfluencers); // Search Influencers
router.get('/:id', getInfluencerById); // Get Influencer by ID
router.put('/:id', protect, authorize(['influencer', 'admin']), updateInfluencer); // Update Influencer
router.delete('/:id', protect, authorize(['admin']), deleteInfluencer); // Delete Influencer (Admin only)

// Collaboration Management Routes
router.post('/contact', protect, authorize(['business', 'admin']), contactInfluencer); // Contact Influencer for Collaboration
router.post('/manage-collaboration', protect, authorize(['influencer', 'admin']), manageCollaboration); // Manage Collaboration Status

// Rating and Content Management Routes
router.post('/rate', protect, authorize(['business', 'admin']), rateInfluencer); // Rate Influencer after Collaboration
router.post('/content', protect, authorize(['influencer']), postContent); // Post Content as an Influencer
router.get('/content/influencer/:influencerId', protect, getContentByInfluencer); // Get Content by Influencer
router.get('/content/business/:businessId', protect, getContentByBusiness); // Get Content by Business
router.get('/:influencerId/followers', protect, getFollowers);
module.exports = router;
