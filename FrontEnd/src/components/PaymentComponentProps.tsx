import React, { useState, useEffect } from 'react';
import { usePayment } from './PaymentContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface PaymentComponentProps {
  orderCode?: number;
  onPaymentSuccess?: (orderCode: number) => void;
  onPaymentFailure?: (orderCode: number) => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  orderCode: propOrderCode,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    isProcessing,
    paymentStatus,
    checkAndUpdatePayment,
    startPaymentPolling,
    resetPaymentState,
  } = usePayment();

  const [localOrderCode, setLocalOrderCode] = useState<number | null>(null);
  const [manualOrderCode, setManualOrderCode] = useState<string>('');

  useEffect(() => {
    // Lấy orderCode từ URL params hoặc props
    const urlOrderCode = searchParams.get('orderCode');
    const orderCodeToUse = propOrderCode || (urlOrderCode ? parseInt(urlOrderCode) : null);
    
    if (orderCodeToUse) {
      setLocalOrderCode(orderCodeToUse);
      handleReturnFromPayment(orderCodeToUse);
    }

    return () => {
      resetPaymentState();
    };
  }, [propOrderCode, searchParams, resetPaymentState]);

  // Xử lý khi người dùng quay lại từ PayOS
  const handleReturnFromPayment = async (orderCode: number) => {
    try {
      // Đợi một chút để PayOS cập nhật trạng thái
      toast.info('Đang xác nhận thanh toán...', { autoClose: 2000 });
      
      setTimeout(async () => {
        const result = await checkAndUpdatePayment(orderCode);
        
        if (result?.success && result.paymentStatus === 'PAID') {
          onPaymentSuccess?.(orderCode);
        } else if (result && !result.success) {
          onPaymentFailure?.(orderCode);
        }
      }, 2000);
    } catch (error) {
      console.error('Error handling payment return:', error);
      toast.error('Có lỗi xảy ra khi xác nhận thanh toán');
    }
  };

  // Kiểm tra trạng thái thanh toán thủ công
  const handleManualCheck = async () => {
    const orderCode = parseInt(manualOrderCode);
    if (!orderCode) {
      toast.error('Vui lòng nhập mã đơn hàng hợp lệ');
      return;
    }

    const result = await checkAndUpdatePayment(orderCode);
    
    if (result) {
      if (result.success && result.paymentStatus === 'PAID') {
        onPaymentSuccess?.(orderCode);
      } else {
        onPaymentFailure?.(orderCode);
      }
    }
  };

  // Bắt đầu theo dõi thanh toán tự động
  const handleStartPolling = async () => {
    const orderCode = parseInt(manualOrderCode);
    if (!orderCode) {
      toast.error('Vui lòng nhập mã đơn hàng hợp lệ');
      return;
    }

    const success = await startPaymentPolling(orderCode);
    
    if (success) {
      onPaymentSuccess?.(orderCode);
    } else {
      onPaymentFailure?.(orderCode);
    }
  };

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Kiểm tra thanh toán
      </h2>

      {/* Hiển thị thông tin đơn hàng hiện tại */}
      {localOrderCode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Mã đơn hàng:</span>
            <span className="text-sm font-bold text-gray-800">{localOrderCode}</span>
          </div>
          {paymentStatus && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(paymentStatus)}`}>
                {getStatusText(paymentStatus)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Form nhập mã đơn hàng thủ công */}
      <div className="space-y-4">
        <div>
          <label htmlFor="orderCode" className="block text-sm font-medium text-gray-700 mb-2">
            Mã đơn hàng
          </label>
          <input
            type="text"
            id="orderCode"
            value={manualOrderCode}
            onChange={(e) => setManualOrderCode(e.target.value)}
            placeholder="Nhập mã đơn hàng"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleManualCheck}
            disabled={isProcessing || !manualOrderCode}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
          </button>

          <button
            onClick={handleStartPolling}
            disabled={isProcessing || !manualOrderCode}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Đang theo dõi...' : 'Theo dõi thanh toán'}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang xử lý...</span>
        </div>
      )}

      {/* Hướng dẫn sử dụng */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Kiểm tra trạng thái:</strong> Kiểm tra một lần trạng thái thanh toán</li>
          <li>• <strong>Theo dõi thanh toán:</strong> Tự động kiểm tra và cập nhật trạng thái</li>
          <li>• Hệ thống sẽ tự động cập nhật khi phát hiện thanh toán thành công</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentComponent;