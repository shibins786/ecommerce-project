import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { useNavigate, useLocation } from "react-router-dom";
import { formatPrice, formatDate, formatText } from "../utils/helpers";

import { FaBox, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState({});
  const [popup, setPopup] = useState({ show: false, message: "" });

  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      const res = await API.get("orders/");
      const data = res.data?.orders ?? res.data ?? [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Orders fetch error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [location.state?.refresh]);

  // ================= POPUP =================
  const showPopup = (message) => {
    setPopup({ show: true, message });

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setPopup({ show: false, message: "" });
    }, 2500);
  };

  // ================= CANCEL =================
  const cancelOrder = async (id) => {
    if (loadingMap[id]) return;

    try {
      setLoadingMap((prev) => ({ ...prev, [id]: true }));

      const res = await API.post(`orders/${id}/cancel/`);

      await fetchOrders();

      showPopup(res.data?.message || "Order cancelled");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Cancel failed");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ================= DELETE =================
  const deleteOrder = async (id) => {
    if (loadingMap[id]) return;

    try {
      setLoadingMap((prev) => ({ ...prev, [id]: true }));

      const res = await API.delete(`orders/${id}/delete/`);

      await fetchOrders();

      showPopup(res.data?.message || "Order deleted");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Delete failed");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ================= STATUS STYLE =================
  const getStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "payment_pending":
        return "bg-yellow-100 text-yellow-700";

      case "payment_failed":
        return "bg-red-100 text-red-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-700";

      case "delivered":
        return "bg-green-200 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <FaBox size={60} className="mx-auto mb-4" />
        <p>No orders yet</p>

        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">

      {/* POPUP */}
      {popup.show && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-3 rounded shadow-lg z-50">
          {popup.message}
        </div>
      )}

      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-6 text-gray-700 hover:text-black"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const isLoading = loadingMap[order.id];

          return (
            <div key={order.id} className="bg-white p-6 rounded-2xl shadow">

              {/* HEADER */}
              <div className="flex justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-lg">
                    {order.items?.length
                      ? order.items.map((i) => i.product_name).join(", ")
                      : `Order #${order.id}`}
                  </h2>

                  <p className="text-sm text-gray-500 flex gap-2 items-center">
                    <FaCalendarAlt />
                    {order.created_at
                      ? formatDate(order.created_at)
                      : "Unknown date"}
                  </p>
                </div>

                <div className="text-green-600 font-semibold">
                  {formatPrice(order.total_price || 0)}
                </div>
              </div>

              {/* STATUS (SINGLE SOURCE OF TRUTH) */}
              <div className="mt-4 flex gap-3 flex-wrap">

                <span className={`px-3 py-1 rounded ${getStatusStyle(order.status)}`}>
                  Status: {formatText(order.status)}
                </span>

                {order.is_paid !== undefined && (
                  <span className={`px-3 py-1 rounded ${getStatusStyle(order.is_paid ? "paid" : "payment_pending")}`}>
                    Payment: {order.is_paid ? "Paid" : "Pending"}
                  </span>
                )}

              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-4 flex-wrap">

                {["payment_pending", "processing"].includes(order.status) && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={isLoading}
                    className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Cancel"}
                  </button>
                )}

                {["cancelled", "payment_failed"].includes(order.status) && (
                  <button
                    onClick={() => deleteOrder(order.id)}
                    disabled={isLoading}
                    className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                )}

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}