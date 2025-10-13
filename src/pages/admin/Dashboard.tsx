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
        navigate("/fdtm-admin/login");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Admin session:", response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Session check failed:", err);

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
            checkSession();
            return;
          } catch {
            console.warn("Refresh token invalid or expired");
          }
        }

        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        navigate("/fdtm-admin/login");
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar / Navbar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default AdminDashboard;
