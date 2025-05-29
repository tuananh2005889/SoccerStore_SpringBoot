import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Homepage/Navbar';
import Footer from '../Homepage/Footer';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
// If you have Heroicons installed, you can use these:
// import { ShoppingBagIcon } from '@heroicons/react/24/outline';
// Otherwise, a simple SVG for empty state is fine.

type OrderDTO = {
  orderId: number;
  orderCode: number;
  status: 'CANCELLED' | 'SUBMITTED' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
  totalPrice: number;
};

const STATUSES: OrderDTO['status'][] = [
  'SUBMITTED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const STATUS_LABELS: Record<OrderDTO['status'], string> = {
  SUBMITTED: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

// Define specific colors for each status for consistent styling, aligned with emerald theme
const STATUS_COLORS: Record<OrderDTO['status'], string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-amber-100 text-amber-700', // Changed to amber for shipped to fit product theme
  DELIVERED: 'bg-emerald-100 text-emerald-700', // Changed to emerald for delivered
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrderHistory() {
  const [activeStatus, setActiveStatus] = useState<OrderDTO['status']>('SUBMITTED');
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  async function fetchOrders(status: OrderDTO['status']) {
    setLoading(true);
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        toast.error('Please log in to view your order history.');
        // Consider redirecting to login page here if not logged in
        // navigate('/login');
        return;
      }

      const resp = await axios.get<OrderDTO[]>(
        'http://localhost:8080/app/order/get-orders-by-status',
        { params: { status } }
      );
      setOrders(resp.data);
    } catch (e: any) {
      console.error('Error loading orders:', e);
      toast.error(e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 max-w-screen-xl">
        <h1 className="text-4xl pt-12 font-extrabold mb-10 text-gray-900 text-center lg:text-left">
          Your Order History
        </h1>

        {/* Status tabs */}
        <div className="flex space-x-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`
                flex-shrink-0 px-8 py-3.5 rounded-lg font-semibold text-base shadow-sm
                transition-all duration-300 ease-in-out transform hover:scale-[1.02]
                ${activeStatus === st
                  ? 'bg-emerald-600 text-white shadow-lg' // Changed to emerald-600
                  : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'}
              `}
            >
              {STATUS_LABELS[st]}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin h-16 w-16 border-4 border-emerald-500 rounded-full border-t-transparent" /> {/* Changed to emerald-500 */}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <div className="mx-auto w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-6"> {/* Changed to emerald-50 */}
              {/* Using a simple SVG for a box/package icon. Replace with Heroicon if available. */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"> {/* Changed to emerald-500 */}
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              {/* Or using Heroicon: <ShoppingBagIcon className="h-14 w-14 text-emerald-500" /> */}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No orders found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              It looks like you haven't placed any orders with this status yet.
              Explore our products and start shopping!
            </p>
            <Link
              to="/product"
              className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-md
                          hover:bg-emerald-700 transition-colors duration-300 transform hover:scale-105" // Changed to emerald-600/700
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order #
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o) => (
                    <tr key={o.orderId} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{o.orderCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(o.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true, // For AM/PM
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                        ${o.totalPrice.toLocaleString('en-US')} {/* Formats numbers with commas */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold
                            ${STATUS_COLORS[o.status]}
                          `}
                        >
                          {STATUS_LABELS[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}