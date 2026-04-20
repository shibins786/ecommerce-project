import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useDispatch } from "react-redux";
import { login } from "../redux/slices/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("users/login/", {
        email,
        password,
      });

      if (!res.data || !res.data.user) {
        throw new Error("Invalid server response");
      }

      // ✅ Redux handles state + localStorage (single source of truth)
      dispatch(
        login({
          user: res.data.user,
          access: res.data.access,
          refresh: res.data.refresh,
        })
      );

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to your account
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Email"
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* LINKS */}
        <div className="flex justify-between mt-4 text-sm">
          <Link to="/register" className="text-blue-600">
            Create account
          </Link>

          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </span>
        </div>

      </div>
    </div>
  );
}