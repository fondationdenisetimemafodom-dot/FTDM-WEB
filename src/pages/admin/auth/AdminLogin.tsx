"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../lib/api";
import { useNavigate } from "react-router";
import logo from "../../../assets/images/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";

/*-----------------------------------------------------------------------------------------------------
 | @component AdminLogin
 | @brief    Admin login page for safe and secure access to the admin dashboard
 | @param    --
 | @return   Admin login page  TSX element
 -----------------------------------------------------------------------------------------------------*/
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  /*-----------------------------------------------------------------------------------------------------
  | @function sanitizeInput
  | @brief Sanitizes user input to prevent XSS attacks by removing potentially dangerous characters
  | @param input - string to be sanitized
  | @return sanitized string
  -----------------------------------------------------------------------------------------------------*/
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>?/gm, "")
      .replace(/[<>'"&]/g, "");
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function validateEmail
  | @brief Validates email format and prevents injection attacks
  | @param email - email string to validate
  | @return boolean indicating if email is valid
  -----------------------------------------------------------------------------------------------------*/
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function checkRateLimit
  | @brief Implements client-side rate limiting to prevent brute force attacks
  | @param --
  | @return boolean indicating if user can proceed with login attempt
  -----------------------------------------------------------------------------------------------------*/
  const checkRateLimit = (): boolean => {
    const maxAttempts = 5;
    const blockDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

    const lastBlockTime = localStorage.getItem("adminLoginBlockTime");
    if (lastBlockTime) {
      const timeSinceBlock = Date.now() - parseInt(lastBlockTime);
      if (timeSinceBlock < blockDuration) {
        setIsBlocked(true);
        const remainingTime = Math.ceil(
          (blockDuration - timeSinceBlock) / 60000
        );
        setError(
          `Too many failed attempts. Please try again in ${remainingTime} minutes.`
        );
        return false;
      } else {
        // Reset after block period
        localStorage.removeItem("adminLoginBlockTime");
        localStorage.removeItem("adminLoginAttempts");
        setIsBlocked(false);
        setLoginAttempts(0);
      }
    }

    return loginAttempts < maxAttempts;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleFailedLogin
  | @brief Handles failed login attempts and implements blocking mechanism
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleFailedLogin = (): void => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem("adminLoginAttempts", newAttempts.toString());

    if (newAttempts >= 5) {
      const blockTime = Date.now();
      localStorage.setItem("adminLoginBlockTime", blockTime.toString());
      setIsBlocked(true);
      setError(
        "Too many failed attempts. Account temporarily blocked for 15 minutes."
      );
    } else {
      setError(`Login failed. ${5 - newAttempts} attempts remaining.`);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function resetLoginAttempts
  | @brief Resets login attempts counter on successful login
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const resetLoginAttempts = (): void => {
    setLoginAttempts(0);
    setIsBlocked(false);
    localStorage.removeItem("adminLoginAttempts");
    localStorage.removeItem("adminLoginBlockTime");
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function loadSecurityState
  | @brief Loads security state on component mount to maintain rate limiting across sessions
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    const savedAttempts = localStorage.getItem("adminLoginAttempts");
    if (savedAttempts) {
      setLoginAttempts(parseInt(savedAttempts));
    }

    // Check if user is currently blocked
    checkRateLimit();
  }, []);

  /*-----------------------------------------------------------------------------------------------------
  | @function togglePasswordVisibility
  | @brief Toggles password field visibility between text and password type
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief Handles form submission for admin login with security validations and protections
  | @param e - React form event object
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is blocked
    if (!checkRateLimit()) {
      return;
    }

    setError("");
    setLoading(true);

    // Input validation and sanitization
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Password strength check (basic)
    if (sanitizedPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/login`,
        {
          email: sanitizedEmail,
          password: sanitizedPassword,
        },
        {
          // Security headers and configurations
          timeout: 10000, // 10 second timeout
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest", // CSRF protection
          },
        }
      );

      // Validate response structure
      if (
        !response.data ||
        !response.data.accessToken ||
        !response.data.refreshToken
      ) {
        throw new Error("Invalid response structure from server");
      }

      // Save tokens securely
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("adminAccessToken", accessToken);
      localStorage.setItem("adminRefreshToken", refreshToken);
      // Reset security counters on successful login
      resetLoginAttempts();

      // Clear sensitive form data
      setEmail("");
      setPassword("");

      console.log("Admin logged in successfully");
      navigate("/fdtm-admin/projects");
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle failed login attempt
      handleFailedLogin();

      // Handle specific axios errors with security considerations
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with a status code - sanitize error message
          const errorMessage = err.response.data?.message || "Login failed";
          setError(sanitizeInput(errorMessage));
        } else if (err.request) {
          // Request was made but no response received
          setError(
            "Connection failed. Please check your network and try again."
          );
        } else {
          // Something happened setting up the request
          setError("Request error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white px-6 sm:px-10 md:px-16 lg:px-20 py-8 sm:py-10 shadow-md rounded-lg">
        <img
          src={logo || "/placeholder.svg"}
          className="h-20 sm:h-32 md:h-40 w-auto mx-auto mb-4"
          alt="FTDM Logo"
        />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-500 mb-6">
          {t("login.title")}
        </h2>
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xl sm:text-2xl md:text-[30px] font-bold text-main-500"
            >
              {t("common.email")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(sanitizeInput(e.target.value))}
              required
              disabled={isBlocked}
              maxLength={254}
              className="mt-1 w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xl sm:text-2xl md:text-[30px] font-bold text-main-500"
            >
              {t("common.password")}
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                required
                disabled={isBlocked}
                minLength={8}
                maxLength={128}
                autoComplete="current-password"
                className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500"
                placeholder={t("login.passwordPlaceholder")}
              />
              {/* Password visibility toggle button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={
                  showPassword
                    ? t("common.hidePassword")
                    : t("common.showPassword")
                }
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isBlocked}
            className={`w-full mt-5 py-2 px-4 flex items-center justify-center text-xl sm:text-2xl md:text-[30px] text-white font-semibold rounded-lg transition ${
              isBlocked
                ? "bg-red-400 cursor-not-allowed"
                : "bg-main-500 hover:opacity-90"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
            ) : isBlocked ? (
              t("login.accountBlocked")
            ) : (
              t("login.loginButton")
            )}
          </button>

          <div className="flex justify-end mt-4 px-1">
            <button
              onClick={() => navigate("/fdtm-admin/forgot-password")}
              className="block text-sm sm:text-base md:text-lg font-bold text-main-500 hover:opacity-70"
              type="button"
            >
              {t("login.forgotPassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
