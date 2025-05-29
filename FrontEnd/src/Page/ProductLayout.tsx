import { FiShoppingCart, FiSearch } from "react-icons/fi"; 
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Navbar from "../Homepage/Navbar";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Filter } from "lucide-react"; 
import axios, { AxiosError } from "axios";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom"; 
import Footer from "../Homepage/Footer";

interface Product {
  productId: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  yearOfManufacture: number | string;
  size: number | string;
  material: string;
  images: string[];
  price: number;
  quantity: number;
  rating?: number;
  reviews?: number;
}

const ProductLayout = () => {
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string>("default");

  const productsPerPage = 12;

  // Enhanced filtering logic with memoization for better performance
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Text search - check name, brand, category, description
      const searchMatch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const categoryMatch = !selectedCategory || product.category === selectedCategory;

      // Price range filter
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return searchMatch && categoryMatch && priceMatch;
    });

    // Sorting logic
    switch (sortOption) {
      case "price-low-high":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => Number(b.yearOfManufacture) - Number(a.yearOfManufacture));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortOption]);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Get unique categories with product count
  const allCategories = useMemo(() => {
    const categoryCount = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(categoryCount).map(category => ({
      name: category,
      count: categoryCount[category]
    }));
  }, [products]);

  // Get price range from products
  const priceRangeFromProducts = useMemo(() => {
    if (products.length === 0) return [0, 1000];
    const prices = products.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const handleGetAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8080';
      const res = await axios.get(`${apiUrl}/app/product/all`);
      const productsWithRatings = res.data.map((product: Product) => ({
        ...product,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        reviews: Math.floor(Math.random() * 200) + 10
      }));
      setProducts(productsWithRatings);
      
      // Set initial price range based on actual product prices
      const prices = productsWithRatings.map((p: Product) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortOption]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    setPriceRange([priceRange[0], newMax]);
  };

  const handleSetPriceRange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleAddToCart = async (product: Product) => {
    if (product.quantity <= 0 || isInCart(product.productId)) {
      return;
    }
    
    try {
      await addToCart({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '/placeholder-product.jpg',
        cartItemId: product.productId
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        const errorCode = error.response?.status || 'N/A';
      }
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    return stars;
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceRange(priceRangeFromProducts);
    setSortOption("default");
    setCurrentPage(1);
  };

  useEffect(() => {
    handleGetAllProducts();
  }, [handleGetAllProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
    
      <main className="flex-grow pt-20 pb-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-b-3xl shadow-xl p-10 lg:p-12 mb-12 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
              Discover Your Next Favorite Gear
            </h1>
            <p className="text-xl font-light mb-8 max-w-2xl">
              Explore high-quality football products from leading brands, built for performance and durability.
            </p>
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:outline-none text-gray-900 placeholder-gray-500 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>

                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-5 py-2.5 rounded-full font-medium transition-colors duration-200 ${
                      !selectedCategory
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleCategoryFilter(null)}
                  >
                    All Categories ({products.length})
                  </button>
                  {allCategories.map(category => (
                    <button
                      key={category.name}
                      className={`px-5 py-2.5 rounded-full font-medium transition-colors duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => handleCategoryFilter(category.name)}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Price Range</h3>
                    <div className="flex flex-col gap-4">
                      <input
                        type="range"
                        min={priceRangeFromProducts[0]}
                        max={priceRangeFromProducts[1]}
                        value={priceRange[1]}
                        onChange={handlePriceRangeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="text-base font-semibold text-gray-800 text-center">
                        {priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}VNĐ
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleSetPriceRange(0, 50)} 
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${priceRange[1] === 50000 && priceRange[0] === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >0 - 50000 VNĐ</button>
                        <button 
                          onClick={() => handleSetPriceRange(50, 100)} 
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${priceRange[1] === 100000 && priceRange[0] === 50000 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >50000 VNĐ - 100000 VNĐ </button>
                        <button 
                          onClick={() => handleSetPriceRange(100, 200)} 
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${priceRange[1] === 200000 && priceRange[0] === 100000 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >100000 VNĐ - 200000 VNĐ</button>
                        <button 
                          onClick={() => handleSetPriceRange(200, priceRangeFromProducts[1])} 
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${priceRange[1] === priceRangeFromProducts[1] && priceRange[0] === 200000 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >200000 VNĐ +</button>
                      </div>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Results Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Showing <span className="font-semibold text-emerald-600">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
                      </p>
                      {searchTerm && (
                        <p className="text-sm text-gray-600 mb-2">
                          Search: "<span className="font-semibold">{searchTerm}</span>"
                        </p>
                      )}
                      {selectedCategory && (
                        <p className="text-sm text-gray-600 mb-2">
                          Category: <span className="font-semibold">{selectedCategory}</span>
                        </p>
                      )}
                      <button
                        onClick={resetAllFilters}
                        className="mt-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-emerald-500" />
            </div>
          ) : (
            <>
              {filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                    {currentProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative flex flex-col"
                      >
                        <Link to={`/product/${product.productId}`} className="block flex-shrink-0">
                          <div className="relative h-56 w-full overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-sm">No image available</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="p-5 flex flex-col flex-grow">
                          <Link to={`/product/${product.productId}`} className="block">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-emerald-700 transition-colors mb-1">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                          
                          <div className="flex items-center gap-1 mb-3">
                            {renderStars(product.rating)}
                            <span className="text-xs text-gray-600 ml-1">
                              ({product.reviews} reviews)
                            </span>
                          </div>

                          <div className="flex justify-between items-end mt-auto">
                            <div className="text-2xl font-extrabold text-emerald-700 whitespace-nowrap">
                              {product.price.toLocaleString('en-US')} VNĐ
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              product.quantity > 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : product.quantity > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {product.quantity > 0 ? `In stock (${product.quantity})` : 'Out of stock'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity <= 0 || isInCart(product.productId)}
                          className={`absolute inset-x-0 bottom-0 py-3 text-base font-semibold
                                     transition-all duration-300 transform translate-y-full group-hover:translate-y-0
                                     ${
                                       product.quantity <= 0 || isInCart(product.productId)
                                         ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                         : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                     }`}
                        >
                          {isInCart(product.productId) ? 
                            <span className="flex items-center justify-center gap-2 text-emerald-100">
                              <FiShoppingCart size={18} /> Added to Cart
                            </span> : 
                            <span className="flex items-center justify-center gap-2">
                              <FiShoppingCart size={18} /> Add to Cart
                            </span>
                          }
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="inline-flex rounded-xl shadow-lg overflow-hidden" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2.5 rounded-l-xl border border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          « First
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2.5 border-y border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ‹ Previous
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2.5 border-y text-base font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'z-10 bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2.5 border-y border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next ›
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-4 py-2.5 rounded-r-xl border border-gray-300 bg-white text-base font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Last »
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center my-12">
                  <svg className="mx-auto h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We couldn't find any products matching your current search or filter criteria.
                    Try adjusting your search term or filters.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductLayout;