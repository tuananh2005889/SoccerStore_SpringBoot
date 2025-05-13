import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';


const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    loading,
  } = useCart();


  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    const qtys: Record<number, number> = {};
    cartItems.forEach(item => {
      qtys[item.productId] = item.quantity;
    });
    setLocalQuantities(qtys);
  }, [cartItems]);

  // Handlers for local quantity change
  const changeLocalQuantity = (productId: number, delta: number) => {
    setLocalQuantities(prev => {
      const current = prev[productId] || 0;
      const updated = Math.max(current + delta, 1);
      return { ...prev, [productId]: updated };
    });
  };

  // Derived totals based on local quantities
  const totalItems = Object.values(localQuantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const q = localQuantities[item.productId] || 0;
    return sum + q * item.price;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-16" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-16" />
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">You haven't added any products to your cart.</p>
          <Link
            to="/product"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-16" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm trong giỏ */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            {cartItems.map(item => (
              <div key={item.cartItemId} className="p-6 border-b border-gray-200 flex items-start">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder-product.jpg'; }}
                />
                <div className="ml-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900">{item.productName}</h3>
                      <p className="text-sm font-bold text-gray-600 mt-1">{item.brand}</p>
                      {item.description && (() => {
                        const words = item.description.trim().split(/\s+/);
                        const truncated = words.length > 30
                          ? words.slice(0, 50).join(' ') + '…'
                          : item.description;
                        return (
                          <p className="text-sm text-gray-600 mt-1">{truncated}</p>
                        );
                      })()}

                    </div>
                  </div>

                  <p className="mt-2 text-gray-700 text-xl font-bold">Giá: ${item.price.toLocaleString()}</p>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Nút tăng/giảm số lượng */}
                    <div className="flex items-center">
                      <button
                        onClick={() => changeLocalQuantity(item.productId, -1)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={(localQuantities[item.productId] || 0) <= 1}
                      >
                        <FiMinus
                          className={(localQuantities[item.productId] || 0) <= 1
                            ? "text-gray-300"
                            : "text-gray-600"
                          }
                        />
                      </button>
                      <span className="mx-4 text-gray-900">{localQuantities[item.productId]}</span>
                      <button
                        onClick={() => changeLocalQuantity(item.productId, +1)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiPlus className="text-gray-600" />
                      </button>
                    </div>

                    {/* Tổng giá từng dòng */}
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900 mr-4">
                        ${((item.price * (localQuantities[item.productId] || 0))).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Xóa sản phẩm"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng kết đơn hàng */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of items</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between font-medium text-lg">
                <span>Total</span>
                <span className="text-green-600">${totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => toast.success('Checkout coming soon!')}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Checkout
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear cart
              </button>
              <Link
                to="/product"
                className="block w-full text-center mt-4 text-green-600 hover:text-green-700 transition-colors"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
