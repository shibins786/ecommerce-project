import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Loader from "../components/Loader";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../redux/slices/wishlistSlice";

import API from "../api/axios";

import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ REDUX STATE (single source of truth)
  const { items, loading } = useSelector((state) => state.wishlist);

  // =========================
  // FETCH ON LOAD
  // =========================
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // =========================
  // REMOVE ITEM (REDUX)
  // =========================
  const removeItem = (id) => {
    dispatch(removeFromWishlist(id));
  };

  // =========================
  // MOVE TO CART
  // =========================
  const moveToCart = async (item) => {
    try {
      const productId = item.product?.id || item.product;

      if (!productId) {
        alert("Invalid product data");
        return;
      }

      await API.post("cart/add/", {
        product: productId,
        quantity: 1,
      });

      // remove from wishlist (redux)
      dispatch(removeFromWishlist(item.id));

      alert("Moved to cart");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to move to cart");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) return <Loader />;

  // =========================
  // EMPTY STATE
  // =========================
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 text-gray-500">
        <FaHeart size={70} className="text-pink-400 mb-4" />
        <p className="text-lg font-medium">Your wishlist is empty</p>

        <button
          onClick={() => navigate("/")}
          className="mt-5 bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        My Wishlist
      </h1>

      <div className="max-w-5xl mx-auto grid gap-5">

        {items.map((item) => {
          const product = item.product || {};

          return (
            <div
              key={item.id}
              className="flex items-center gap-5 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition"
            >

              {/* IMAGE */}
              <div className="w-24 h-24 flex-shrink-0">
                <img
                  src={
                    product.image ||
                    product.image_url ||
                    "https://via.placeholder.com/150"
                  }
                  alt="product"
                  className="w-full h-full object-cover rounded-xl border"
                />
              </div>

              {/* INFO */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name || item.product_name}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  ₹{product.price || item.product_price}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-3">

                <button
                  onClick={() => moveToCart(item)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <FaShoppingCart />
                  Move
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition"
                >
                  <FaTrash />
                </button>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}