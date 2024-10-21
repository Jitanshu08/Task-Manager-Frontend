import React from 'react';
import Navbar from './Navbar';  

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        {children}  {/* Render the page content */}
      </div>
    </div>
  );
};

export default Layout;
