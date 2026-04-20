import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedItems = location.state?.selectedItems || [];

  const [loading, setLoading] = useState(false);

  // 🔥 POPUP STATE
  const [popup, setPopup] = useState({ show: false, message: "" });
  const timerRef = useRef(null);

  const showPopup = (message) => {
    setPopup({ show: true, message });

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setPopup({ show: false, message: "" });
    }, 2000);
  };

  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!selectedItems.length) return false;

    return (
      shipping.address.trim() &&
      shipping.city.trim() &&
      shipping.state.trim() &&
      shipping.pincode.trim() &&
      shipping.phone.trim()
    );
  };

  const orderItems = selectedItems.map((i) => ({
    product: i.product.id,
    quantity: i.quantity,
  }));

  const total = selectedItems.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );

  const shippingPayload = {
    address: shipping.address,
    city: shipping.city,
    state: shipping.state,
    pincode: shipping.pincode,
    phone: shipping.phone,
  };

  const handleCheckout = async () => {
    if (!validate()) {
      showPopup("Fill all required fields");
      return;
    }

    if (!selectedItems.length) {
      showPopup("No items selected");
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);

      // ================= COD =================
      if (paymentMethod === "cod") {
        await API.post("orders/create/", {
          payment_method: "cod",
          items: orderItems,
          shipping: shippingPayload,
        });

        showPopup("🎉 Order placed successfully");

        setTimeout(() => {
          navigate("/orders");
        }, 1500);

        return;
      }

      // ================= ONLINE =================
      const res = await API.post("payment/create/", {
        items: orderItems,
      });

      const data = res.data;

      if (!window.Razorpay) {
        showPopup("Payment system not loaded");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount_paise,
        currency: "INR",
        order_id: data.razorpay_order_id,

        handler: async function (response) {
          try {
            await API.post("payment/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: orderItems,
              shipping: shippingPayload,
            });

            showPopup("✅ Payment successful");

            setTimeout(() => {
              navigate("/orders");
            }, 1500);

          } catch (err) {
            console.error(err);
            showPopup("Payment verification failed");
          }
        },

        prefill: {
          contact: shipping.phone,
        },
      };

      new window.Razorpay(options).open();

    } catch (err) {
      console.error(err);
      showPopup("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔥 POPUP UI */}
      {popup.show && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          {popup.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">

        {/* SHIPPING */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="flex items-center gap-2 text-xl mb-5 font-semibold">
            <FaMapMarkerAlt /> Shipping Address
          </h2>

          {Object.keys(shipping).map((key) => (
            <input
              key={key}
              name={key}
              value={shipping[key]}
              placeholder={key.toUpperCase()}
              onChange={handleChange}
              className="w-full border p-3 mb-3 rounded-lg"
            />
          ))}
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl mb-4 font-semibold">Order Summary</h2>

          {selectedItems.length === 0 ? (
            <p>No items selected</p>
          ) : (
            selectedItems.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1">
                <span>{i.product.name}</span>
                <span>₹{i.product.price * i.quantity}</span>
              </div>
            ))
          )}

          <div className="border-t mt-4 pt-4 font-bold flex justify-between">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* PAYMENT */}
          <div className="mt-6 space-y-3">

            <label className={`flex justify-between p-3 border rounded ${
              paymentMethod === "cod" ? "bg-gray-100" : ""
            }`}>
              <span>💵 Cash on Delivery</span>
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </label>

            <label className={`flex justify-between p-3 border rounded ${
              paymentMethod === "online" ? "bg-blue-100" : ""
            }`}>
              <span>💳 Online Payment</span>
              <input
                type="radio"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </label>

          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 bg-black text-white py-3 rounded-xl"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

        </div>

      </div>
    </div>
  );
}