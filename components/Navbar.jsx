// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Access Request System</Link>
      </div>
      
      <div className="navbar-menu">
        {token ? (
          <>
            <Link to="/dashboard" className="nav-item">Dashboard</Link>
            <Link to="/applications" className="nav-item">Applications</Link>
            <Link to="/request-access" className="nav-item">Request Access</Link>
            <button onClick={handleLogout} className="nav-item btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">Login</Link>
            <Link to="/register" className="nav-item">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;