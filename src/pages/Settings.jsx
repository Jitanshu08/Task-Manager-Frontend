import React, { useState } from "react";
import API from "../services/api"; 
import { toast } from "react-toastify"; 
import { useNavigate } from "react-router-dom"; 
import "../css/Settings.css"; 

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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
      <h1>Update Profile</h1>
      <form onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Update Name"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Update Email"
          />
        </div>
        <div className="form-group">
          <label>Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter Old Password"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter New Password"
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Settings;
