const Business = require('../models/Business');
const BusinessComparison = require('../models/BusinessComparison');

// Compare selected businesses by metrics
exports.compareBusinesses = async (req, res) => {
  try {
    const { businessIds, comparisonType, comments } = req.body; // Array of business IDs, comparison type, and optional comments

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
      business: business._id,
      metrics: {
        name: business.name,
        averageRating: business.averageRating || 0,
        reviewCount: business.ratings.length,
        priceRange: business.productsOffered.map((p) => p.price), // Pricing info
        services: business.servicesOffered.map((service) => service.name),
        location: business.location.city ? `${business.location.city}, ${business.location.country}` : '',
        verified: business.verified,
      },
    }));

    // Persist the comparison data for user history
    const businessComparison = new BusinessComparison({
      user: req.user._id,
      businesses: comparisonData,
      comparisonType: comparisonType || 'basic', // Default to basic if not provided
      comments: comments || '',
    });

    await businessComparison.save();

    res.json({ comparison: businessComparison });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's comparison history
exports.getComparisonHistory = async (req, res) => {
  try {
    const comparisons = await BusinessComparison.find({ user: req.user._id })
      .populate('businesses.business', 'name owner')
      .sort({ createdAt: -1 });

    res.json({ comparisons });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comparison record (admin or user)
exports.deleteComparison = async (req, res) => {
  try {
    const comparison = await BusinessComparison.findById(req.params.id);

    if (!comparison) {
      return res.status(404).json({ message: 'Comparison not found' });
    }

    if (comparison.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await comparison.remove();

    res.json({ message: 'Comparison deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
