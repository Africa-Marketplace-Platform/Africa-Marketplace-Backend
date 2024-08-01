const Influencer = require('../models/Influencer');

exports.createInfluencer = async (req, res) => {
  const { name, niche } = req.body;

  try {
    const influencer = new Influencer({
      name,
      niche,
      user: req.user.id,
    });

    await influencer.save();
    res.status(201).json(influencer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getInfluencers = async (req, res) => {
  try {
    const influencers = await Influencer.find().populate('user', 'name email');
    res.json(influencers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
