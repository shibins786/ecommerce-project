import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // =========================
  // CLEAR MESSAGES
  // =========================
  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  // =========================
  // STEP 1: SEND OTP
  // =========================
  const sendOTP = async () => {
    clearMessages();

    if (!email.includes("@")) {
      setError("Enter valid email");
      return;
    }

    try {
      setLoading(true);

      await API.post("users/forgot/send-otp/", {
        email,
      });

      setMessage("OTP sent successfully");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 2: VERIFY OTP
  // =========================
  const verifyOTP = async () => {
    clearMessages();

    if (otp.length < 4) {
      setError("Invalid OTP");
      return;
    }

    try {
      setLoading(true);

      await API.post("users/forgot/verify-otp/", {
        email,
        otp,
      });

      setMessage("OTP verified");
      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.error || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 3: RESET PASSWORD
  // =========================
  const resetPassword = async () => {
    clearMessages();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await API.post("users/forgot/reset/", {
        email,
        new_password: newPassword,
      });

      setMessage("Password reset successful");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.error || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

        <h1 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h1>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="bg-green-100 text-green-600 p-2 rounded mb-3 text-sm">
            {message}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full p-3 border rounded mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p className="text-sm mb-2">
              OTP sent to <b>{email}</b>
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white p-3 rounded"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 border rounded mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-purple-600 text-white p-3 rounded"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}