"use client";

import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../lib/api";
import { useNavigate } from "react-router";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        email,
        password,
      });

      // Save token/session if needed (localStorage or context)
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("adminAccessToken", accessToken);
      localStorage.setItem("adminRefreshToken", refreshToken);

      console.log("Admin logged in:", response.data);
      navigate("/admin/projects");
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle specific axios errors
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with a status code
          setError(err.response.data?.message || "Login failed");
        } else if (err.request) {
          // Request was made but no response received
          setError("Server did not respond. Check your connection.");
        } else {
          // Something happened setting up the request
          setError("Error setting up request: " + err.message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-main-500 text-white font-medium rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
