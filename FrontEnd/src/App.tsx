import React from 'react';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';
import AdminBrandLayout from "./_admin/AdminBrandLayout"
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import HomePage from "./Homepage/homepagelayout";
import ProductLayout from "./Page/ProductLayout";
import Cart from "./Page/Cart";
import Profile from "./Page/Profile";
import Login from "./Login/Login";
import OrderHistory from './Page/OrderHistory';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Toaster position="top-right" />
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/admin" element={<AdminBrandLayout />} />
            <Route path="/login" element={<Login/>}/>
            <Route path="/product" element={<ProductLayout/>}/>
            <Route path="/cart" element={<Cart/>}/>
            <Route path="/Profile" element={<Profile/>}/>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/orderhistory" element={<OrderHistory />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </UserProvider>
  );
};

export default App;
