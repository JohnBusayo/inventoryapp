import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoImage from "./images/Rccg_logo.png";  

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('dashboard');  

  return (
    <>
      <style>{`
        .navbar {
          background-color: #ffffff;
          color: #4a5568; /* Gray text for menu items */
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          font-family: 'Roboto', sans-serif;  /* Roboto font */
        }
        .navbar-container {
          max-width: 1400px;  /* Match app content width */
          margin: 0 auto;  /* Auto margins for centering */
          padding: 0 1rem;  /* Responsive padding */
          display: flex;
          justify-content: space-between;  /* Ensures space between logo/text and menu */
          align-items: center;
          height: 60px;
        }
        .navbar-brand .brand-link {
          color: #14213d; /* Primary color for brand */
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;  /* Space between logo and text */
          transition: color 0.3s ease;
        }
        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 4px;  /* Optional: rounded logo */
        }
        .navbar-brand .brand-link:hover {
          color: #0f1a2e; /* Darker primary on hover */
        }
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 1rem;  /* Space between menu items and toggle */
        }
        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
        }
        .nav-list.desktop-menu {
          gap: 2.5rem;  /* Space between nav links */
        }
        .nav-link {
          color: #4a5568; /* Gray text */
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-weight: 500;
          position: relative;
        }
        .nav-link:hover {
          color: #2d3748;
          background-color: #f7fafc; /* Light gray hover bg */
        }
        .nav-link.active {
          color: #2d3748;
          background-color: #edf2f7; /* Active light gray bg */
        }
        .menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        .menu-toggle span {
          width: 25px;
          height: 3px;
          background-color: #4a5568;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: #ffffff;
          flex-direction: column;
          gap: 0;
          border-top: 1px solid #e2e8f0;
          padding: 1rem 0;
          display: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .mobile-menu.active {
          display: flex;
        }
        .mobile-menu .nav-link {
          display: block;
          width: 100%;
          text-align: left;
          padding: 1rem 20px;
        }
        /* Responsive Design for margins/padding */
        @media (max-width: 576px) {
          .navbar-container {
            padding: 0 0.5rem;
          }
          .desktop-menu {
            display: none;
          }
          .menu-toggle {
            display: flex;
          }
          .brand-icon {
            width: 32px;
            height: 32px;
          }
          .navbar-brand .brand-link {
            font-size: 1.25rem;
          }
        }
        @media (min-width: 577px) and (max-width: 768px) {
          .navbar-container {
            padding: 0 0.75rem;
          }
        }
        @media (min-width: 769px) and (max-width: 992px) {
          .navbar-container {
            padding: 0 1rem;
          }
        }
        @media (min-width: 993px) {
          .navbar-container {
            padding: 0 1.5rem;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
        /* Ensure app content has white background */
        body {
          background-color: #ffffff;
          margin: 0;
          padding-top: 60px; /* Account for fixed navbar height */
          font-family: 'Roboto', sans-serif;  /* Global Roboto */
        }
      `}</style>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <img src={LogoImage} alt="Heaven's Gate Media Logo" className="brand-icon" />
              Heaven's Gate Media
            </Link>
          </div>

          <div className="navbar-menu">
            {/* Desktop Menu */}
            <ul className="nav-list desktop-menu">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveLink('dashboard')}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/add" 
                  className={`nav-link ${activeLink === 'add' ? 'active' : ''}`}
                  onClick={() => setActiveLink('add')}
                >
                  Add Item
                </Link>
              </li>
              <li>
                <Link 
                  to="/stock" 
                  className={`nav-link ${activeLink === 'stock' ? 'active' : ''}`}
                  onClick={() => setActiveLink('stock')}
                >
                  Stock Tracker
                </Link>
              </li>
             
              <li>
                <Link 
                  to="/reports" 
                  className={`nav-link ${activeLink === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveLink('reports')}
                >
                  Reports
                </Link>
              </li>
            </ul>

            {/* Mobile menu button */}
            <button 
              type="button"
              className="menu-toggle" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          {/* Mobile Menu */}
          <ul className={`nav-list mobile-menu ${isOpen ? 'active' : ''}`}>
            <li>
              <Link 
                to="/" 
                className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setActiveLink('dashboard');
                  setIsOpen(false);
                }}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/add" 
                className={`nav-link ${activeLink === 'add' ? 'active' : ''}`}
                onClick={() => {
                  setActiveLink('add');
                  setIsOpen(false);
                }}
              >
                Add Item
              </Link>
            </li>
            <li>
              <Link 
                to="/stock" 
                className={`nav-link ${activeLink === 'stock' ? 'active' : ''}`}
                onClick={() => {
                  setActiveLink('stock');
                  setIsOpen(false);
                }}
              >
                Stock Tracker
              </Link>
            </li>
           
            <li>
              <Link 
                to="/reports" 
                className={`nav-link ${activeLink === 'reports' ? 'active' : ''}`}
                onClick={() => {
                  setActiveLink('reports');
                  setIsOpen(false);
                }}
              >
                Reports
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;