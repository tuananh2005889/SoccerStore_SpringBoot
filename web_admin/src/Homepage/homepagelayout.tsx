import About from "./About";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import Products from "./Products";

const HomePage: React.FC = () => {
    return (
      <div className="font-sans antialiased text-gray-900">
        <Navbar />
        <Hero />
        <About />
        <Products />
        <Footer />
      </div>
    );
  };
  
  export default HomePage;
  