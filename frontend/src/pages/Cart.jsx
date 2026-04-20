import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Loader from "../components/Loader";
import { formatPrice } from "../utils/helpers";

import {
  fetchCart,
  removeFromCart,
} from "../redux/slices/cartSlice";

import { FaArrowLeft, FaTrash, FaShoppingCart } from "react-icons/fa";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ USE REDUX STATE ONLY
  const { items, loading } = useSelector((state) => state.cart);

  const [selectedItems, setSelectedItems] = useState([]);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ================= FETCH =================
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // ================= POPUP =================
  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ================= REMOVE =================
  const handleRemove = async (id) => {
    try {
      await dispatch(removeFromCart(id)).unwrap();

      setSelectedItems((prev) =>
        prev.filter((i) => i.id !== id)
      );

      showPopup("Removed from cart", "success");
    } catch {
      showPopup("Failed to remove item", "error");
    }
  };

  // ================= SELECT =================
  const toggleSelect = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);

      return exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item];
    });
  };

  // ================= CHECKOUT =================
  const handleCheckout = () => {
    if (!selectedItems.length) {
      showPopup("Select at least one item", "error");
      return;
    }

    navigate("/checkout", {
      state: { selectedItems },
    });
  };

  // ================= TOTAL =================
  const total = selectedItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* POPUP */}
      {popup.show && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl text-white ${
            popup.type === "error"
              ? "bg-red-600"
              : "bg-green-600"
          }`}
        >
          {popup.message}
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="mb-4 text-blue-600 flex items-center gap-2"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      {/* EMPTY */}
      {items.length === 0 ? (
        <div className="text-gray-500 flex flex-col items-center">
          <FaShoppingCart size={50} />
          Empty Cart
        </div>
      ) : (
        <>
          {/* ITEMS */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border p-4 rounded-xl"
              >
                <div className="flex gap-4 items-center">

                  <input
                    type="checkbox"
                    checked={selectedItems.some(
                      (i) => i.id === item.id
                    )}
                    onChange={() => toggleSelect(item)}
                  />

                  <img
                    src={item.product?.image}
                    className="w-16 h-16 object-contain"
                  />

                  <div>
                    <p className="font-semibold">
                      {item.product?.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {formatPrice(item.product?.price)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-green-600 font-bold">
                    {formatPrice(
                      (item.product?.price || 0) *
                        (item.quantity || 0)
                    )}
                  </p>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-6 text-xl font-bold text-green-600">
            Total: {formatPrice(total)}
          </div>

          <button
            onClick={handleCheckout}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;