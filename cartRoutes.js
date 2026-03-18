const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    console.log("Add to Cart Request:", { productId, quantity, size, color, userId: req.user._id });

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Found Product:", { name: product.name, stock: product.stock, price: product.price });

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      console.log("Creating new cart for user:", req.user._id);
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === (size || undefined) && 
      item.color === (color || undefined)
    );

    if (existingItemIndex !== -1) {
      console.log("Updating existing item quantity");
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      console.log("Adding new item to cart");
      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      cart.items.push({
        product: productId,
        quantity,
        size: size || undefined,
        color: color || undefined,
        price: Math.max(0, discountedPrice)
      });
    }

    await cart.save();
    await cart.populate('items.product');

    console.log("Cart saved successfully");
    res.json(cart);
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ 
      message: error.message || "Server error",
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
});

router.put("/update/:itemId", auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(item.product);
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/remove/:itemId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;