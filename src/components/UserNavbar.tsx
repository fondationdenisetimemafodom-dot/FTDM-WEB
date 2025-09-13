"use client";

import { NavLink } from "react-router-dom";
import logo from "../../src/assets/images/logo.png";
import LanguageSwitcher from "./LanguageSwitcher";

function UserNavbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <div className="  p-4 sm:px-6 lg:px-8 flex items-center justify-between lg:gap-25 ">
        {/* Logo */}
        <div className="flex  items-center gap-2 ">
          <img src={logo} alt="Logo" className="h-[97px] w-[115px]" />
          <span className="font-bold  text-sm  max-w-55 lg:text-[25px]">
            Fondation Denise Time Mafodom
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-between text-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `lg:text-[25px] font-medium ${
                isActive
                  ? "text-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about-us"
            className={({ isActive }) =>
              `lg:text-[25px] font-medium ${
                isActive
                  ? "text-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            About us
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `lg:text-[25px] font-medium ${
                isActive
                  ? "text-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            Projects
          </NavLink>
          <NavLink
            to="/media"
            className={({ isActive }) =>
              `lg:text-[25px] font-medium ${
                isActive
                  ? "text-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            Media
          </NavLink>
          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              `lg:text-[25px] font-medium ${
                isActive
                  ? "text-main-500"
                  : "text-soft-dark-500 hover:text-color-main-500"
              }`
            }
          >
            Contact
          </NavLink>

          <div className="relative">
            <LanguageSwitcher />
          </div>

          {/* Donate Button */}
          <NavLink
            to="/donate"
            className={({ isActive }) =>
              `px-8 py-3 rounded-[12px] text-lg font-medium transition ${
                isActive
                  ? "bg-white text-main-500"
                  : "bg-main-500 text-white hover:opacity-90"
              }`
            }
          >
            Donate
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
