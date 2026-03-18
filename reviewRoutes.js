const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");

// Add a review
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      rating: Number(rating),
      comment,
      status: 'Pending' // Default status
    });

    await review.save();
    res.json({ message: "Review submitted for approval. It will appear once approved by admin.", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error submitting review" });
  }
});

// Get approved reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      status: 'Approved'
    }).sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

module.exports = router;