const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/check/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    
    const isInWishlist = user.wishlist.includes(productId);
    res.json({ isInWishlist });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/toggle", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    
    if (user.wishlist.includes(productId)) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      res.json({ isInWishlist: false });
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();
      res.json({ isInWishlist: true });
    }
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();
    await user.populate('wishlist');

    res.json(user.wishlist);
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.wishlist.includes(req.params.productId)) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    user.wishlist = user.wishlist.filter(item => item.toString() !== req.params.productId);
    await user.save();
    await user.populate('wishlist');

    res.json(user.wishlist);
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;