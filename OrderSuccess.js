import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";

function OrderSuccess() {
  const [orderId, setOrderId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    if (id) {
      setOrderId(id);
    } else {
      // If no ID, maybe they shouldn't be here, but we'll show a generic success
    }
  }, []);

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-msg">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          
          {orderId && (
            <div className="order-number">
              <span>Order Number:</span>
              <strong>#{orderId}</strong>
            </div>
          )}

          <div className="status-timeline">
            <div className="timeline-item active">
              <div className="dot"></div>
              <div className="label">Order Placed</div>
            </div>
            <div className="timeline-item">
              <div className="dot"></div>
              <div className="label">Processing</div>
            </div>
            <div className="timeline-item">
              <div className="dot"></div>
              <div className="label">Shipped</div>
            </div>
            <div className="timeline-item">
              <div className="dot"></div>
              <div className="label">Delivered</div>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/shop" className="btn btn-primary">
              <FiShoppingBag /> Continue Shopping
            </Link>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              Back to Home <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
