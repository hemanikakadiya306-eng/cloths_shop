
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiShoppingBag } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5004/api/admin/login",
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        const token = "admin-session-active";
        const adminData = response.data.data;

        // Save admin session
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(adminData));

        toast.success("Admin login successful");

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }

    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message || "Login failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FiShoppingBag className="login-logo" />
          <h1>Admin Login</h1>
          <p>Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <div className="input-with-icon">
              <FiMail className="input-icon" />

              <input
                type="email"
                placeholder="admin@clothshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-with-icon">
              <FiLock className="input-icon" />

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;