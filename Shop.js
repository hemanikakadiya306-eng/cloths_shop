import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useSearchParams } from "react-router-dom";
import { FiFilter, FiGrid, FiList, FiHeart } from "react-icons/fi";
import ProductCard from "../../components/ProductCard";
import { safeLocalStorage } from "../../utils/localStorage";

function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    color: '',
    sort: 'newest'
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || '';
    const subcategory = params.get('subcategory') || '';
    const brand = params.get('brand') || '';
    const search = params.get('search') || '';

    setFilters(prev => ({
      ...prev,
      category,
      subcategory,
      brand,
      search
    }));
  }, [location]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.size) params.append('size', filters.size);
      if (filters.color) params.append('color', filters.color);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await axios.get(`/api/products?${params.toString()}`);

      // Handle response safely
      const products = response.data?.products || response.data || [];
      setProducts(products);
      setFilteredProducts(products);

      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Set empty arrays on error
      setProducts([]);
      setFilteredProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/products/brands");
      setBrands(response.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/products/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      sort: 'newest'
    };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const addToCart = async (product) => {
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
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (!token) {
        alert('Please login to add items to wishlist');
        return;
      }

      const response = await axios.post(
        "/api/wishlist/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(response.data.isInWishlist ? 'Added to wishlist!' : 'Removed from wishlist');
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert('Failed to update wishlist');
    }
  };

  const ProductListItem = ({ product }) => {
    const discountedPrice = Math.floor(product.price * (1 - (product.discount || 0) / 100));

    return (
      <div className="product-list-item fade-in">
        <div className="product-list-image">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/200x200'}
            alt={product.name}
          />
        </div>
        <div className="product-list-info">
          <h3 className="product-brand">{product.brand}</h3>
          <p className="product-name">{product.name}</p>
          <p className="product-description">{product.description}</p>
          <div className="product-price">
            <span className="price-current">₹{discountedPrice}</span>
            {product.discount > 0 && (
              <>
                <span className="price-original">₹{product.price}</span>
                <span className="price-discount">{product.discount}% OFF</span>
              </>
            )}
          </div>
          <div className="product-actions">
            <button 
              className="wishlist-btn"
              onClick={() => toggleWishlist(product._id)}
            >
              <FiHeart />
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>
            {filters.subcategory ? filters.subcategory : (filters.category || 'Shop')}
          </h1>
          <div className="shop-controls">
            <button
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter /> Filters
            </button>
            <div className="view-toggle">
              <button
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

        <div className="shop-content">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="btn btn-link" onClick={clearFilters}>
                Clear All
              </button>
            </div>

            <div className="filter-section">
              <h4>Category</h4>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Subcategory</h4>
              <select
                value={filters.subcategory}
                onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                className="filter-select"
              >
                <option value="">All Subcategories</option>
                <option value="Belt">Belt</option>
                <option value="Watch">Watch</option>
                <option value="Sunglasses">Sunglasses</option>
                <option value="Necklace">Necklace</option>
                <option value="Earrings">Earrings</option>
                <option value="Ring">Ring</option>
                <option value="Handbag / Purse">Handbag / Purse</option>
                <option value="Scarf">Scarf</option>
                <option value="Hat / Cap">Hat / Cap</option>
                <option value="Lipstick">Lipstick</option>
                <option value="Foundation">Foundation</option>
                <option value="Face Powder">Face Powder</option>
                <option value="Kajal / Eyeliner">Kajal / Eyeliner</option>
                <option value="Blush">Blush</option>
                <option value="Makeup Kit">Makeup Kit</option>
                <option value="Wallet">Wallet</option>
                <option value="Tie">Tie</option>
                <option value="Bracelet">Bracelet</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Brand</h4>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="filter-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-section">
              <h4>Size</h4>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="filter-select"
              >
                <option value="">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="3XL">3XL</option>
              </select>
            </div>

            <div className="filter-section">
              <h4>Sort By</h4>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="shop-main">
            <div className="products-header">
              <p>Showing {filteredProducts.length} products</p>
            </div>

            {viewMode === 'grid' ? (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="product-list">
                {filteredProducts.map(product => (
                  <ProductListItem key={product._id} product={product} />
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Shop;