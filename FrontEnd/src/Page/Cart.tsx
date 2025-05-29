import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiX, FiInfo } from 'react-icons/fi'; // Added FiInfo for pending order alert
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';

const Cart = () => {
  const {
    cartItems,
    cartInfo,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    loading,
    checkout,
    checkPaymentStatus,
    changeOrderStatus,
    cartId,
    totalItems,
    totalPrice,
    checkPendingOrder,
    setCartActive,
  } = useCart();

  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [hasPendingOrder, setHasPendingOrder] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const navigate = useNavigate();

  // Constants for polling and QR timeout
  const MAX_POLL_ATTEMPTS = 20;
  const POLL_INTERVAL = 3000;
  const QR_CODE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  // Check login and pending orders
  useEffect(() => {
    if (!localStorage.getItem('username')) {
      toast.error('Please login to view your cart');
      // Using navigate for better React Router flow instead of window.location.href
      navigate('/login'); 
      return;
    }

    const checkOrders = async () => {
      try {
        const pending = await checkPendingOrder();
        setHasPendingOrder(pending);
        if (pending) {
          toast.error('You have a pending order. Please complete or cancel it before creating a new one.');
        }
      } catch (e) {
        console.error('Error checking pending orders:', e);
        toast.error('Error checking pending orders');
      }
    };
    checkOrders();
  }, [checkPendingOrder, navigate]); // Added navigate to dependency array

  // Handle checkout
  const handleCheckout = async () => {
    if (!cartId) {
      toast.error('Cart not initialized');
      return;
    }
    if (hasPendingOrder) {
      toast.error('Please process your pending order first');
      return;
    }
    try {
      // Add a loading state for the checkout process if needed
      // setLoading(true);
      const { qrCode, orderCode: checkoutOrderCode } = await checkout(cartId);
      if (!qrCode || !checkoutOrderCode) {
        throw new Error('Invalid server response');
      }
      setQrCodeData(qrCode);
      setOrderCode(checkoutOrderCode);
      setShowQR(true);
      setPollAttempts(0);
      toast.success('Scan QR code to complete payment');
    } catch (e) {
      console.error('Error generating payment QR:', e);
      toast.error('Failed to generate payment QR. Please try again.'); // More user-friendly error
    } finally {
      // setLoading(false);
    }
  };

  // Payment status polling and QR timeout
  useEffect(() => {
    if (!showQR || orderCode == null) return;

    let qrTimeoutId: NodeJS.Timeout;
    let pollIntervalId: NodeJS.Timeout;

    // Set QR code expiration timeout
    qrTimeoutId = setTimeout(() => {
      setShowQR(false);
      toast.error('QR code has expired. Please try again.');
      setCartActive().catch((error) => {
        console.error('Error reactivating cart after timeout:', error);
        toast.error('Error updating cart status');
      });
      clearInterval(pollIntervalId); // Clear polling interval if QR times out
    }, QR_CODE_TIMEOUT);

    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      clearInterval(pollIntervalId);
      clearTimeout(qrTimeoutId);
      setShowQR(false);
      toast.error('Payment check timeout. Please try again.');
      setCartActive().catch((error) => {
        console.error('Error reactivating cart after polling:', error);
        toast.error('Error updating cart status');
      });
      return;
    }

    pollIntervalId = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(orderCode);
        if (status === 'PAID') {
          clearInterval(pollIntervalId);
          clearTimeout(qrTimeoutId);
          await changeOrderStatus(orderCode, 'SUBMITTED');
          toast.success('Payment successful!', {
            duration: 5000,
            position: 'top-center',
          });
          setShowQR(false);
          try {
            await clearCart();
            await setCartActive();
            setTimeout(() => {
              navigate('/orderhistory');
            }, 2000); // Navigate after a short delay for toast to be seen
          } catch (clearError) {
            console.error('Error clearing cart:', clearError);
            toast.error('Error updating cart after payment');
          }
        } else if (status === 'CANCELLED') {
          clearInterval(pollIntervalId);
          clearTimeout(qrTimeoutId);
          await changeOrderStatus(orderCode, 'CANCELLED');
          toast.error('Payment cancelled!', {
            duration: 5000,
            position: 'top-center',
          });
          setShowQR(false);
          try {
            await setCartActive();
          } catch (activateError) {
            console.error('Error reactivating cart:', activateError);
            toast.error('Error updating cart status');
          }
        }
        setPollAttempts((prev) => prev + 1);
      } catch (e) {
        console.error('Error checking payment status:', e);
        // Only show toast once per polling interval for continuous errors
        if (pollAttempts < MAX_POLL_ATTEMPTS -1) { // Avoid showing error on final attempt before timeout
          toast.error('Error checking payment status. Retrying...');
        }
        setPollAttempts((prev) => prev + 1);
      }
    }, POLL_INTERVAL);

    return () => {
      clearInterval(pollIntervalId);
      clearTimeout(qrTimeoutId);
    };
  }, [showQR, orderCode, pollAttempts, checkPaymentStatus, changeOrderStatus, clearCart, setCartActive, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems.length || !cartInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16">
          <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Let's find some great products for you!
            </p>
            <Link
              to="/product"
              className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
            >
              <FiArrowLeft className="mr-2 text-xl" />
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Navbar />
   <div className='bg-gray-50 min-h-screen'>
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-10 pt-12">
          {/* Main cart items */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart ({totalItems})</h1>
              <Link
                to="/product"
                className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-lg transition-colors duration-200"
              >
                <FiArrowLeft className="mr-2 text-xl" />
                Continue shopping
              </Link>
            </div>

            {hasPendingOrder && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-8 rounded-lg shadow-sm flex items-start">
                <FiInfo className="h-6 w-6 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="ml-4">
                  <p className="text-base text-yellow-800 font-semibold">
                    You have a pending order!
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please complete or cancel your existing order before proceeding with a new one.
                  </p>
                  <Link
                    to="/order-history"
                    className="mt-3 inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-600 underline transition-colors"
                  >
                    View order history <FiArrowLeft className="ml-1 rotate-180" />
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-24 h-24 rounded-lg object-cover shadow-sm"
                        onError={(e) => (e.currentTarget.src = '/placeholder-product.jpg')}
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
                      <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                        <p className="mt-1 text-sm text-gray-600">{item.brand}</p>
                        <p className="mt-2 text-base font-bold text-gray-900">${(item.price / 23000).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-center sm:justify-end gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => decreaseQuantity(item.cartItemId)}
                            disabled={item.quantity <= 1}
                            className={`p-2 text-gray-600 rounded-l-lg transition-colors duration-200 ${
                              item.quantity <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-gray-800'
                            }`}
                          >
                            <FiMinus size={18} />
                          </button>
                          <span className="mx-2 text-gray-800 font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.cartItemId)}
                            className="p-2 text-gray-600 rounded-r-lg hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
                          >
                            <FiPlus size={18} />
                          </button>
                        </div>
                        <div className="flex items-center">
                          <p className="text-lg font-bold text-gray-900 min-w-[80px] text-right">
                            ${((item.price * item.quantity) / 23000).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="ml-4 p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
                            title="Remove item"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-1/3">
            <div className="bg-white shadow-xl rounded-xl p-8 sticky top-28"> {/* Sticky for better UX */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between pb-2">
                  <span className="text-gray-700 text-lg">Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900 font-medium text-lg">${(totalPrice / 23000).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <span className="text-gray-700 text-lg">Shipping Estimate</span>
                  <span className="text-emerald-600 font-medium text-lg">Free</span>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Order Total</span>
                  <span className="text-xl font-extrabold text-emerald-700">${(totalPrice / 23000).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={hasPendingOrder || !cartInfo || cartInfo.status !== 'ACTIVE'}
                  className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-300
                    ${
                      hasPendingOrder || !cartInfo || cartInfo.status !== 'ACTIVE'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 transform hover:scale-[1.01]'
                    }`}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full py-3.5 px-6 border border-gray-300 rounded-lg text-gray-700 font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-95 animate-zoom-in">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Complete Your Payment</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiX size={28} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <QRCode
                  value={qrCodeData}
                  size={280} // Slightly larger QR code
                  level="H"
                  includeMargin
                  fgColor="#1a202c" // Darker foreground color for better contrast
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="text-center">
                <p className="text-base text-gray-700 mb-3 leading-relaxed">
                  Scan this QR code with your banking app to complete the payment.
                </p>
                <p className="text-sm text-red-500 font-medium">
                  This code will expire in 5 minutes.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowQR(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

   </div>
      <Footer />
    </>
  );
};

export default Cart;