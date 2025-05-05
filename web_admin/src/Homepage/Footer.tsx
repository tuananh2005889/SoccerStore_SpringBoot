const Footer: React.FC = () => (
    <footer id="contact" className="bg-gray-800 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-white font-bold mb-2">SoccerGear</h4>
          <p>© 2025 SoccerGear. All rights reserved.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Contact Us</h4>
          <p>Email: nvtank@gmail.com</p>
          <p>Phone: 0374123205</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.99h-2.54V12h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.242 0-1.63.771-1.63 1.562V12h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012.07 8v1A10.66 10.66 0 013 5s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );

export default Footer;