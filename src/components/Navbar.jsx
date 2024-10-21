import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove the token from localStorage
    navigate('/login');  // Redirect to login page
  };

  return (
    <nav className="navbar">
      <ul>
        <li onClick={() => navigate('/board')}>Board</li>
        <li onClick={() => navigate('/analytics')}>Analytics</li>
        <li onClick={() => navigate('/settings')}>Settings</li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
