import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";  // ← import thêm
import "./index.css";
import "./output.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>   
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
