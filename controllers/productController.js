const Product = require('../models/Product');
const upload = require('../config/multerConfig'); // Import the multer configuration

exports.createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, price, business, stock, category, tags, discount } = req.body;
    let images = [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      const product = new Product({
        name,
        description,
        price,
        business,
        images,
        stock,
        category,
        tags,
        discount,
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('business', 'name description');
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('business', 'name description');
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, description, price, stock, category, tags, discount } = req.body;
    let images = req.body.images || [];

    if (req.files) {
      images = req.files.map(file => file.path);
    }

    try {
      let product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.images = images;
      product.stock = stock !== undefined ? stock : product.stock;
      product.category = category || product.category;
      product.tags = tags || product.tags;
      product.discount = discount || product.discount;

      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await product.remove();
    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.addProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    const review = {
      user: req.user.id,
      rating,
      comment,
    };

    product.reviews.push(review);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
