import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ONLINE SHOPPING</h3>
            <ul>
              <li><Link to="/shop?category=Men">Men</Link></li>
              <li><Link to="/shop?category=Women">Women</Link></li>
              <li><Link to="/shop?category=Kids">Kids</Link></li>
              <li><Link to="/shop?category=Unisex">Unisex</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>CUSTOMER POLICIES</h3>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#returns">Returns & Refunds</a></li>
              <li><a href="#shipping">Shipping Information</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>USEFUL LINKS</h3>
            <ul>
              <li><Link to="/offers">Offers & Deals</Link></li>
              <li><Link to="/trending">Trending Now</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/brands">Top Brands</Link></li>
              <li><Link to="/sale">Sale</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>EXPERIENCE APP</h3>
            <ul>
              <li><a href="#mobile-app">Download Mobile App</a></li>
              <li><a href="#ios">iOS App</a></li>
              <li><a href="#android">Android App</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>KEEP IN TOUCH</h3>
            <ul>
              <li><a href="#facebook">Facebook</a></li>
              <li><a href="#instagram">Instagram</a></li>
              <li><a href="#twitter">Twitter</a></li>
              <li><a href="#youtube">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Clothes Shop. All rights reserved.</p>
          <p>Made with ❤️ for modern fashion shopping</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;