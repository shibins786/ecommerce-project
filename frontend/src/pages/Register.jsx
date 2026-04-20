import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =========================
  // REGISTER HANDLER
  // =========================
  const handleRegister = async () => {
    if (loading) return; // prevent spam clicks
    setError("");

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    // validation (still basic but correct)
    if (!cleanEmail.includes("@")) {
      setError("Invalid email format");
      return;
    }

    if (!cleanUsername) {
      setError("Username is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("users/register/", {
        email: cleanEmail,
        username: cleanUsername,
        password,
      });

      // backend safety check
      if (!res.data) {
        throw new Error("No response from server");
      }

      alert("Account created successfully");
      navigate("/login");

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ENTER KEY SUPPORT
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Register to start shopping
        </p>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        />

        {/* USERNAME */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}