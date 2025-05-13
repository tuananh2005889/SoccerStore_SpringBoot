import { FiShoppingCart } from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import Navbar from "../Homepage/Navbar";
import { useEffect, useState, useCallback } from "react";
import { Filter } from "lucide-react";
import Footer from "../Homepage/Footer";
import axios, { AxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const productsPerPage = 12;

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleGetAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.REACT_APP_API_URL || 'http://localhost:8080'}/app/product/all`);
      const productsWithRatings = res.data.map((product: Product) => ({
        ...product,
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        reviews: Math.floor(Math.random() * 100) // Random reviews up to 100
      }));
      setProducts(productsWithRatings);
      setFilteredProducts(productsWithRatings);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to load products: ${error.response?.data?.message || error.message}`);
      } else {
        toast.error("Failed to load products: An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProducts = useCallback((
    term: string,
    category: string | null,
    range: [number, number]
  ) => {
    const filtered = products.filter(
      (product) =>
        (product.brand.toLowerCase().includes(term.toLowerCase()) ||
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          product.category.toLowerCase().includes(term.toLowerCase())) &&
        (category ? product.category === category : true) &&
        (product.price >= range[0] && product.price <= range[1])
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(term, selectedCategory, priceRange);
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    filterProducts(searchTerm, category, priceRange);
  };

  const handlePriceFilter = (min: number, max: number) => {
    setPriceRange([min, max]);
    filterProducts(searchTerm, selectedCategory, [min, max]);
  };

  const handleAddToCart = async (product: Product) => {
    if (product.quantity <= 0) {
      toast.error("Product is out of stock!");
      return;
    }
    
    if (isInCart(product.productId)) {
      toast.error("Product is already in cart!");
      return;
    }
    try {
      await addToCart({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '/placeholder-product.jpg',
        cartItemId: product.productId // Add cartItemId field
      });
      toast.success(`Added ${product.name} to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        const errorCode = error.response?.status || 'N/A';
        toast.error(`Error ${errorCode}: ${errorMessage}`);
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Unknown error when adding to cart");
      }
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  useEffect(() => {
    handleGetAllProducts();
  }, [handleGetAllProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="h-10">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 3000,
            }
          }}
        />
      </div>
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-xl p-8 mb-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">High quality football products</h1>
          <p className="text-lg mb-6">Quality products from leading brands</p>
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 pl-10 border-0 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} />
            <span>Filter</span>
          </button>

          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                !selectedCategory
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleCategoryFilter(null)}
            >
              All
            </button>
            {Array.from(new Set(products.map(p => p.category))).map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="font-medium mb-3">Khoảng giá</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceFilter(priceRange[0], parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm whitespace-nowrap">${priceRange[0]} - ${priceRange[1]}</span>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group relative"
                    >
                      <Link to={`/product/${product.productId}`} className="block">
                        <div className="relative h-48 overflow-hidden">
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
                              <span className="text-gray-400">No image</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/product/${product.productId}`} className="block">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-green-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="text-lg font-bold text-green-600 whitespace-nowrap">
                          ${product.price.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(product.rating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({product.reviews} đánh giá)
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.quantity > 10
                              ? 'bg-green-100 text-green-800'
                              : product.quantity > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.quantity > 0 ? `In stock ${product.quantity}` : 'Out of stock'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity <= 0 || isInCart(product.productId)}
                        className={`absolute bottom-0 left-0 right-0 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium ${
                          product.quantity <= 0 || isInCart(product.productId)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isInCart(product.productId) ? 'Added to cart' : 'Add to cart'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        ‹
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'z-10 bg-green-600 text-white border-green-600'
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
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        »
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500 mb-4">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                    setPriceRange([0, 1000]);
                    setFilteredProducts(products);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Reset filter
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductLayout;