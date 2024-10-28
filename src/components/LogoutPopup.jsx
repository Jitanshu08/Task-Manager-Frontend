import React from "react";
import "../css/LogoutPopup.css";

const LogoutPopup = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-popup-overlay">
      <div className="logout-popup-content">
        <h2>Are you sure you want to Logout?</h2>
        <div className="logout-popup-buttons">
          <button className="confirm-logout-btn" onClick={onConfirm}>
            Yes, Logout
          </button>
          <button className="cancel-logout-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
