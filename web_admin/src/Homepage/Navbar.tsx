const Navbar: React.FC = () => {
    return (
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="text-2xl font-bold text-green-600">SoccerGear</a>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-700 hover:text-green-600">Home</a>
              <a href="#about" className="text-gray-700 hover:text-green-600">About</a>
              <a href="#products" className="text-gray-700 hover:text-green-600">Products</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600">Contact</a>
            </div>
            <div className="flex items-center md:hidden">
              {/* Mobile Menu Button Placeholder */}
              <button aria-label="Toggle Menu">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };
  export default Navbar;