import React, { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import NameIcon from "../assets/name.png";
import EmailIcon from "../assets/Email.png";
import LockIcon from "../assets/lock.png";
import EyeIcon from "../assets/eye.png";
import "../css/Settings.css";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put("/api/users/profile", {
        name,
        email,
        oldPassword,
        newPassword,
      });
      toast.success(response.data.message);
      localStorage.removeItem("token"); // Log out after update
      navigate("/login"); // Redirect to login
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed.");
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          
          <div className="input-wrapper">
            <img src={NameIcon} alt="Name Icon" className="input-icon" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
        </div>
        <div className="form-group">
          
          <div className="input-wrapper">
            <img src={EmailIcon} alt="Email Icon" className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Update Email"
            />
          </div>
        </div>
        <div className="form-group">
          
          <div className="input-wrapper">
            <img src={LockIcon} alt="Lock Icon" className="input-icon" />
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old Password"
            />
            <img
              src={EyeIcon}
              alt="Eye Icon"
              className="eye-icon"
              onClick={() => setShowOldPassword(!showOldPassword)}
            />
          </div>
        </div>
        <div className="form-group">
          
          <div className="input-wrapper">
            <img src={LockIcon} alt="Lock Icon" className="input-icon" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
            />
            <img
              src={EyeIcon}
              alt="Eye Icon"
              className="eye-icon"
              onClick={() => setShowNewPassword(!showNewPassword)}
            />
          </div>
        </div>
        <button type="submit" className="update-btn">
          Update
        </button>
      </form>
    </div>
  );
};

export default Settings;
