// controllers/businessComparisonController.js
const Business = require('../models/Business');

// Compare selected businesses by metrics
exports.compareBusinesses = async (req, res) => {
  try {
    const { businessIds } = req.body; // Array of business IDs selected for comparison

    // Fetch the businesses to compare
    const businesses = await Business.find({ _id: { $in: businessIds } })
      .populate('owner', 'name')
      .populate('ratings.user', 'name')
      .populate('servicesOffered', 'name price')
      .populate('productsOffered', 'name price');

    if (!businesses.length) {
      return res.status(404).json({ message: 'Businesses not found' });
    }

    // Comparison metrics and relevant details for UI
    const comparisonData = businesses.map((business) => ({
      name: business.name,
      averageRating: business.averageRating,
      reviewCount: business.ratings.length,
      priceRange: business.productsOffered.map((p) => p.price), // Pricing info
      services: business.servicesOffered.map((service) => service.name),
      location: business.location.city ? `${business.location.city}, ${business.location.country}` : '',
      verified: business.verified,
    }));

    res.json({ businesses: comparisonData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
