// src/context/CartContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface CartItem {
  cartItemId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        setCartItems([]);
        setCartId(null);
        return;
      }

      // Lấy thông tin giỏ hàng
      const cartResponse = await api.get('/app/cart', {
        params: { userName: username }
      });

      if (cartResponse.data && cartResponse.data.id) {
        setCartId(cartResponse.data.id);
        
        // Lấy danh sách sản phẩm trong giỏ hàng
        const itemsResponse = await api.get('/app/cart/items', {
          params: { cartId: cartResponse.data.id }
        });

        if (itemsResponse.data) {
          // Chuyển đổi dữ liệu từ backend sang định dạng CartItem
          const formattedItems = itemsResponse.data.map((item: any) => ({
            cartItemId: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0] || ''
          }));
          setCartItems(formattedItems);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
        setCartId(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 401) {
          toast.error('Failed to load cart items');
        }
      }
      setCartItems([]);
      setCartId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product: CartItem) => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      // Kiểm tra xem đã có cartId chưa
      if (!cartId) {
        // Lấy hoặc tạo giỏ hàng
        const cartResponse = await api.get('/app/cart', {
          params: { userName: username }
        });
        console.log('GET /app/cart trả về:', JSON.stringify(cartResponse.data, null, 2));
      
        // Kiểm tra cartId
        const newId = cartResponse.data.id ?? cartResponse.data.cartId;
        if (newId != null) {
          setCartId(newId);
        } else {
          console.error('Không tìm thấy cartId trong payload:', cartResponse.data);
          throw new Error('Không nhận được cartId từ server');
        }
      }
      

      // Thêm sản phẩm vào giỏ hàng
      const response = await api.post('/app/cart/add', {
        cartId: cartId,
        productId: product.productId,
        quantity: product.quantity || 1
      });

      if (response.data) {
        // Cập nhật lại danh sách sản phẩm trong giỏ hàng
        await fetchCartItems();
        toast.success('Product added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Failed to add to cart: ${errorMessage}`);
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!cartId) {
      toast.error('Giỏ hàng chưa được khởi tạo');
      return;
    }

    try {
      await api.delete('/app/cart/remove', {
        params: { cartId, productId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchCartItems();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  };

  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) return;

    const item = cartItems.find(ci => ci.productId === productId);
    if (!item || !cartId) {
      toast.error('Không thể cập nhật số lượng');
      return;
    }

    try {
      await api.put('/app/cart/update', {
        cartId,
        productId,
        quantity: newQty
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const clearCart = async () => {
    if (!cartId) {
      toast.error('Giỏ hàng chưa được khởi tạo');
      return;
    }

    try {
      await api.delete('/app/cart/clear', {
        params: { cartId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      await fetchCartItems();
      toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Không thể xóa giỏ hàng');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}