import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import BackImg from "../assets/Back.png";
import GroupImg from "../assets/Group.png";
import EmailIcon from "../assets/Email.png";
import LockIcon from "../assets/Lock.png";
import EyeIcon from "../assets/Eye.png";
import "../css/Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/api/users/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token);
      toast.success("Logged in successfully!");

      setIsLoggedIn(true);

      // Redirect to Board page after login
      navigate("/board");
    } catch (error) {
      toast.error("Invalid credentials!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-section">
        <div className="login-greeting">
          <img src={BackImg} alt="Background" className="back-img" />
          <img src={GroupImg} alt="Group" className="group-img" />
          <h2>Welcome aboard my friend</h2>
          <p>just a couple of clicks and we start</p>
        </div>
      </div>
      <div className="login-right-section">
        <form onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>
          <div className="login-input-wrapper">
            <img src={EmailIcon} alt="Email Icon" className="login-input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-input-wrapper">
            <img src={LockIcon} alt="Lock Icon" className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={EyeIcon}
              alt="Eye Icon"
              className="login-eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <button type="submit" className="login-submit-btn">Log in</button>
        </form>
        <p className="login-note">Have no account yet?</p>
        <button
          className="login-switch-btn"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
