import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { safeLocalStorage } from "../../utils/localStorage";

function Checkout() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState({
        street: '', city: '', state: '', pincode: '', country: 'India', phone: ''
    });
    const [couponCode, setCouponCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showQRCode, setShowQRCode] = useState(false);
    const [placing, setPlacing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const token = safeLocalStorage.getItem('token');
            if (!token) return navigate('/login');

            const response = await axios.get("/api/cart", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(response.data);
        } catch (error) {
            console.error("Fetch cart error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return alert('Enter a coupon code');
        try {
            const token = safeLocalStorage.getItem('token');
            const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            const response = await axios.post("/api/orders/validate-coupon", {
                code: couponCode,
                cartTotal: subtotal
            }, { headers: { Authorization: `Bearer ${token}` } });

            setDiscountAmount(response.data.discountAmount);
            setAppliedCoupon(response.data.couponCode);
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.message || 'Invalid coupon');
            setDiscountAmount(0);
            setAppliedCoupon("");
        }
    };

    const placeOrder = async () => {
        try {
            if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
                return alert("Please fill all address fields");
            }

            if (paymentMethod === "Online" && !showQRCode) {
                setShowQRCode(true);
                return;
            }

            setPlacing(true);
            const token = safeLocalStorage.getItem('token');
            const items = cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price
            }));

            const response = await axios.post("/api/orders/place", {
                items,
                shippingAddress: address,
                paymentMethod: paymentMethod,
                shippingCharges: subtotal > 500 ? 0 : 50,
                couponCode: appliedCoupon
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert("Order placed successfully!");
            navigate(`/order-success?id=${response.data.order._id}`);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to place order.");
        } finally {
            setPlacing(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading checkout...</p></div>;
    if (!cart || !cart.items.length) return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}>🛒</div>
            <h2>Your cart is empty.</h2>
            <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ marginTop: '20px' }}>Shop Now</button>
        </div>
    );

    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const finalTotal = subtotal + shipping - discountAmount;

    return (
        <div className="checkout-page">
            <div className="container">
                <div className="checkout-grid">
                    <div className="checkout-main">
                        <div className="checkout-card">
                            <h2><span className="step-num">1</span> Shipping Information</h2>
                            <div className="address-form">
                                <div className="form-group full">
                                    <label>Street Address</label>
                                    <input 
                                        placeholder="Flat, House no., Building, Company, Apartment" 
                                        onChange={e => setAddress({ ...address, street: e.target.value })} 
                                        value={address.street}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input 
                                            placeholder="City" 
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            value={address.city}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input 
                                            placeholder="State" 
                                            onChange={e => setAddress({ ...address, state: e.target.value })}
                                            value={address.state}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input 
                                            placeholder="6-digit Pincode" 
                                            onChange={e => setAddress({ ...address, pincode: e.target.value })}
                                            value={address.pincode}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input 
                                            placeholder="10-digit mobile number" 
                                            onChange={e => setAddress({ ...address, phone: e.target.value })}
                                            value={address.phone}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-card">
                            <h2><span className="step-num">2</span> Payment Method</h2>
                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="COD" 
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => {setPaymentMethod('COD'); setShowQRCode(false);}}
                                    />
                                    <div className="option-info">
                                        <strong>Cash on Delivery (COD)</strong>
                                        <span>Pay with cash when your order is delivered</span>
                                    </div>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'Online' ? 'selected' : ''}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="Online" 
                                        checked={paymentMethod === 'Online'}
                                        onChange={() => setPaymentMethod('Online')}
                                    />
                                    <div className="option-info">
                                        <strong>Online Payment (UPI/QR Code)</strong>
                                        <span>Scan QR code and pay using any UPI app</span>
                                    </div>
                                </label>
                            </div>

                            {showQRCode && paymentMethod === 'Online' && (
                                <div className="qr-code-section">
                                    <h3>Scan to Pay ₹{finalTotal.toFixed(2)}</h3>
                                    <div className="qr-container">
                                        <img src="/payment_qr_code.png" alt="Payment QR Code" className="payment-qr" />
                                    </div>
                                    <p className="qr-note">After scanning and paying, click "Confirm Order" below.</p>
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowQRCode(false)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        Change Payment Method
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="summary-card sticky">
                            <h2>Order Summary</h2>
                            <div className="summary-items-list">
                                {cart.items.map((item, idx) => (
                                    <div key={idx} className="summary-item">
                                        <img src={item.product.images?.[0] || 'https://via.placeholder.com/50x50'} alt={item.product.name} />
                                        <div className="summary-item-info">
                                            <p className="item-title">{item.product.name}</p>
                                            <p className="item-meta">Qty: {item.quantity} | Size: {item.size}</p>
                                        </div>
                                        <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="coupon-section">
                                <div className="input-with-btn">
                                    <input
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        placeholder="Enter coupon code"
                                    />
                                    <button onClick={handleApplyCoupon} className="btn-small">Apply</button>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="applied-coupon">
                                        Applied: {appliedCoupon} <span>-₹{discountAmount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="price-details">
                                <div className="price-row">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="price-row">
                                    <span>Shipping:</span>
                                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="price-row discount">
                                        <span>Discount:</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="price-divider"></div>
                                <div className="price-row total">
                                    <span>Total Payable:</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={placeOrder}
                                className="btn btn-primary btn-block btn-lg"
                                disabled={placing}
                            >
                                {placing ? 'Placing Order...' : (paymentMethod === 'Online' && !showQRCode ? 'Proceed to Payment' : 'Confirm Order')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;