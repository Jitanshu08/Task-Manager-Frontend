import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import BackImg from "../assets/Back.png";
import GroupImg from "../assets/Group.png";
import NameIcon from "../assets/name.png";
import EmailIcon from "../assets/Email.png";
import LockIcon from "../assets/lock.png";
import EyeIcon from "../assets/eye.png";
import "../css/Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const response = await API.post("/api/users/register", {
        name,
        email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      toast.success("Registered successfully!");
    } catch (error) {
      toast.error("Registration failed!");
    }
  };

  return (
    <div className="register-page">
      <div className="register-left-section">
        <div className="register-greeting">
          <img src={BackImg} alt="Background" className="back-img" />
          <img src={GroupImg} alt="Group" className="group-img" />
          <h2>Welcome aboard my friend</h2>
          <p>just a couple of clicks and we start</p>
        </div>
      </div>
      <div className="register-right-section">
        <form onSubmit={handleRegister}>
          <h2 className="register-title">Register</h2>
          <div className="register-input-wrapper">
            <img
              src={NameIcon}
              alt="Name Icon"
              className="register-input-icon"
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="register-input-wrapper">
            <img
              src={EmailIcon}
              alt="Email Icon"
              className="register-input-icon"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="register-input-wrapper">
            <img
              src={LockIcon}
              alt="Lock Icon"
              className="register-input-icon"
            />
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
              className="register-eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <div className="register-input-wrapper">
            <img
              src={LockIcon}
              alt="Lock Icon"
              className="register-input-icon"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <img
              src={EyeIcon}
              alt="Eye Icon"
              className="register-eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
          <button type="submit" className="register-submit-btn">
            Register
          </button>
        </form>
        <p className="register-note">Have an account?</p>
        <button
          className="register-switch-btn"
          onClick={() => navigate("/login")}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default Register;
