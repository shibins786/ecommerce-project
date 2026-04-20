import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter"; // ✅ ADD THIS
import API from "../api/axios";
import Loader from "../components/Loader";
import { FaSearch } from "react-icons/fa";

function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [search, setSearch] = useState("");

  const popupTimer = useRef(null);

  // ================= POPUP =================
  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });

    if (popupTimer.current) clearTimeout(popupTimer.current);

    popupTimer.current = setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const res = await API.get("products/");
      const data = res.data?.results || res.data || [];

      setProducts(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
    };
  }, []);

  // ================= SEARCH =================
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered(products);
      return;
    }

    const v = value.toLowerCase();

    const filteredData = products.filter((p) =>
      p.name?.toLowerCase().includes(v)
    );

    setFiltered(filteredData);
  };

  // ================= HANDLERS =================
  const handleAddToCart = (message, type) => {
    showPopup(message, type);
  };

  const handleBuyNow = (message, type) => {
    showPopup(message, type);
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* POPUP */}
      <AnimatePresence>
        {popup.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-6 py-4 rounded-xl shadow-2xl text-white min-w-[280px] text-center ${
                popup.type === "success"
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {popup.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold mb-4 text-center">
        Products
      </h1>

      {/* SEARCH */}
      <div className="flex items-center gap-2 mb-6 bg-white p-3 rounded-xl shadow">
        <FaSearch className="text-gray-500" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full outline-none"
        />
      </div>

      {/* PRODUCTS */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        ))}
      </motion.div>

      {/* ✅ REPLACE FAKE FOOTER WITH REAL COMPONENT */}
      <Newsletter />

    </div>
  );
}

export default Home;