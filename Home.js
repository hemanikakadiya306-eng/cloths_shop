import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import ProductCard from "../../components/ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";

// Import local images
import premiumHero from "../../assets/images/premium-hero.png";
import premiumMen from "../../assets/images/premium-men.png";
import premiumAccessories from "../../assets/images/premium-accessories.png";
import showcaseCosmetic from "C:/Users/ASUS/.gemini/antigravity/brain/f12bf2de-3d98-4233-a5b4-abc853f71c53/luxury_cosmetics_showcase_1773670462948.png";
// Trending Images (NEW)
import menSuit from "../../assets/images/trending-men-suit.jpg";
import womenDress from "../../assets/images/trending-women-dress.jpg";
import blazerImg from "../../assets/images/trending-blazer.jpg";
import sareeImg from "../../assets/images/trending-saree.jpg";
import handbagImg from "../../assets/images/trending-handbag.jpg";
import womenAccessoryImg from "../../assets/images/trending-women-accessories.jpg";
// Keep existing fallbacks
import heroBanner1 from "../../assets/images/hero-banner-1.jpg";
import heroBanner2 from "../../assets/images/hero-banner-2.jpg";
import heroBanner3 from "../../assets/images/hero-banner-3.jpg";
import categoryMen from "../../assets/images/Cerealtube.jpeg";
import categoryWomen from "../../assets/images/womne banner.jpg";
import categoryKids from "../../assets/images/kids-herobanner.jpg";
import categoryUnisex from "../../assets/images/category-unisex.jpg";

