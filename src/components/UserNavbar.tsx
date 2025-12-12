"use client";

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../../src/assets/images/logo.png";
import LanguageSwitcher from "./LanguageSwitcher";

function UserNavbar() {
  const { t } = useTranslation("userNavbar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <div className="p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:gap-25">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="h-[40px] sm:h-[50px] lg:h-[70px] w-auto"
          />
          <span className="font-bold text-[15px] sm:text-[15px] lg:text-[20px] max-w-55">
            {t("logoText")}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-between text-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `lg:text-[16px] font-medium ${
                isActive
                  ? "text-main-500 border-b-4 border-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            {t("home")}
          </NavLink>
          <NavLink
            to="/about-us"
            className={({ isActive }) =>
              `lg:text-[16px] font-medium ${
                isActive
                  ? "text-main-500 border-b-4 border-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            {t("aboutUs")}
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `lg:text-[16px] font-medium ${
                isActive
                  ? "text-main-500 border-b-4 border-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            {t("projects")}
          </NavLink>
          <NavLink
            to="/media"
            className={({ isActive }) =>
              `lg:text-[16px] font-medium ${
                isActive
                  ? "text-main-500 border-b-4 border-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            {t("media")}
          </NavLink>
          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              `lg:text-[16px] font-medium ${
                isActive
                  ? "text-main-500 border-b-4 border-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            {t("contact")}
          </NavLink>

          <div className="relative">
            <LanguageSwitcher />
          </div>

          {/* Donate Button */}
          <NavLink
            to="/donate"
            className={({ isActive }) =>
              `px-8 py-3 hover:vibrate rounded-[12px] text-lg font-medium transition ${
                isActive
                  ? "bg-white text-main-500 border-b-4 border-main-500"
                  : "bg-main-500 text-white hover:opacity-90"
              }`
            }
          >
            {t("donate")}
          </NavLink>
        </div>
        <div className="flex  items-center gap-2">
          <div className="lg:hidden relative lg:text-[16px] font-medium">
            <LanguageSwitcher />
          </div>
          {/* Mobile Hamburger Icon */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-main-500 p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col space-y-4 p-6">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-medium py-2 ${
                  isActive
                    ? "text-main-500 border-l-4 border-main-500 pl-3"
                    : "text-soft-dark-500 hover:text-main-500 pl-3"
                }`
              }
            >
              {t("home")}
            </NavLink>
            <NavLink
              to="/about-us"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-medium py-2 ${
                  isActive
                    ? "text-main-500 border-l-4 border-main-500 pl-3"
                    : "text-soft-dark-500 hover:text-main-500 pl-3"
                }`
              }
            >
              {t("aboutUs")}
            </NavLink>
            <NavLink
              to="/projects"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-medium py-2 ${
                  isActive
                    ? "text-main-500 border-l-4 border-main-500 pl-3"
                    : "text-soft-dark-500 hover:text-main-500 pl-3"
                }`
              }
            >
              {t("projects")}
            </NavLink>
            <NavLink
              to="/media"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-medium py-2 ${
                  isActive
                    ? "text-main-500 border-l-4 border-main-500 pl-3"
                    : "text-soft-dark-500 hover:text-main-500 pl-3"
                }`
              }
            >
              {t("media")}
            </NavLink>
            <NavLink
              to="/contact-us"
              onClick={closeMenu}
              className={({ isActive }) =>
                `text-lg font-medium py-2 ${
                  isActive
                    ? "text-main-500 border-l-4 border-main-500 pl-3"
                    : "text-soft-dark-500 hover:text-main-500 pl-3"
                }`
              }
            >
              {t("contact")}
            </NavLink>

            <div className="py-2 pl-3">
              <LanguageSwitcher />
            </div>

            <NavLink
              to="/donate"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-4 py-3 hover:vibrate rounded-[12px] text-lg font-medium text-center transition ${
                  isActive
                    ? "bg-white text-main-500 border-2 border-main-500"
                    : "bg-main-500 text-white hover:opacity-90"
                }`
              }
            >
              {t("donate")}
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default UserNavbar;
