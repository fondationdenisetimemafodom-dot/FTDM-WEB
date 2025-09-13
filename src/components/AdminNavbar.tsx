"use client";

/*-----------------------------------------------------------------------------------------------------
 | @file     AdminNavbar.jsx
 | @brief    Sidebar navigation for admin panel with collapsible Dashboard menu
 | @param    --
 | @return   Admin navbar component with language switcher and logout option
 -----------------------------------------------------------------------------------------------------*/

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaNewspaper,
  FaPhotoVideo,
  FaWpforms,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import {
  AiFillAppstore,
  AiFillDollarCircle,
  AiFillFolder,
} from "react-icons/ai";
import logo from "../../src/assets/images/logo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import API_BASE_URL from "../lib/api";
import axios from "axios";

function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleDashboard = () => {
    setIsOpen((prev) => !prev);
  };
  const { t } = useTranslation("adminNavbar");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("adminRefreshToken");

      if (refreshToken) {
        const response = await axios.post(`${API_BASE_URL}/api/admin/logout`, {
          token: refreshToken,
        });
        console.log(response);
      }

      // Clear tokens
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");

      navigate("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <aside className="h-screen w-64 bg-white shadow-sm flex flex-col justify-between sticky top-0">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4">
          <img src={logo} alt="Logo" className="h-[51px] w-[58px]" />
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2 px-4">
          {/* Dashboard (collapsible parent) */}
          <button
            onClick={toggleDashboard}
            className="flex items-center justify-between px-3 py-2 rounded-md text-lg font-medium text-gray-700 hover:bg-blue-50 w-full"
          >
            <span className="flex items-center gap-3">
              <AiFillAppstore className="text-gray-500" /> {t("dashboard")}
            </span>
            <IoIosArrowDown
              className={`transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Collapsible Links */}
          {isOpen && (
            <div className="flex flex-col gap-2 mt-2">
              {/* Projects */}
              <NavLink to="/admin/projects">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                      isActive
                        ? "bg-blue-100 border-l-4 border-main-500 text-black"
                        : "text-black hover:bg-blue-50"
                    }`}
                  >
                    <AiFillFolder
                      className={`shrink-0 text-[20px] ${
                        isActive ? "text-main-500" : "text-gray-500"
                      }`}
                    />
                    {t("projects")}
                  </div>
                )}
              </NavLink>

              {/* Donation History */}
              <NavLink to="/admin/donation-history">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                      isActive
                        ? "bg-blue-100 border-l-4 border-main-500 text-black"
                        : "text-black hover:bg-blue-50"
                    }`}
                  >
                    <AiFillDollarCircle
                      className={`shrink-0 text-[20px] ${
                        isActive ? "text-main-500" : "text-gray-500"
                      }`}
                    />
                    {t("donationHistory")}
                  </div>
                )}
              </NavLink>

              {/* News/Articles */}
              <NavLink to="/admin/news-articles">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                      isActive
                        ? "bg-blue-100 border-l-4 border-main-500 text-black"
                        : "text-black hover:bg-blue-50"
                    }`}
                  >
                    <FaNewspaper
                      className={`shrink-0 text-[20px] ${
                        isActive ? "text-main-500" : "text-gray-500"
                      }`}
                    />
                    {t("newsArticles")}
                  </div>
                )}
              </NavLink>

              {/* Media Library */}
              <NavLink to="/admin/media-library">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                      isActive
                        ? "bg-blue-100 border-l-4 border-main-500 text-black"
                        : "text-black hover:bg-blue-50"
                    }`}
                  >
                    <FaPhotoVideo
                      className={`shrink-0 text-[20px] ${
                        isActive ? "text-main-500" : "text-gray-500"
                      }`}
                    />
                    {t("mediaLibrary")}
                  </div>
                )}
              </NavLink>

              {/* Forms */}
              <NavLink to="/admin/forms">
                {({ isActive }) => (
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                      isActive
                        ? "bg-blue-100 border-l-4 border-main-500 text-black"
                        : "text-black hover:bg-blue-50"
                    }`}
                  >
                    <FaWpforms
                      className={`shrink-0 text-[20px] ${
                        isActive ? "text-main-500" : "text-gray-500"
                      }`}
                    />
                    {t("forms")}
                  </div>
                )}
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-6 flex flex-col gap-3 mb-25">
        {/* Language Switcher */}
        <div>
          <span>{t("language")}</span>
          <LanguageSwitcher />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-lg"
        >
          <FaSignOutAlt /> {t("logout")}
        </button>
      </div>
    </aside>
  );
}

export default AdminNavbar;
