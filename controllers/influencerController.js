const Influencer = require('../models/Influencer');
const upload = require('../config/multerConfig');

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
