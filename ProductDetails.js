import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FiHeart, FiShoppingBag, FiStar, FiMinus, FiPlus } from "react-icons/fi";
import { safeLocalStorage } from "../../utils/localStorage";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkWishlistStatus();
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      alert('Please login to write a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post(
        "/api/reviews/add",
        {
          productId: id,
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Review submitted for approval!');
      setReviewComment("");
      setReviewRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      
      if (response.data.images?.length > 0) {
        setSelectedImage(0);
      }
      
      // Select first available size/color by default
      if (response.data.sizes?.length > 0) {
        setSelectedSize(response.data.sizes[0]);
      }
      if (response.data.colors?.length > 0) {
        setSelectedColor(response.data.colors[0]);
      }
      
      fetchRelatedProducts(response.data.category, response.data._id);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category, productId) => {
    try {
      const response = await axios.get(`/api/products?category=${category}&limit=4`);
      const filtered = response.data.products?.filter(p => p._id !== productId) || [];
      setRelatedProducts(filtered.slice(0, 4));
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        const response = await axios.get(`/api/wishlist/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsInWishlist(response.data.isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const addToCart = async () => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      if (product.sizes?.length > 0 && !selectedSize) {
        alert('Please select a size');
        return;
      }

      await axios.post(
        "/api/cart/add",
        {
          productId: product._id,
          quantity,
          size: selectedSize || 'N/A',
          color: selectedColor || 'Default'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Added to cart successfully!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || error.message || 'Unknown Error';
      alert(`Failed to add to cart: ${errorMsg}\nStatus: ${error.response?.status}`);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to wishlist');
        return;
      }

      const response = await axios.post(
        "/api/wishlist/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsInWishlist(response.data.isInWishlist);
      alert(response.data.isInWishlist ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert('Failed to update wishlist');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const discountedPrice = product ? Math.floor(product.price * (1 - (product.discount || 0) / 100)) : 0;

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="no-products">
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-details">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500x600'} 
                alt={product.name}
              />
            </div>
            
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < Math.floor(product.rating || 0) ? 'filled' : ''}
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.rating?.toFixed(1) || 0} ({product.numReviews || 0} reviews)
              </span>
            </div>

            <div className="product-price-details">
              <div className="price-current">₹{discountedPrice}</div>
              {product.discount > 0 && (
                <>
                  <div className="price-original">₹{product.price}</div>
                  <div className="price-discount">{product.discount}% OFF</div>
                </>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              <h3>Select Size</h3>
              {product.sizes?.length > 0 ? (
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-options-msg">No size options available for this product.</p>
              )}
            </div>

            {/* Color Selection */}
            <div className="color-selection">
              <h3>Select Color</h3>
              {product.colors?.length > 0 ? (
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.toLowerCase().includes('brwon') ? '#A52A2A' : color.toLowerCase() }}
                      title={color}
                    >
                      {selectedColor === color && <FiStar size={12} color="#fff" />}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="no-options-msg">No color options available for this product.</p>
              )}
            </div>

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FiMinus />
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus />
                </button>
              </div>
              <p className="stock-info">Only {product.stock} left in stock!</p>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={addToCart}
                disabled={product.stock <= 0}
              >
                <FiShoppingBag /> Add to Cart
              </button>
              
              <button 
                className={`btn btn-outline wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                <FiHeart /> {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Product Meta */}
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{product.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Subcategory:</span>
                <span className="meta-value">{product.subcategory}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="product-reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews ({reviews.length})</h2>
          </div>

          <div className="reviews-container">
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="review-card">
                    <div className="review-user-info">
                      <div className="user-avatar">
                        {review.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{review.userName}</h4>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FiStar 
                              key={i} 
                              className={i < review.rating ? 'filled' : ''} 
                              size={14}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>

            {/* Write a Review */}
            <div className="write-review">
              <h3>Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="rating-select">
                  <span>Your Rating:</span>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map(num => (
                      <FiStar
                        key={num}
                        className={num <= reviewRating ? 'filled' : ''}
                        onClick={() => setReviewRating(num)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="comment-input">
                  <textarea
                    placeholder="Share your thoughts about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2 className="section-title">Related Products</h2>
            <div className="product-grid">
              {relatedProducts.map(relatedProduct => {
                const relatedDiscountedPrice = Math.floor(relatedProduct.price * (1 - (relatedProduct.discount || 0) / 100));
                
                return (
                  <div key={relatedProduct._id} className="product-card">
                    <Link to={`/product/${relatedProduct._id}`}>
                      <div className="product-image-container">
                        <img 
                          src={relatedProduct.images?.[0] || 'https://via.placeholder.com/250x320'} 
                          alt={relatedProduct.name} 
                          className="product-image"
                        />
                      </div>
                      <div className="product-info">
                        <h3 className="product-brand">{relatedProduct.brand}</h3>
                        <p className="product-name">{relatedProduct.name}</p>
                        <div className="product-price">
                          <span className="price-current">₹{relatedDiscountedPrice}</span>
                          {relatedProduct.discount > 0 && (
                            <>
                              <span className="price-original">₹{relatedProduct.price}</span>
                              <span className="price-discount">{relatedProduct.discount}% OFF</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;