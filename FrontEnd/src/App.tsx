import AdminBrandLayout from "./_admin/AdminBrandLayout"
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

import HomePage from "./Homepage/homepagelayout";
import ProductLayout from "./Page/ProductLayout";
import Cart from "./Page/Cart";
import Profile from "./Page/Profile";
import Login from "./Login/Login";

function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin" element={<AdminBrandLayout />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/product" element={<ProductLayout/>}/>

        <Route path="/cart" element={<Cart/>}/>
        <Route path="/Profile" element={<Profile/>}/>
        <Route path="/" element={<HomePage/>}/>
      </Routes>
    </AuthProvider>
  )
}

export default App
