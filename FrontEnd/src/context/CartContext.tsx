import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  brand: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartInfo {
  status: string;
  cartId: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartInfo: CartInfo | null;
  cartId: number | null;
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  increaseQuantity: (cartItemId: number) => Promise<void>;
  decreaseQuantity: (cartItemId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (cartId: number) => Promise<{ qrCode: string; orderCode: number }>;
  checkPaymentStatus: (orderCode: number) => Promise<string>;
  changeOrderStatus: (orderCode: number, status: string) => Promise<void>;
  checkPendingOrder: () => Promise<boolean>;
  setCartActive: () => Promise<void>;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartInfo, setCartInfo] = useState<CartInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isInCart = (productId: number): boolean =>
    cartItems.some(item => item.productId === productId);

  const getItemQuantity = (productId: number): number => {
    const found = cartItems.find(item => item.productId === productId);
    return found ? found.quantity : 0;
  };

  const fetchCartItems = async (): Promise<void> => {
    setLoading(true);
    let currentCartId: number;

    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Chưa đăng nhập');

      // Lấy thông tin giỏ hàng
      const cartResp = await api.get('/app/cart', {
        params: { userName: username },
      });
      const info = cartResp.data;
      currentCartId = info.cartId;
      if (!currentCartId) throw new Error('Mã giỏ hàng không tồn tại');
      setCartId(currentCartId);
      setCartInfo({ status: info.status || 'ACTIVE', cartId: currentCartId });

      // Lấy danh sách sản phẩm trong giỏ hàng
      const itemsResp = await api.get('/app/cart/items', {
        params: { cartId: currentCartId },
      });
      const rawItems = Array.isArray(itemsResp.data) ? itemsResp.data : [];

      const formatted: CartItem[] = rawItems.map((it: any) => ({
        cartItemId: it.cartItemId,
        productName: it.productName ?? '',
        productId: it.productId ?? 0,
        price: it.price ?? 0,
        brand: it.brand ?? '',
        description: it.description ?? '',
        quantity: it.quantity ?? 0,
        image: it.image ?? '',
      }));

      setCartItems(formatted);
    } catch (e: any) {
      console.error('Lỗi khi lấy thông tin giỏ hàng:', e);
      setCartId(null);
      setCartItems([]);
      setCartInfo(null);
      if (e.response?.status === 404) {
        toast.error('Giỏ hàng không tồn tại');
      } else {
        toast.error('Lỗi không mong muốn khi tải giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product: CartItem): Promise<void> => {
    if (!cartId) {
      toast.error('Giỏ hàng chưa được khởi tạo');
      return;
    }
    try {
      await api.post('/app/cart/add', {
        cartId,
        productId: product.productId,
        quantity: product.quantity || 1,
      });
      await fetchCartItems();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (e: any) {
      console.error('Lỗi khi thêm vào giỏ hàng:', e);
      if (e.response?.status === 400) {
        toast.error('Yêu cầu không hợp lệ');
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<void> => {
    if (!cartId) {
      toast.error('Giỏ hàng chưa được khởi tạo');
      return;
    }
    try {
      const item = cartItems.find(i => i.cartItemId === cartItemId);
      if (!item) throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
      await api.delete('/app/cart/remove', {
        params: { cartId, productId: item.productId },
      });
      await fetchCartItems();
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (e: any) {
      console.error('Lỗi khi xóa khỏi giỏ hàng:', e);
      if (e.response?.status === 404) {
        toast.error('Sản phẩm không tìm thấy trong giỏ hàng');
      } else {
        toast.error('Không thể xóa khỏi giỏ hàng');
      }
    }
  };

  const increaseQuantity = async (cartItemId: number): Promise<void> => {
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (!item || !cartId) {
      toast.error('Sản phẩm hoặc giỏ hàng không hợp lệ');
      return;
    }
    await updateQuantity(item.productId, item.quantity + 1);
  };

  const decreaseQuantity = async (cartItemId: number): Promise<void> => {
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (!item || !cartId) {
      toast.error('Sản phẩm hoặc giỏ hàng không hợp lệ');
      return;
    }
    if (item.quantity <= 1) {
      await removeFromCart(cartItemId);
      return;
    }
    await updateQuantity(item.productId, item.quantity - 1);
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (!cartId || quantity < 1) {
      toast.error('Số lượng không hợp lệ');
      return;
    }
    try {
      const request = { cartId, productId, quantity };
      await api.put('/app/cart/update', request);
      await fetchCartItems();
      toast.success('Đã cập nhật số lượng');
    } catch (e: any) {
      console.error('Lỗi khi cập nhật số lượng:', e);
      if (e.response?.status === 400) {
        toast.error('Yêu cầu không hợp lệ');
      } else if (e.response?.status === 404) {
        toast.error('Sản phẩm không tìm thấy trong giỏ hàng');
      } else {
        toast.error('Không thể cập nhật số lượng');
      }
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!cartId) {
      toast.error('Giỏ hàng chưa được khởi tạo');
      return;
    }
    try {
      await api.delete('/app/cart/clear', { params: { cartId } });
      await fetchCartItems();
      toast.success('Đã xóa giỏ hàng');
    } catch (e: any) {
      console.error('Lỗi khi xóa giỏ hàng:', e);
      if (e.response?.status === 404) {
        toast.error('Giỏ hàng không tồn tại');
      } else {
        toast.error('Không thể xóa giỏ hàng');
      }
    }
  };

const checkout = async (cartId: number): Promise<{ qrCode: string; orderCode: number }> => {
  try {
    const response = await api.post('/app/order/create', { cartId });
    const { qrCode, orderCode } = response.data;
    if (!qrCode || !orderCode) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
    return { qrCode, orderCode };
  } catch (e: any) {
    console.error('Lỗi khi tạo thanh toán:', e);
    const errorMessage = e.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';
    toast.error(errorMessage);
    throw e;
  }
};

  const checkPaymentStatus = async (orderCode: number): Promise<string> => {
    try {
      const response = await api.get('/app/payment/status', { params: { orderCode } });
      return response.data; // Trả về "PAID", "CANCELLED", hoặc "PENDING"
    } catch (e: any) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', e);
      toast.error(e.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán');
      throw e;
    }
  };

  const changeOrderStatus = async (orderCode: number, status: string): Promise<void> => {
    try {
      await api.put('/app/order/change-order-status', null, {
        params: { orderCode, status },
      });
    } catch (e: any) {
      console.error('Lỗi khi thay đổi trạng thái đơn hàng:', e);
      toast.error(e.response?.data?.message || 'Không thể thay đổi trạng thái đơn hàng');
      throw e;
    }
  };

  const checkPendingOrder = async (): Promise<boolean> => {
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Chưa đăng nhập');
      const response = await api.get('/app/order/check-pending', {
        params: { userName: username },
      });
      return response.data;
    } catch (e: any) {
      console.error('Lỗi khi kiểm tra đơn hàng đang chờ:', e);
      toast.error(e.response?.data?.message || 'Không thể kiểm tra đơn hàng đang chờ');
      return false;
    }
  };

  const setCartActive = async (): Promise<void> => {
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Chưa đăng nhập');
      await api.post('/app/cart/activate', null, {
        params: { userName: username },
      });
      await fetchCartItems();
    } catch (e: any) {
      console.error('Lỗi khi kích hoạt giỏ hàng:', e);
      toast.error(e.response?.data?.message || 'Không thể kích hoạt giỏ hàng');
      throw e;
    }
  };

  const totalItems = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = cartItems.reduce((sum, it) => sum + it.quantity * it.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartInfo,
        cartId,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        checkout,
        checkPaymentStatus,
        changeOrderStatus,
        checkPendingOrder,
        setCartActive,
        isInCart,
        getItemQuantity,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}