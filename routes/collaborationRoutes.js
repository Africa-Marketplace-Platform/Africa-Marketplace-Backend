const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createCollaboration,
  acceptCollaboration,
  rejectCollaboration,
  endCollaboration,
  getCollaborations,
} = require('../controllers/collaborationController');

const router = express.Router();

// Create a collaboration request
router.post('/', protect, authorize(['business_owner', 'influencer']), createCollaboration);

// Accept a collaboration request
router.put('/:id/accept', protect, authorize(['business_owner', 'influencer']), acceptCollaboration);

// Reject a collaboration request
router.put('/:id/reject', protect, authorize(['business_owner', 'influencer']), rejectCollaboration);

// End a collaboration
router.put('/:id/end', protect, authorize(['business_owner', 'influencer']), endCollaboration);

// Get all collaborations for the logged-in entity (business or influencer)
router.get('/', protect, authorize(['business_owner', 'influencer']), getCollaborations);

module.exports = router;
