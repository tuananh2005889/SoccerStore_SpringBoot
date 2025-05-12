const Products: React.FC = () => {
    const productData = [
      {
        title: 'Football Shoes',
        description: 'Lightweight, durable shoes for optimal performance.',
        icon: '👟'
      },
      {
        title: 'Football Balls',
        description: 'Premium quality balls with excellent grip.',
        icon: '⚽'
      },
      {
        title: 'Jerseys & Apparel',
        description: 'Comfortable, breathable jerseys and training gear.',
        icon: '👕'
      }
    ];
  
    return (
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {productData.map((item) => (
              <div key={item.title} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="text-5xl mb-4 text-green-600">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  export default Products;