const Service = require('../models/Service');

exports.createService = async (req, res) => {
  const { name, description, price, businessId } = req.body;

  try {
    const service = new Service({
      name,
      description,
      price,
      business: businessId,
    });

    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('business', ['name']);
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addReview = async (req, res) => {
  const { serviceId, rating, comment } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
    };

    service.reviews.push(review);
    await service.save();
    res.json(service.reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
