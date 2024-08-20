const Collaboration = require('../models/Collaboration');
const { logActivity } = require('./activityController');

// Create a collaboration request
exports.createCollaboration = async (req, res) => {
  try {
    const { collaboratorId, collaborationType, details, startDate, endDate, renewalOption, terms } = req.body;
    const entityId = req.user.entityId; // This represents either a business or an influencer

    const collaboration = new Collaboration({
      entity: entityId,
      collaborator: collaboratorId,
      collaborationType,
      details,
      status: 'pending', // Pending until accepted
      startDate,
      endDate,
      renewalOption,
      terms,
    });

    await collaboration.save();

    // Log the activity
    logActivity(req.user.id, 'Created collaboration request', {
      resourceType: 'Collaboration',
      resourceId: collaboration._id,
    });

    res.json({ message: 'Collaboration request created successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a collaboration request
exports.acceptCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration || collaboration.collaborator.toString() !== req.user.entityId) {
      return res.status(404).json({ message: 'Collaboration not found or unauthorized' });
    }

    collaboration.status = 'accepted';
    await collaboration.save();

    // Log the activity
    logActivity(req.user.id, 'Accepted collaboration', {
      resourceType: 'Collaboration',
      resourceId: collaboration._id,
    });

    res.json({ message: 'Collaboration accepted successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a collaboration request
exports.rejectCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration || collaboration.collaborator.toString() !== req.user.entityId) {
      return res.status(404).json({ message: 'Collaboration not found or unauthorized' });
    }

    collaboration.status = 'rejected';
    await collaboration.save();

    // Log the activity
    logActivity(req.user.id, 'Rejected collaboration', {
      resourceType: 'Collaboration',
      resourceId: collaboration._id,
    });

    res.json({ message: 'Collaboration rejected.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// End a collaboration
exports.endCollaboration = async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration || (collaboration.entity.toString() !== req.user.entityId && collaboration.collaborator.toString() !== req.user.entityId)) {
      return res.status(404).json({ message: 'Collaboration not found or unauthorized' });
    }

    collaboration.status = 'ended';
    await collaboration.save();

    // Log the activity
    logActivity(req.user.id, 'Ended collaboration', {
      resourceType: 'Collaboration',
      resourceId: collaboration._id,
    });

    res.json({ message: 'Collaboration ended successfully.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all collaborations for an entity (business or influencer)
exports.getCollaborations = async (req, res) => {
  try {
    const entityId = req.user.entityId;

    const collaborations = await Collaboration.find({
      $or: [{ entity: entityId }, { collaborator: entityId }],
    }).populate('entity collaborator', 'name');

    res.json(collaborations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
