const Service = require('../models/Service');
const upload = require('../config/multerConfig'); // Import the multer configuration

// Create a new service
exports.createService = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, price, business, isAvailable, categories, bookingInfo } = req.body;
    let images = [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      const service = new Service({
        name,
        description,
        price,
        business,
        images,
        isAvailable,
        categories,
        bookingInfo
      });

      const createdService = await service.save();
      res.status(201).json(createdService);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error" });
    }
  });
};


// Get all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate("business", "name contactInfo");
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("business", "name contactInfo");
    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update a service
exports.updateService = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err });
      }
  
      const { name, description, price, isAvailable, categories, bookingInfo } = req.body;
      let images = req.body.images || [];
  
      if (req.files) {
        images = req.files.map(file => file.path);
      }
  
      try {
        let service = await Service.findById(req.params.id);
  
        if (!service) {
          return res.status(404).json({ message: "Service not found" });
        }
  
        if (service.business.toString() !== req.user.id && req.user.role !== "admin") {
          return res.status(401).json({ message: "User not authorized" });
        }
  
        service.name = name || service.name;
        service.description = description || service.description;
        service.price = price || service.price;
        service.images = images;
        service.isAvailable = isAvailable !== undefined ? isAvailable : service.isAvailable;
        service.categories = categories || service.categories;
        service.bookingInfo = bookingInfo || service.bookingInfo;
  
        const updatedService = await service.save();
        res.json(updatedService);
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
      }
    });
  };

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ msg: "Service not found" });
    }

    await service.remove();
    res.json({ msg: "Service removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
