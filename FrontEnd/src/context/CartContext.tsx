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

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Axios instance with credentials
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token to each request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global unauthorized handler
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
  const [loading, setLoading] = useState(true);

  const isInCart = (productId: number): boolean =>
    cartItems.some(item => item.productId === productId);

  const getItemQuantity = (productId: number): number => {
    const found = cartItems.find(item => item.productId === productId);
    return found ? found.quantity : 0;
  };

  // Fetch or create cart, then load items
  const fetchCartItems = async (): Promise<void> => {
    setLoading(true);
    let currentCartId: number;

    // 1) Get or create cart
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Not authenticated');
      const cartResp = await api.get<{ id?: number; cartId?: number }>('/app/cart', {
        params: { userName: username },
      });
      const info = cartResp.data;
      currentCartId = info.cartId ?? info.id!;
      if (!currentCartId) throw new Error('Cart ID missing');
      setCartId(currentCartId);
    } catch (e) {
      console.error('Error fetching cart info:', e);
      setCartId(null);
      setCartItems([]);
      setLoading(false);
      return;
    }

    // 2) Get cart items
    try {
      const itemsResp = await api.get<any[]>('/app/cart/items', {
        params: { cartId: currentCartId },
      });
      const rawItems = Array.isArray(itemsResp.data) ? itemsResp.data : [];

      const formatted: CartItem[] = rawItems.map(it => {
        // Handle possible undefined product
        const prod = it.product || {};
        return {
          cartItemId: it.id,
          productName: prod.productName ?? it.productName ?? '',
          productId:  prod.productId ?? it.productId ?? 0,
          price:      prod.price ?? it.price ?? 0,
          brand:      prod.brand ?? it.brand ?? '',
          description: prod.description ?? it.description ?? '',
          quantity:   it.quantity ?? 0,
          image:      Array.isArray(prod.images) && prod.images.length
                         ? prod.images[0]
                         : it.imageUrl ?? '',
        };
      });

      setCartItems(formatted);
    } catch (e) {
      console.error('Error fetching cart items:', e);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (product: CartItem): Promise<void> => {
    if (!cartId) {
      toast.error('Cart not initialized');
      return;
    }
    try {
      await api.post('/app/cart/add', {
        cartId,
        productId: product.productId,
        quantity:  product.quantity || 1,
      });
      await fetchCartItems();
      toast.success('Added to cart');
    } catch (e) {
      console.error('addToCart error:', e);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId: number): Promise<void> => {
    if (!cartId) {
      toast.error('Cart not initialized');
      return;
    }
    try {
      await api.delete('/app/cart/remove', { params: { cartId, productId } });
      await fetchCartItems();
      toast.success('Removed from cart');
    } catch (e) {
      console.error('removeFromCart error:', e);
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (!cartId || quantity < 1) {
      toast.error('Invalid quantity');
      return;
    }
    try {
      await api.put('/app/cart/update', { cartId, productId, quantity });
      await fetchCartItems();
      toast.success('Quantity updated');
    } catch (e) {
      console.error('updateQuantity error:', e);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!cartId) {
      toast.error('Cart not initialized');
      return;
    }
    try {
      await api.delete('/app/cart/clear', { params: { cartId } });
      await fetchCartItems();
      toast.success('Cart cleared');
    } catch (e) {
      console.error('clearCart error:', e);
      toast.error('Failed to clear cart');
    }
  };

  const totalItems = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = cartItems.reduce((sum, it) => sum + it.quantity * it.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
