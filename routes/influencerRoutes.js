const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createInfluencer, getInfluencerById, updateInfluencer, deleteInfluencer, searchInfluencers, contactInfluencer, manageCollaboration, rateInfluencer,  postContent, getContentByInfluencer, getContentByBusiness } = require('../controllers/influencerController');

// Only business owners and admins can create and manage influencers
router.post('/', protect, authorize(['business_owner', 'admin']), createInfluencer);
router.get('/search', searchInfluencers); // Added search route
router.get('/:id', getInfluencerById);
router.put('/:id', protect, authorize(['business_owner', 'admin']), updateInfluencer);
router.delete('/:id', protect, authorize(['business_owner', 'admin']), deleteInfluencer);
router.post('/contact', protect, authorize(['business_owner', 'admin']), contactInfluencer); // Added contact route
router.post('/manage-collaboration', protect, authorize(['business_owner', 'admin']), manageCollaboration); // Added manage collaboration route
router.post('/rate', protect, authorize(['business_owner', 'admin']), rateInfluencer); // Added rate route
router.post('/content', protect, authorize(['influencer']), postContent);

// Get content posted by a specific influencer
router.get('/content/influencer/:influencerId', protect, getContentByInfluencer);

// Get content related to a specific business
router.get('/content/business/:businessId', protect, getContentByBusiness);

module.exports = router;
