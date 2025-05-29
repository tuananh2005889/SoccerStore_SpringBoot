import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-400">
      {/* Background overlay for subtle pattern/texture */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10 z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 animate-fadeInUp">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Elevate Your <span className="text-green-200">Game</span>
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90">
          Discover top-quality football gear, from precision shoes and premium balls to stylish jerseys and essential apparel.
        </p>
        <a 
          href="product" 
          className="inline-block bg-white text-green-800 font-bold px-8 py-4 rounded-full shadow-xl hover:bg-gray-100 transform hover:scale-105 transition duration-300 ease-in-out group"
        >
          Shop Now 
          <span className="ml-2 inline-block transform group-hover:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
    </section>
  );
};

export default Hero;