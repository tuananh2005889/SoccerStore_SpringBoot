import { useState, useEffect, useRef } from 'react';
import { FiShoppingCart, FiUser, FiLogIn, FiUserPlus, FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(5); // Example
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check token on mount
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav
      className={`
        w-full fixed top-0 z-50 transition-all duration-300
        ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-white/90 shadow-md py-4 backdrop-blur-sm'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <a
            href="/"
            className="text-2xl font-bold text-green-600 hover:text-green-700 transition-colors duration-200 flex items-center"
          >
            <span className="mr-1">⚽</span>
            <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              SoccerGear
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
          <a 
              href="/" 
              className="text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="product" 
              className="text-gray-700 hover:text-green-600 transition-colors duration-200 relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </a>

            {/* Cart */}
            <a href="/cart" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors duration-200">
              <FiShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </a>

            {/* Auth */}
            {!isLoggedIn ? (
              <div className="flex space-x-4">
                <a
                  href="/login"
                  className="flex items-center px-4 py-2 rounded-md text-green-600 border border-green-600 hover:bg-green-50 transition-all duration-200"
                >
                  <FiLogIn className="mr-2" />
                  Login
                </a>
            
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <FiUser className="w-6 h-6" />
                  <FiChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2"
                  >
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
