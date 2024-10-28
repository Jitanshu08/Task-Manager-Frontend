import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CodeSandboxIcon from "../assets/codesandbox.png";
import BoardIcon from "../assets/board.png";
import AnalyticsIcon from "../assets/database.png";
import SettingsIcon from "../assets/settings.png";
import LogoutPopup from "../components/LogoutPopup"
import LogoutIcon from "../assets/logout_icon.png";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State to keep track of the active page
  const [activePage, setActivePage] = useState(location.pathname);
  const [isLogoutPopupOpen, setLogoutPopupOpen] = useState(false);

  const handleNavigation = (path) => {
    setActivePage(path);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav className="app-navbar">
        <div className="navbar-header">
          <img src={CodeSandboxIcon} alt="Pro Manage" className="navbar-logo" />
          <h1 className="navbar-title">Pro Manage</h1>
        </div>
        <ul className="navbar-menu">
          <li
            className={`navbar-item ${activePage === "/board" ? "active" : ""}`}
            onClick={() => handleNavigation("/board")}
          >
            <img src={BoardIcon} alt="Board" className="navbar-icon" />
            Board
          </li>
          <li
            className={`navbar-item ${
              activePage === "/analytics" ? "active" : ""
            }`}
            onClick={() => handleNavigation("/analytics")}
          >
            <img src={AnalyticsIcon} alt="Analytics" className="navbar-icon" />
            Analytics
          </li>
          <li
            className={`navbar-item ${
              activePage === "/settings" ? "active" : ""
            }`}
            onClick={() => handleNavigation("/settings")}
          >
            <img src={SettingsIcon} alt="Settings" className="navbar-icon" />
            Settings
          </li>
        </ul>
        <ul className="navbar-footer">
          <li
            className="navbar-item navbar-logout"
            onClick={() => setLogoutPopupOpen(true)} // Show popup on logout click
          >
            <img src={LogoutIcon} alt="Logout" className="navbar-icon" />
            Logout
          </li>
        </ul>
      </nav>

      {/* Logout Confirmation Popup */}
      <LogoutPopup
        isOpen={isLogoutPopupOpen}
        onConfirm={handleLogout} 
        onCancel={() => setLogoutPopupOpen(false)} 
      />
    </>
  );
};

export default Navbar;