import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi";
import { safeLocalStorage } from "../utils/localStorage";

function ProductCard({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const discountedPrice = Math.floor(product.price * (1 - (product.discount || 0) / 100));

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = safeLocalStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `/api/wishlist/check/${product._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product._id]);

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to cart');
        return;
      }

      await axios.post(
        "/api/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size: product.sizes?.[0] || 'M',
          color: product.colors?.[0] || 'Default'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Added to cart successfully!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || error.message || 'Unknown Error';
      alert(`Failed to add to cart: ${errorMsg}\nStatus: ${error.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  return (
    <>
      <div className="product-card">
        <Link to={`/product/${product._id}`} className="product-link">
          <div className="product-image-container">
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/250x320/282c3f/ffffff?text=No+Image'} 
              alt={product.name}
              className="product-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/250x320/282c3f/ffffff?text=No+Image';
              }}
            />
            
            {/* Product overlay with action buttons */}
            <div className="product-overlay">
              <button 
                className="quick-view-btn"
                onClick={handleQuickView}
                title="Quick View"
              >
                <FiEye />
              </button>
              <button 
                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <FiHeart />
              </button>
              <button 
                className="add-to-cart-btn"
                onClick={addToCart}
                disabled={loading}
                title="Add to Cart"
              >
                <FiShoppingBag />
              </button>
            </div>

            {/* Discount badge */}
            {product.discount > 0 && (
              <div className="discount-badge">
                {product.discount}% OFF
              </div>
            )}

            {/* Trending badge */}
            {product.trending && (
              <div className="trending-badge">
                Trending
              </div>
            )}

            {/* New arrival badge */}
            {product.newArrival && (
              <div className="new-arrival-badge">
                New
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <h3 className="product-name">{product.name}</h3>
            
            <div className="product-price">
              <span className="price-current">₹{discountedPrice}</span>
              {product.discount > 0 && (
                <>
                  <span className="price-original">₹{product.price}</span>
                  <span className="price-discount">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < (product.rating || 4) ? 'filled' : ''}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">({product.numReviews || 0})</span>
            </div>

            {/* Available sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="available-sizes">
                <span className="sizes-label">Sizes:</span>
                <div className="sizes-list">
                  {product.sizes.slice(0, 4).map((size, index) => (
                    <span key={index} className="size-tag">{size}</span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="more-sizes">+{product.sizes.length - 4}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="quick-view-modal" onClick={() => setShowQuickView(false)}>
          <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-modal"
              onClick={() => setShowQuickView(false)}
            >
              ×
            </button>
            
            <div className="quick-view-image">
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/400x400/282c3f/ffffff?text=No+Image'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400/282c3f/ffffff?text=No+Image';
                }}
              />
            </div>
            
            <div className="quick-view-details">
              <div className="product-brand">{product.brand}</div>
              <h2 className="product-name">{product.name}</h2>
              
              <div className="product-price">
                <span className="price-current">₹{discountedPrice}</span>
                {product.discount > 0 && (
                  <>
                    <span className="price-original">₹{product.price}</span>
                    <span className="price-discount">{product.discount}% OFF</span>
                  </>
                )}
              </div>
              
              <p className="product-description">{product.description}</p>
              
              <div className="quick-view-actions">
                <button 
                  className="btn btn-primary"
                  onClick={addToCart}
                  disabled={loading}
                >
                  <FiShoppingBag /> Add to Cart
                </button>
                <button 
                  className={`btn btn-outline ${isInWishlist ? 'active' : ''}`}
                  onClick={toggleWishlist}
                >
                  <FiHeart /> {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;