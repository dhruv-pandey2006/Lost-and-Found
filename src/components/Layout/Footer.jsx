import React from 'react';
import { Link } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { isAdmin, isSecurity } = useAuth();

  return (
    <footer className="footer">
      <div className="container footer-container">

        {/* Col 1 */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            <Radar className="logo-icon" size={24} />
            <span className="logo-text">NIET Lost & Found</span>
          </Link>
          <p className="footer-tagline">
            Reuniting students with their belongings
          </p>
        </div>

        {/* Col 2 */}
        <div className="footer-col links-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/report-lost">Report Lost</Link></li>
            <li><Link to="/report-found">Report Found</Link></li>
            {(isAdmin || isSecurity) && <li><Link to="/browse">Browse Items</Link></li>}
          </ul>
        </div>

        {/* Col 3 */}
        <div className="footer-col contact-col">
          <h3>Contact</h3>
          <ul>
            <li>NIET, Greater Noida</li>
            <li>Security Office: Block A, Room 101</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
