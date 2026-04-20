import { useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setType("error");
      setMessage("Enter a valid email");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("newsletter/subscribe/", {
        email,
      });

      setType("success");
      setMessage(res.data.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      setType("error");
      setMessage(
        err?.response?.data?.message || "Subscription failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto rounded-3xl p-8 md:p-10 shadow-2xl
        bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Get Exclusive Deals 🎉
          </h2>

          <p className="text-sm md:text-base mb-6 text-white/90">
            Subscribe to receive premium offers, discounts, and product updates
            directly in your inbox.
          </p>

          {/* INPUT + BUTTON */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl text-black w-full sm:w-80 outline-none focus:ring-2 focus:ring-white"
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleSubscribe}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              {loading ? "Submitting..." : "Subscribe"}
            </motion.button>
          </div>

          {/* MESSAGE */}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-sm ${
                type === "error" ? "text-yellow-200" : "text-green-200"
              }`}
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}