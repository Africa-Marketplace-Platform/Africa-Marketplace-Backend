const Business = require('../models/Business');

exports.createBusiness = async (req, res) => {
  const { name, description, contactInfo, socialMediaLinks } = req.body;

  try {
    const business = new Business({
      name,
      description,
      contactInfo,
      socialMediaLinks,
      owner: req.user.id,
    });

    await business.save();
    res.status(201).json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate('owner', 'name email');
    res.json(businesses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner', 'name email');
    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }
    res.json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateBusiness = async (req, res) => {
  const { name, description, contactInfo, socialMediaLinks, stars } = req.body;

  try {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    business.name = name || business.name;
    business.description = description || business.description;
    business.contactInfo = contactInfo || business.contactInfo;
    business.socialMediaLinks = socialMediaLinks || business.socialMediaLinks;
    business.stars = stars !== undefined ? stars : business.stars;

    await business.save();
    res.json(business);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ msg: 'Business not found' });
    }

    await business.remove();
    res.json({ msg: 'Business removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
