"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/context/AuthContext";
import { useCart } from "@/components/context/CartContext";

export default function AuthModal({ open, onClose, onSuccess }) {
  const { setAuthToken } = useCart();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const addGmail = () => {
    if (!email.includes("@")) {
      setEmail(email + "@gmail.com");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/register/auth/",
        { email, password }
      );

      login(res.data.data);

      const { access } = res.data.data;
      setAuthToken(access);

      if (onSuccess) {
        onSuccess(access);
      }

      onClose();
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-xl">
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className=" input w-full px-4 py-3 pr-28 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={addGmail}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 border rounded"
            >
              @gmail.com
            </button>
          </div>

          <input
            type="password"
            placeholder="Password"
            className="input w-full px-4 py-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
