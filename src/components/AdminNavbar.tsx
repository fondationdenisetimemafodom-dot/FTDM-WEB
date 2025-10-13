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
  FaHandshake,
  FaShareAlt,
} from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDashboard = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const { t } = useTranslation("adminNavbar");
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false); // Close mobile menu when showing modal
  };

  const handleLogoutConfirm = async () => {
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

      navigate("/fdtm-admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-64 bg-white shadow-sm flex-col justify-between sticky top-0 overflow-y-auto">
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
                <NavLink to="/fdtm-admin/projects">
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
                <NavLink to="/fdtm-admin/donation-history">
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
                <NavLink to="/fdtm-admin/news-articles">
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
                <NavLink to="/fdtm-admin/media-library">
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

                {/* Contributors/Partners */}
                <NavLink to="/fdtm-admin/contributors-partners">
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                        isActive
                          ? "bg-blue-100 border-l-4 border-main-500 text-black"
                          : "text-black hover:bg-blue-50"
                      }`}
                    >
                      <FaHandshake
                        className={`shrink-0 text-[20px] ${
                          isActive ? "text-main-500" : "text-gray-500"
                        }`}
                      />
                      {t("contributorsPartners")}
                    </div>
                  )}
                </NavLink>

                {/* Social Media Links */}
                <NavLink to="/fdtm-admin/social-media">
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                        isActive
                          ? "bg-blue-100 border-l-4 border-main-500 text-black"
                          : "text-black hover:bg-blue-50"
                      }`}
                    >
                      <FaShareAlt
                        className={`shrink-0 text-[20px] ${
                          isActive ? "text-main-500" : "text-gray-500"
                        }`}
                      />
                      {t("socialMedia")}
                    </div>
                  )}
                </NavLink>

                {/* Forms */}
                <NavLink to="/fdtm-admin/forms">
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
            <span className="text-sm text-gray-600">{t("language")}</span>
            <LanguageSwitcher />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-lg"
          >
            <FaSignOutAlt /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="lg:hidden w-full sticky top-0 z-50 bg-white shadow-sm">
        <div className="p-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-[51px] w-[58px]" />
          </div>
          <span className="text-main-500 font-bold ">FDTM ADMIN</span>
          {/* Hamburger Menu */}
          <button
            onClick={toggleMobileMenu}
            className="text-main-500 p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col p-4 space-y-2">
              {/* Dashboard Header */}
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
                <div className="flex flex-col gap-2 pl-2">
                  {/* Projects */}
                  <NavLink to="/fdtm-admin/projects" onClick={closeMobileMenu}>
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
                  <NavLink
                    to="/fdtm-admin/donation-history"
                    onClick={closeMobileMenu}
                  >
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
                  <NavLink
                    to="/fdtm-admin/news-articles"
                    onClick={closeMobileMenu}
                  >
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
                  <NavLink
                    to="/fdtm-admin/media-library"
                    onClick={closeMobileMenu}
                  >
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

                  {/* Contributors/Partners */}
                  <NavLink
                    to="/fdtm-admin/contributors-partners"
                    onClick={closeMobileMenu}
                  >
                    {({ isActive }) => (
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                          isActive
                            ? "bg-blue-100 border-l-4 border-main-500 text-black"
                            : "text-black hover:bg-blue-50"
                        }`}
                      >
                        <FaHandshake
                          className={`shrink-0 text-[20px] ${
                            isActive ? "text-main-500" : "text-gray-500"
                          }`}
                        />
                        {t("contributorsPartners")}
                      </div>
                    )}
                  </NavLink>

                  {/* Social Media Links */}
                  <NavLink
                    to="/fdtm-admin/social-media"
                    onClick={closeMobileMenu}
                  >
                    {({ isActive }) => (
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-[16px] font-medium ${
                          isActive
                            ? "bg-blue-100 border-l-4 border-main-500 text-black"
                            : "text-black hover:bg-blue-50"
                        }`}
                      >
                        <FaShareAlt
                          className={`shrink-0 text-[20px] ${
                            isActive ? "text-main-500" : "text-gray-500"
                          }`}
                        />
                        {t("socialMedia")}
                      </div>
                    )}
                  </NavLink>

                  {/* Forms */}
                  <NavLink to="/fdtm-admin/forms" onClick={closeMobileMenu}>
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

              {/* Language Switcher */}
              <div className="px-3 py-2 mt-4 border-t border-gray-200 pt-4">
                <span className="text-sm text-gray-600 block mb-2">
                  {t("language")}
                </span>
                <LanguageSwitcher />
              </div>

              {/* Logout */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-lg px-3 py-2 mt-2 border-t border-gray-200 pt-4"
              >
                <FaSignOutAlt /> {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {t("logoutConfirmTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("logoutConfirmMessage")}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
              >
                {t("confirmLogout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
