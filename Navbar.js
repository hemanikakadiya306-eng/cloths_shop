import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiChevronDown } from "react-icons/fi";
import { safeLocalStorage } from "../utils/localStorage";

function Navbar() {
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        const userData = safeLocalStorage.getJSONItem('user');
        if (userData) {
          setUser(userData);
        }
      }

      const cartItems = safeLocalStorage.getJSONItem('cartItems', []);
      setCartCount(cartItems.reduce((total, item) => total + (item.quantity || 0), 0));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      // Set defaults if localStorage is corrupted
      setCartCount(0);
      setUser(null);
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleDropdownHover = (menu) => {
    setActiveDropdown(menu);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            Clothes Shop
          </Link>

          <div className="navbar-search">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search for products, brands and more..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <FiSearch />
              </button>
            </form>
          </div>

          <div className="navbar-actions">
            {user ? (
              <div className="navbar-action">
                <FiUser />
                <span>{user.name}</span>
                <button onClick={handleLogout} className="btn btn-link">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="navbar-action">
                <FiUser />
                <span>Profile</span>
              </Link>
            )}

            <Link to="/wishlist" className="navbar-action">
              <FiHeart />
              <span>Wishlist</span>
            </Link>

            <Link to="/cart" className="navbar-action">
              <FiShoppingBag />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation */}





      <div className="category-nav">
        <div className="container">
          <div className="category-nav-items">
            <Link to="/" className="category-link">Home</Link>
            <Link to="/shop" className="category-link">SHOP </Link>
            <div 
              className="category-dropdown-container"
              onMouseEnter={() => handleDropdownHover('men')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link to="/shop?category=Men" className="category-link dropdown-trigger">
                Men
                <FiChevronDown className={`dropdown-arrow ${activeDropdown === 'men' ? 'open' : ''}`} />
              </Link>
              
              {activeDropdown === 'men' && (
                <div className="dropdown-menu men-dropdown">
                  <div className="dropdown-section">
                    <h4 className="dropdown-section-title">Accessories</h4>
                    <div className="dropdown-items">
                      <Link to="/shop?category=Men&subcategory=Belt" className="dropdown-item">Belt</Link>
                      <Link to="/shop?category=Men&subcategory=Watch" className="dropdown-item">Watch</Link>
                      <Link to="/shop?category=Men&subcategory=Sunglasses" className="dropdown-item">Sunglasses</Link>
                      <Link to="/shop?category=Men&subcategory=Wallet" className="dropdown-item">Wallet</Link>
                      <Link to="/shop?category=Men&subcategory=Hat / Cap" className="dropdown-item">Cap / Hat</Link>
                      <Link to="/shop?category=Men&subcategory=Tie" className="dropdown-item">Tie</Link>
                      <Link to="/shop?category=Men&subcategory=Bracelet" className="dropdown-item">Bracelet</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="category-dropdown-container"
              onMouseEnter={() => handleDropdownHover('women')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link to="/shop?category=Women" className="category-link dropdown-trigger">
                Women
                <FiChevronDown className={`dropdown-arrow ${activeDropdown === 'women' ? 'open' : ''}`} />
              </Link>
              
              {activeDropdown === 'women' && (
                <div className="dropdown-menu women-dropdown">
                  <div className="dropdown-section">
                    <h4 className="dropdown-section-title">Accessories</h4>
                    <div className="dropdown-items">
                      <Link to="/shop?category=Women&subcategory=Belt" className="dropdown-item">Belt</Link>
                      <Link to="/shop?category=Women&subcategory=Watch" className="dropdown-item">Watch</Link>
                      <Link to="/shop?category=Women&subcategory=Sunglasses" className="dropdown-item">Sunglasses</Link>
                      <Link to="/shop?category=Women&subcategory=Necklace" className="dropdown-item">Necklace</Link>
                      <Link to="/shop?category=Women&subcategory=Earrings" className="dropdown-item">Earrings</Link>
                      <Link to="/shop?category=Women&subcategory=Ring" className="dropdown-item">Ring</Link>
                      <Link to="/shop?category=Women&subcategory=Handbag / Purse" className="dropdown-item">Handbag / Purse</Link>
                      <Link to="/shop?category=Women&subcategory=Scarf" className="dropdown-item">Scarf</Link>
                      <Link to="/shop?category=Women&subcategory=Hat / Cap" className="dropdown-item">Hat / Cap</Link>
                    </div>
                  </div>
                  
                  <div className="dropdown-section">
                    <h4 className="dropdown-section-title">Cosmetics</h4>
                    <div className="dropdown-items">
                      <Link to="/shop?category=Women&subcategory=Lipstick" className="dropdown-item">Lipstick</Link>
                      <Link to="/shop?category=Women&subcategory=Foundation" className="dropdown-item">Foundation</Link>
                      <Link to="/shop?category=Women&subcategory=Face Powder" className="dropdown-item">Face Powder</Link>
                      <Link to="/shop?category=Women&subcategory=Kajal / Eyeliner" className="dropdown-item">Kajal / Eyeliner</Link>
                      <Link to="/shop?category=Women&subcategory=Blush" className="dropdown-item">Blush</Link>
                      <Link to="/shop?category=Women&subcategory=Makeup Kit" className="dropdown-item">Makeup Kit</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/shop?category=Kids" className="category-link">
              Kids
            </Link>
            
            <Link to="/shop?category=Unisex" className="category-link">
              Unisex
            </Link>

            
            
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;