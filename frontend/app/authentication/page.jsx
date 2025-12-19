"use client";

import { useState } from "react";
import axios from "axios";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addGmail = () => {
    if (!email.includes("@")) {
      setEmail(email + "@gmail.com");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/register/auth/",
        {
          email,
          password,
        }
      );

      const { access, refresh } = res.data.data;

      // 🔐 store tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      setSuccess(res.data.message);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.non_field_errors?.[0] ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 text-black">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              className="input w-full px-4 py-3 pr-28 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={addGmail}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 rounded-md border bg-gray-100 hover:bg-gray-200"
            >
              @gmail.com
            </button>
          </div>

          <input
            type="password"
            placeholder="Password"
            className="input w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Continue"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Existing users will be logged in. New users will be automatically
          registered.
        </p>
      </div>
    </div>
  );
}
