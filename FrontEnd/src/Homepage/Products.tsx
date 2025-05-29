import React from 'react';

const Products: React.FC = () => {
  const productData = [
    {
      title: 'Football Shoes',
      description: 'Engineered for speed and precision, offering superior grip and comfort on any surface.',
      icon: '👟'
    },
    {
      title: 'Football Balls',
      description: 'Crafted for optimal flight, touch, and durability, ensuring consistent performance.',
      icon: '⚽'
    },
    {
      title: 'Jerseys & Apparel',
      description: 'Lightweight, breathable fabrics designed for maximum comfort and unrestricted movement.',
      icon: '👕'
    }
  ];

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">Our <span className="text-green-700">Products</span></h2>
        <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {productData.map((item, index) => (
            <div 
              key={item.title} 
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out border border-gray-100 flex flex-col items-center text-center animate-fadeInUp"
              style={{ animationDelay: `${0.3 + index * 0.15}s` }} // Staggered animation
            >
              <div className="text-7xl mb-6 text-green-600 transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;