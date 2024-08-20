const InfluencerContent = require('../models/InfluencerContent');
const Influencer = require('../models/Influencer');
const Business = require('../models/Business');
const upload = require('../middleware/multerConfig');
const moderateContent = require('../middleware/moderationMiddleware');

// Create a new influencer
exports.createInfluencer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, niche, location, followers, engagementRate, bio, socialMediaLinks } = req.body;
    const profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : '';

    try {
      const influencer = new Influencer({
        name,
        niche,
        location,
        followers,
        engagementRate,
        bio,
        socialMediaLinks,
        user: req.user.id,
        profilePic,
      });

      const createdInfluencer = await influencer.save();
      return res.status(201).json(createdInfluencer);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

// Update an influencer
exports.updateInfluencer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, niche, location, followers, engagementRate, bio, socialMediaLinks } = req.body;
    const profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : '';

    try {
      const influencer = await Influencer.findById(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: 'Influencer not found' });
      }

      if (influencer.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }

      influencer.name = name || influencer.name;
      influencer.niche = niche || influencer.niche;
      influencer.location = location || influencer.location;
      influencer.followers = followers || influencer.followers;
      influencer.engagementRate = engagementRate || influencer.engagementRate;
      influencer.bio = bio || influencer.bio;
      influencer.socialMediaLinks = socialMediaLinks || influencer.socialMediaLinks;
      if (profilePic) {
        influencer.profilePic = profilePic;
      }

      const updatedInfluencer = await influencer.save();
      return res.json(updatedInfluencer);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

// Search influencers based on various criteria
exports.searchInfluencers = async (req, res) => {
  const { niche, location, minFollowers, maxFollowers, minEngagementRate } = req.query;

  try {
    const query = {};
    if (niche) query.niche = niche;
    if (location) query.location = location;
    if (minFollowers) query.followers = { $gte: minFollowers };
    if (maxFollowers) query.followers = { ...query.followers, $lte: maxFollowers };
    if (minEngagementRate) query.engagementRate = { $gte: minEngagementRate };

    const influencers = await Influencer.find(query);
    return res.json(influencers);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Contact influencer to propose a collaboration
exports.contactInfluencer = async (req, res) => {
  const { influencerId, terms, deadline, payment } = req.body;

  try {
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    const collaboration = {
      business: req.user.id,
      terms,
      deadline,
      payment,
    };

    influencer.collaborations.push(collaboration);
    await influencer.save();
    return res.status(201).json(influencer);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Manage the status of a collaboration
exports.manageCollaboration = async (req, res) => {
  const { collaborationId, status } = req.body;

  try {
    const influencer = await Influencer.findOne({ 'collaborations._id': collaborationId });
    if (!influencer) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    const collaboration = influencer.collaborations.id(collaborationId);
    collaboration.status = status;

    await influencer.save();
    return res.json(influencer);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Rate an influencer after a collaboration
exports.rateInfluencer = async (req, res) => {
  const { influencerId, rating, review } = req.body;

  try {
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    const influencerRating = {
      business: req.user.id,
      rating,
      review,
    };

    influencer.ratings.push(influencerRating);
    await influencer.save();
    return res.status(201).json(influencer);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get influencer by ID
exports.getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    return res.json(influencer);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete an influencer
exports.deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    await influencer.remove();
    return res.json({ message: 'Influencer removed' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Post content by an influencer
exports.postContent = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { businessId, content, tags, contentType } = req.body;
    const media = req.file ? `/uploads/media/${req.file.filename}` : '';

    try {
      // Moderate content before saving
      await moderateContent(req, res, async () => {
        const influencer = await Influencer.findById(req.user.id);
        const business = await Business.findById(businessId);

        if (!influencer || !business) {
          return res.status(404).json({ message: 'Influencer or business not found' });
        }

        const newContent = new InfluencerContent({
          influencer: influencer._id,
          business: business._id,
          content,
          media,
          tags,
          contentType,
        });

        const savedContent = await newContent.save();
        return res.status(201).json(savedContent);
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

// Get content by influencer
exports.getContentByInfluencer = async (req, res) => {
  try {
    const content = await InfluencerContent.find({ influencer: req.params.influencerId })
      .populate('business', 'name')
      .sort({ createdAt: -1 });
    return res.json(content);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get content by business
exports.getContentByBusiness = async (req, res) => {
  try {
    const content = await InfluencerContent.find({ business: req.params.businessId })
      .populate('influencer', 'name')
      .sort({ createdAt: -1 });
    return res.json(content);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
