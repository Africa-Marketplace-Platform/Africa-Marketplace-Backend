const Influencer = require('../models/Influencer');
const upload = require('../middleware/multerConfig');

// Create a new influencer
exports.createInfluencer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, niche } = req.body;
    const profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : '';

    try {
      const influencer = new Influencer({
        name,
        niche,
        user: req.user.id,
        profilePic,
      });

      const createdInfluencer = await influencer.save();
      res.status(201).json(createdInfluencer);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Update an influencer
exports.updateInfluencer = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, niche } = req.body;
    const profilePic = req.file ? `/uploads/profilePics/${req.file.filename}` : '';

    try {
      let influencer = await Influencer.findById(req.params.id);

      if (!influencer) {
        return res.status(404).json({ message: 'Influencer not found' });
      }

      if (influencer.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }

      influencer.name = name || influencer.name;
      influencer.niche = niche || influencer.niche;
      if (profilePic) {
        influencer.profilePic = profilePic;
      }

      const updatedInfluencer = await influencer.save();
      res.json(updatedInfluencer);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

exports.searchInfluencers = async (req, res) => {
  const { niche, location, minFollowers, maxFollowers } = req.query;

  try {
    const query = {};
    if (niche) query.niche = niche;
    if (location) query.location = location;
    if (minFollowers) query.followers = { $gte: minFollowers };
    if (maxFollowers) query.followers = { ...query.followers, $lte: maxFollowers };

    const influencers = await Influencer.find(query);
    res.json(influencers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.contactInfluencer = async (req, res) => {
  const { influencerId, terms, deadline, payment } = req.body;

  try {
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ msg: 'Influencer not found' });
    }

    const collaboration = {
      business: req.user.id,
      terms,
      deadline,
      payment,
    };

    influencer.collaborations.push(collaboration);
    await influencer.save();
    res.status(201).json(influencer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.manageCollaboration = async (req, res) => {
  const { collaborationId, status } = req.body;

  try {
    const influencer = await Influencer.findOne({ 'collaborations._id': collaborationId });
    if (!influencer) {
      return res.status(404).json({ msg: 'Collaboration not found' });
    }

    const collaboration = influencer.collaborations.id(collaborationId);
    collaboration.status = status;

    await influencer.save();
    res.json(influencer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.rateInfluencer = async (req, res) => {
  const { influencerId, rating, review } = req.body;

  try {
    const influencer = await Influencer.findById(influencerId);
    if (!influencer) {
      return res.status(404).json({ msg: 'Influencer not found' });
    }

    const influencerRating = {
      business: req.user.id,
      rating,
      review,
    };

    influencer.ratings.push(influencerRating);
    await influencer.save();
    res.status(201).json(influencer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ msg: 'Influencer not found' });
    }
    res.json(influencer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);

    if (!influencer) {
      return res.status(404).json({ msg: 'Influencer not found' });
    }

    await influencer.remove();
    res.json({ msg: 'Influencer removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
