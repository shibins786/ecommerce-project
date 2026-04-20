import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";

import { formatPrice, formatText } from "../utils/helpers";

import { FaBolt, FaHeart } from "react-icons/fa";

const ProductCard = ({ product, onAddToCart, onBuyNow }) => {
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================= AUTH STATE =================
  const user = useSelector((state) => state.auth?.user);

  // ================= WISHLIST STATE =================
  const wishlist = useSelector((state) => state.wishlist?.items || []);

  const isLiked = wishlist.some(
    (item) =>
      item.product === product.id ||
      item.product?.id === product.id
  );

  // ================= ADD TO CART =================
  const handleAddToCart = async () => {
    if (!user) {
      onAddToCart?.("Login required", "error");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await dispatch(
        addToCart({
          productId: product.id,
          quantity: 1,
        })
      ).unwrap();

      onAddToCart?.("Added to cart", "success");
    } catch (err) {
      onAddToCart?.("Failed to add to cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= BUY NOW =================
  const handleBuyNow = () => {
    if (!user) {
      onBuyNow?.("Login required", "error");
      return;
    }

    navigate("/checkout", {
      state: {
        selectedItems: [
          {
            product,
            quantity: 1,
          },
        ],
      },
    });
  };

  // ================= TOGGLE WISHLIST =================
  const handleWishlist = async () => {
    if (!user) return;
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      await dispatch(toggleWishlist(product.id)).unwrap();
    } catch (err) {
      console.error("Wishlist toggle failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      className="rounded-2xl"
      style={{ perspective: "1000px" }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden relative">

        {/* WISHLIST ICON */}
        <div className="absolute top-3 right-3">
          <FaHeart
            onClick={handleWishlist}
            className={`cursor-pointer transition ${
              isLiked ? "text-red-500" : "text-gray-400"
            } ${wishlistLoading ? "opacity-50" : ""}`}
          />
        </div>

        {/* IMAGE */}
        <div className="h-48 flex items-center justify-center p-4 bg-gray-50">
          <img
            src={product.image || product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* CONTENT */}
        <div className="p-4">

          <h2 className="font-semibold truncate">
            {product.name}
          </h2>

          <p className="text-gray-500 text-sm mt-1 line-clamp-2">
            {product.description}
          </p>

          <p className="text-green-600 font-bold mt-2">
            {formatPrice(product.price)}
          </p>

          <p className="text-xs text-blue-500">
            {formatText(product.category_name)}
          </p>

          <p className="text-xs mt-1">
            Stock: {product.stock}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-2 mt-4">

            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 bg-black text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add to Cart"}
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg flex items-center justify-center gap-1"
            >
              <FaBolt /> Buy
            </button>

          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;