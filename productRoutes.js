const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Category = require("../models/Category");
const { auth, adminAuth } = require("../middleware/auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      trending,
      newArrival,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    if (category) {
      if (category === 'Women') {
        query.category = { $in: ['Women', 'Women Accessories', 'Women Cosmetic'] };
      } else if (category === 'Men') {
        query.category = { $in: ['Men', 'Men Accessories'] };
      } else {
        query.category = category;
      }
    }
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (size) query.sizes = size;
    if (color) query.colors = color;
    if (trending === 'true') query.trending = true;
    if (newArrival === 'true') query.newArrival = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price-low') sortOption.price = 1;
    else if (sort === 'price-high') sortOption.price = -1;
    else if (sort === 'newest') sortOption.createdAt = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const { page = 1, limit = 12 } = req.query;

    const products = await Product.find({
      $or: [
        { name: { $regex: key, $options: "i" } },
        { brand: { $regex: key, $options: "i" } },
        { category: { $regex: key, $options: "i" } },
        { subcategory: { $regex: key, $options: "i" } },
        { tags: { $regex: key, $options: "i" } }
      ]
    });

    res.json({ products });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const products = await Product.find({ trending: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(20);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find({ newArrival: true })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/brands", async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", auth, adminAuth, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      discount,
      description,
      category,
      subcategory,
      sizes,
      colors,
      stock,
      trending,
      newArrival,
      tags
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one product image" });
    }

    const images = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

    const product = new Product({
      name,
      brand,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      images,
      description,
      category,
      subcategory,
      sizes: sizes ? sizes.split(',') : [],
      colors: colors ? colors.split(',') : [],
      stock: parseInt(stock),
      trending: trending === 'true',
      newArrival: newArrival === 'true',
      tags: tags ? tags.split(',') : []
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, adminAuth, upload.array("images", 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      brand,
      price,
      discount,
      description,
      category,
      subcategory,
      sizes,
      colors,
      stock,
      trending,
      newArrival,
      tags
    } = req.body;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    product.name = name || product.name;
    product.brand = brand || product.brand;
    product.price = price ? parseFloat(price) : product.price;
    product.discount = discount ? parseFloat(discount) : product.discount;
    product.description = description || product.description;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.sizes = sizes ? sizes.split(',') : product.sizes;
    product.colors = colors ? colors.split(',') : product.colors;
    product.stock = stock ? parseInt(stock) : product.stock;
    product.trending = trending !== undefined ? trending === 'true' : product.trending;
    product.newArrival = newArrival !== undefined ? newArrival === 'true' : product.newArrival;
    product.tags = tags ? tags.split(',') : product.tags;

    await product.save();
    res.json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;