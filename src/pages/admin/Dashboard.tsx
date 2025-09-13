"use client";

import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../lib/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("adminAccessToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Optionally store admin info
        console.log("Admin session:", response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Session check failed:", err);

        // Try refresh token if available
        const refreshToken = localStorage.getItem("adminRefreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/api/admin/auth/refresh-token`,
              {
                token: refreshToken,
              }
            );

            localStorage.setItem(
              "adminAccessToken",
              refreshResponse.data.accessToken
            );
            // Retry session validation
            checkSession();
            return;
          } catch {
            console.warn("Refresh token invalid or expired");
          }
        }

        // If all fails, redirect to login
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        navigate("/admin/login");
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sidebar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <Outlet />
    </div>
  );
}

export default AdminDashboard;
