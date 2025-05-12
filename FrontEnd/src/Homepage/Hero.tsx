import React from 'react';

const Hero: React.FC = () => {
    return (
      <section className="bg-gradient-to-r from-green-500 to-green-700 text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Elevate Your Game</h1>
          <p className="text-lg md:text-xl mb-8">Discover top-quality football gear from shoes and balls to jerseys and apparel.</p>
          <a href="#products" className="inline-block bg-white text-green-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition">
            Shop Now
          </a>
        </div>
      </section>
    );
  };

  export default Hero;