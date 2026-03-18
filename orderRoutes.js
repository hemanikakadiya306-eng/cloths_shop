const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { auth, adminAuth } = require("../middleware/auth");

router.post("/place", auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'COD',
      shippingCharges = 0,
      couponCode
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
        name: product.name,
        image: product.images[0]
      });

      product.stock -= item.quantity;
      await product.save();
    }

    let discountAmount = 0;

    if (couponCode) {
      const Coupon = require('../models/Coupon');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

      if (coupon && new Date(coupon.expiryDate) > new Date() && totalAmount >= coupon.minPurchaseAmount) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (totalAmount * coupon.discountAmount) / 100;
        } else {
          discountAmount = coupon.discountAmount;
        }

        coupon.usedCount += 1;
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          coupon.isActive = false;
        }
        await coupon.save();
      }
    }

    const finalAmount = totalAmount + shippingCharges - discountAmount;

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      shippingCharges,
      discountAmount,
      finalAmount,
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await order.save();

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    await order.populate('items.product');

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});


router.post("/validate-coupon", auth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid or inactive coupon code" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountAmount) / 100;
    } else {
      discountAmount = coupon.discountAmount;
    }

    res.json({
      success: true,
      discountAmount,
      couponCode: coupon.code,
      message: "Coupon applied successfully!"
    });
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/all", auth, adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.put("/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (orderStatus === 'Shipped') {
      order.trackingId = 'TRK' + Date.now();
    }

    await order.save();
    await order.populate('items.product');

    res.json(order);
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = 'Cancelled';

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.save();
    await order.populate('items.product');

    res.json(order);
  } catch (error) {
    console.error("ORDER PLACEMENT ERROR:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;