function Home() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [brands, setBrands] = useState([]);
  const [trendingIndex, setTrendingIndex] = useState(0);

  // Local trending products organized by category - using local images with professional variety
  
    // Men Products - Professional Collection
   
    const localTrendingProducts = [
  {
    _id: "trending1",
    name: "Men Formal Suit",
    brand: "Van Heusen",
    price: 3499,
    discount: 25,
    images: [menSuit],
    description: "Premium formal suit for office and events.",
    category: "Men",
    subcategory: "Formal",
    rating: 4.8,
    numReviews: 234,
    badge: "Premium"
  },
  {
    _id: "trending2",
    name: "Women Dress",
    brand: "Zara",
    price: 2599,
    discount: 20,
    images: [womenDress],
    description: "Stylish western dress for modern women.",
    category: "Women",
    subcategory: "Western",
    rating: 4.7,
    numReviews: 189,
    badge: "Bestseller"
  },
  {
    _id: "trending3",
    name: "Classic Blazer",
    brand: "Park Avenue",
    price: 2999,
    discount: 30,
    images: [blazerImg],
    description: "Elegant blazer for premium look.",
    category: "Men",
    subcategory: "Blazers",
    rating: 4.9,
    numReviews: 156,
    badge: "Trending"
  },
  {
    _id: "trending4",
    name: "Designer Saree",
    brand: "Fabindia",
    price: 2899,
    discount: 40,
    images: [sareeImg],
    description: "Beautiful saree for special occasions.",
    category: "Women",
    subcategory: "Ethnic",
    rating: 4.8,
    numReviews: 298,
    badge: "Hot Deal"
  },
  {
    _id: "trending5",
    name: "Handbag",
    brand: "Caprese",
    price: 1999,
    discount: 35,
    images: [handbagImg],
    description: "Luxury handbag for daily use.",
    category: "Women",
    subcategory: "Accessories",
    rating: 4.6,
    numReviews: 167,
    badge: "New"
  },
  {
    _id: "trending6",
    name: "Women Accessories",
    brand: "Accessorize",
    price: 999,
    discount: 20,
    images: [womenAccessoryImg],
    description: "Stylish accessories collection.",
    category: "Women",
    subcategory: "Accessories",
    rating: 4.5,
    numReviews: 120,
    badge: "Popular"
  }
];


  // Group products by category
  const trendingByCategory = {
    Men: localTrendingProducts.filter(p => p.category === 'Men'),
    Women: localTrendingProducts.filter(p => p.category === 'Women')
  };


  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach(el => revealObserver.observe(el));

    // Luminescent Liquid Flow - Ripple Logic
    const handleLiquidRipple = (e) => {
      const liquidSection = document.querySelector('.liquid-flow-section');
      if (!liquidSection) return;
      
      const rect = liquidSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      liquidSection.style.setProperty('--ripple-x', `${x}px`);
      liquidSection.style.setProperty('--ripple-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleLiquidRipple);

    // Kinetic Depth Tracking

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('mousemove', handleLiquidRipple);
    };
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use local trending products immediately to ensure images display
        setTrendingProducts(localTrendingProducts);
        
        // Try to fetch from API, but keep local products as fallback
        try {
          const [productsRes, trendingRes, newArrivalsRes, brandsRes] = await Promise.all([
            axios.get("/api/products?limit=8"),
            axios.get("/api/products/trending"),
            axios.get("/api/products/new-arrivals"),
            axios.get("/api/products/brands")
          ]);

          // Handle responses safely
          setProducts(productsRes.data?.products || productsRes.data || []);
          if (trendingRes.data && trendingRes.data.length > 0) {
            setTrendingProducts(trendingRes.data);
          }
          setNewArrivals(newArrivalsRes.data || []);
          const uniqueBrands = brandsRes.data ? [...new Set(brandsRes.data)] : [];
          setBrands(uniqueBrands);
        } catch (apiError) {
          console.log("API error, using local data:", apiError);
          // Keep local trending products, set others to empty
          setProducts([]);
          setNewArrivals([]);
          setBrands([]);
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
        // Set local trending products as fallback
        setTrendingProducts(localTrendingProducts);
        setProducts([]);
        setNewArrivals([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const trendingSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }
    ]
  };

  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: "linear"
  };

  const categories = [
    { 
      name: "Men", 
      image: categoryMen, 
      count: "2,543 items",
      link: "/shop?category=Men"
    },
    { 
      name: "Women", 
      image: categoryWomen, 
      count: "3,821 items",
      link: "/shop?category=Women"
    },
    { 
      name: "Kids", 
      image: categoryKids, 
      count: "1,234 items",
      link: "/shop?category=Kids"
    },
    { 
      name: "Unisex", 
      image: categoryUnisex, 
      count: "987 items",
      link: "/shop?category=Unisex"
    }
  ];


  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="hyper-modern-page">
      {/* 1. Sleek Boutique Hero */}
      <section className="modern-hero">
        <Slider {...heroSettings}>
          {/* Slide 1: Women */}
          <div className="hero-slide">
            <div className="hero-inner">
              <div className="hero-content">
                <div className="hero-content-wrapper">
                  <span className="modern-label">Women's Collection 2026</span>
                  <h1>Elegant Femininity</h1>
                  <p>Curated premium pieces for the modern woman. Discover the art of sophisticated dressing.</p>
                  <Link to="/shop?category=Women" className="modern-btn">Shop Women</Link>
                </div>
              </div>
              <div className="hero-media">
                <img src={categoryWomen} alt="Women's Fashion" />
              </div>
            </div>
          </div>

          {/* Slide 2: Men */}
          <div className="hero-slide">
            <div className="hero-inner">
              <div className="hero-content">
                <div className="hero-content-wrapper">
                  <span className="modern-label">Men's Collection 2026</span>
                  <h1>Modern Masculinity</h1>
                  <p>Sharp tailoring and premium fabrics for the discerning gentleman. Elevate your daily attire.</p>
                  <Link to="/shop?category=Men" className="modern-btn">Shop Men</Link>
                </div>
              </div>
              <div className="hero-media">
                <img src={categoryMen} alt="Men's Fashion" />
              </div>
            </div>
          </div>

          {/* Slide 3: Kids */}
          <div className="hero-slide">
            <div className="hero-inner">
              <div className="hero-content">
                <div className="hero-content-wrapper">
                  <span className="modern-label">Kids Collection 2026</span>
                  <h1>Playful Comfort</h1>
                  <p>Quality apparel designed for active little ones. Stylish, durable, and comfortable.</p>
                  <Link to="/shop?category=Kids" className="modern-btn">Shop Kids</Link>
                </div>
              </div>
              <div className="hero-media">
                <img src={categoryKids} alt="Kids Wear" />
              </div>
            </div>
          </div>

          {/* Slide 4: Unisex */}
          <div className="hero-slide">
            <div className="hero-inner">
              <div className="hero-content">
                <div className="hero-content-wrapper">
                  <span className="modern-label">Unisex Collection 2026</span>
                  <h1>Universal Style</h1>
                  <p>Versatile pieces designed for everyone. Boundary-pushing fashion for the modern era.</p>
                  <Link to="/shop?category=Unisex" className="modern-btn">Shop Unisex</Link>
                </div>
              </div>
              <div className="hero-media">
                <img src={categoryUnisex} alt="Unisex Wear" />
              </div>
            </div>
          </div>
        </Slider>
      </section>

      {/* 1.5 Editorial Philosophy Break */}
      <section className="editorial-break" data-reveal>
        <div className="container">
          <div className="editorial-wrap">
            <p className="philosophy-text">
              "We believe in the <em>art of the unique</em>. Every piece is curated to tell a story of modern sophistication and timeless elegance."
            </p>
            <div className="editorial-divider"></div>
          </div>
        </div>
      </section>

      {/* 2. The Essential Triple - Precision Filtering Links */}
      <section className="triple-showcase" data-reveal>
        <div className="container-fluid p-0">
          <div className="triple-grid">
            <Link to="/shop?category=Women&subcategory=Accessories" className="triple-item">
              <img src={premiumAccessories} alt="Women Accessories" />
              <div className="triple-overlay">
                <span>Women's</span>
                <h3>Accessories</h3>
                <span className="shop-link">Explore Now</span>
              </div>
            </Link>
            <Link to="/shop?category=Cosmetics" className="triple-item">
              <img src={showcaseCosmetic} alt="Cosmetics" />
              <div className="triple-overlay">
                <span>Pure Beauty</span>
                <h3>Cosmetics</h3>
                <span className="shop-link">Explore Now</span>
              </div>
            </Link>
            <Link to="/shop?category=Men&subcategory=Accessories" className="triple-item">
              <img src={premiumMen} alt="Men Accessories" />
              <div className="triple-overlay">
                <span>Men's</span>
                <h3>Accessories</h3>
                <span className="shop-link">Explore Now</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. New Arrivals - Compact Grid */}
      <section className="modern-arrivals" data-reveal>
        <div className="container">
          <div className="modern-section-head">
            <h2>The New Season</h2>
            <Link to="/shop" className="view-all">View All →</Link>
          </div>
          <div className="modern-product-grid">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Luminescent Liquid Flow - Airy & Vibrant Brand Stream */}
      <section className="liquid-flow-section" data-reveal>
        <div className="liquid-background">
          <div className="liquid-blob blob-1"></div>
          <div className="liquid-blob blob-2"></div>
          <div className="liquid-blob blob-3"></div>
        </div>
        
        <div className="container position-relative z-index-2">
          <div className="liquid-head">
            <span className="liquid-tag">The Boutique Collection</span>
            <h2>Our Partners</h2>
          </div>
          
          <div className="liquid-stream-container">
            <div className="liquid-stream">
              {brands.map((brand, index) => (
                <Link 
                  key={index} 
                  to={`/shop?brand=${encodeURIComponent(brand)}`} 
                  className={`liquid-card card-${index}`}
                  style={{
                    '--card-index': index,
                    '--float-delay': `${index * 0.8}s`,
                    '--drift-speed': `${20 + (index % 5) * 2}s`
                  }}
                >
                  <div className="liquid-card-inner">
                    <span className="liquid-brand-name">{brand}</span>
                    <div className="liquid-card-glow"></div>
                  </div>
                  <div className="liquid-prism-edge"></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="liquid-ripple-overlay"></div>
      </section>

      {/* 5. Trending Now - Kinetic Depth Orbital Section */}
      <section className="kinetic-trending" data-reveal>
        <div className="container">
          <div className="modern-section-head">
            <h2>Trending Now</h2>
            <span className="kinetic-hint">Hover to Interact</span>
          </div>
          <div className="kinetic-gallery">
            {localTrendingProducts.map((product, idx) => (
              <div key={product._id} className={`kinetic-card-wrap wrap-${idx}`}>
                <div className="kinetic-card">
                  <div className="card-visual">
                    <img src={product.images?.[0]} alt={product.name} />
                    <div className="card-badge">{product.badge}</div>
                  </div>
                  <div className="card-info">
                    <span className="brand-tag">{product.brand}</span>
                    <h4>{product.name}</h4>
                    <Link to={`/product/${product._id}`} className="mini-link">Buy Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
