const User = require("../models/User");
const Business = require("../models/Business");
const Order = require("../models/Order");
const Review = require("../models/Review");

// Get business recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the user's previous interactions (favorites, reviews, orders)
    const user = await User.findById(userId).populate("favorites");
    const userOrders = await Order.find({ user: userId }).populate("business");
    const userReviews = await Review.find({ user: userId }).populate("business");

    // Get all businesses the user has interacted with
    const interactedBusinessIds = [
      ...new Set([
        ...user.favorites.map((fav) => fav._id.toString()),
        ...userOrders.map((order) => order.business._id.toString()),
        ...userReviews.map((review) => review.business._id.toString()),
      ]),
    ];

    // Get the categories and services the user prefers based on their interactions
    const preferredCategories = user.favorites.map((business) => business.categories).flat();
    const preferredServices = user.favorites.map((business) => business.servicesOffered).flat();

    // Fetch businesses that match the preferred categories and services and exclude businesses already interacted with
    const recommendedBusinesses = await Business.find({
      _id: { $nin: interactedBusinessIds }, // Exclude businesses the user has already interacted with
      $or: [
        { categories: { $in: preferredCategories } },
        { servicesOffered: { $in: preferredServices } },
      ],
    })
      .limit(10)
      .sort({ stars: -1 }); // Sort by ratings/stars to prioritize popular businesses

    // Combine recommendations with collaborative filtering based on similar users' preferences
    const similarUsers = await User.find({
      _id: { $ne: userId }, // Exclude the current user
      favorites: { $in: user.favorites.map((fav) => fav._id) }, // Find users with similar favorites
    });

    const collaborativeRecommendations = await Business.find({
      _id: { $nin: interactedBusinessIds },
      _id: { $in: similarUsers.map((u) => u.favorites).flat() },
    })
      .limit(5)
      .sort({ stars: -1 });

    // Combine content-based and collaborative filtering recommendations
    const combinedRecommendations = [
      ...recommendedBusinesses,
      ...collaborativeRecommendations,
    ];

    res.json(combinedRecommendations);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
