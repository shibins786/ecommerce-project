import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import { logout } from "../redux/slices/authSlice";
import { fetchCart } from "../redux/slices/cartSlice";
import { fetchWishlist } from "../redux/slices/wishlistSlice";

import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ================= STATE =================
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items || []);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  const isLoggedIn = !!user;

  // ✅ ALWAYS DERIVED (correct)
  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // ================= SYNC =================
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-500";

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <Link
        to="/"
        className="text-2xl font-bold text-blue-600 flex items-center gap-2"
      >
        🛍 ShopApp
      </Link>

      {/* LINKS */}
      <div className="hidden md:flex items-center gap-6 text-sm">

        <Link to="/" className={`flex items-center gap-1 ${isActive("/")}`}>
          <FaHome /> Home
        </Link>

        <Link
          to="/cart"
          className={`flex items-center gap-1 relative ${isActive("/cart")}`}
        >
          <FaShoppingCart />
          <span>Cart</span>

          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </Link>

        <Link
          to="/wishlist"
          className={`flex items-center gap-1 ${isActive("/wishlist")}`}
        >
          <FaHeart /> Wishlist
        </Link>

        <Link
          to="/orders"
          className={`flex items-center gap-1 ${isActive("/orders")}`}
        >
          📦 Orders
        </Link>

      </div>

      {/* AUTH */}
      <div className="flex items-center gap-4">

        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FaUser />
              <span>{user?.username || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <FaUser />
            Login
          </button>
        )}

      </div>
    </nav>
  );
}