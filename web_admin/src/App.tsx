import AdminBrandLayout from "./_admin/AdminBrandLayout"
import { Routes, Route } from "react-router-dom";
import Login from "./Login/Login";
import HomePage from "./Homepage/homepagelayout";

function App() {

  return (
    <>
        <Routes>
          <Route path="/admin" element={<AdminBrandLayout />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<HomePage/>}/>
        </Routes>
    </>
  )
}

export default App
