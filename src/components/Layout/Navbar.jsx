import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Menu, X, Bell, LogOut, User, Search, Shield,
  LayoutDashboard, Plus, FileText, ChevronDown
} from 'lucide-react';
import nietLogo from '../../assets/niet logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin, isSecurity } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [bellDropdownOpen, setBellDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (bellDropdownRef.current && !bellDropdownRef.current.contains(event.target)) {
        setBellDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const renderNavLinks = () => {
    if (!user) {
      return null;
    }

    return (
      <>
        <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        {(isAdmin || isSecurity) && (
          <Link to="/browse" className={`navbar-link ${isActive('/browse') ? 'active' : ''}`}>
            <Search size={16} />
            <span>Browse</span>
          </Link>
        )}
        <Link to="/report-lost" className={`navbar-link ${isActive('/report-lost') ? 'active' : ''}`}>
          <Plus size={16} />
          <span>Report Lost</span>
        </Link>
        <Link to="/report-found" className={`navbar-link ${isActive('/report-found') ? 'active' : ''}`}>
          <Plus size={16} />
          <span>Report Found</span>
        </Link>
        <Link to="/my-reports" className={`navbar-link ${isActive('/my-reports') ? 'active' : ''}`}>
          <FileText size={16} />
          <span>My Reports</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`navbar-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
            <Shield size={16} />
            <span>Admin Panel</span>
          </Link>
        )}
        {isSecurity && (
          <Link to="/security" className={`navbar-link security-link ${isActive('/security') ? 'active' : ''}`}>
            <Shield size={16} />
            <span>Security Desk</span>
          </Link>
        )}
      </>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-container container">
        
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={nietLogo} alt="NIET Greater Noida" className="logo-image" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links desktop-only">
          {renderNavLinks()}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              {/* Notifications */}
              <div className="navbar-bell-container" ref={bellDropdownRef}>
                <button 
                  className="navbar-bell" 
                  onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                {bellDropdownOpen && (
                  <div className="navbar-dropdown bell-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <Link to="/notifications" onClick={() => setBellDropdownOpen(false)}>View All</Link>
                    </div>
                    {/* Add notification list preview here if needed, for now just a link */}
                    <div className="dropdown-body empty">
                       <p>Check all notifications page</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="navbar-user-container" ref={userDropdownRef}>
                <button 
                  className="navbar-user" 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <span className="user-name desktop-only">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} className="desktop-only" />
                </button>
                
                {userDropdownOpen && (
                  <div className="navbar-dropdown user-dropdown">
                    <div className="dropdown-user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="role-badge">{user.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <User size={16} />
                      Profile Settings
                    </Link>
                    <button className="dropdown-item text-error" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons desktop-only">
              <Link to="/login" className="btn btn-primary btn-md">Login</Link>
              <Link to="/register" className="btn btn-primary btn-md">Register</Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button 
            className="navbar-mobile-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {renderNavLinks()}
          {!user && (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn btn-primary btn-md full-width">Login</Link>
              <Link to="/register" className="btn btn-primary btn-md full-width">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
