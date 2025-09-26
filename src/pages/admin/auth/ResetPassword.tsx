"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../lib/api";
import { useNavigate } from "react-router";
import logo from "../../../assets/images/logo.png";
import { FiEye, FiEyeOff, FiCheck, FiX, FiArrowLeft } from "react-icons/fi";

/*-----------------------------------------------------------------------------------------------------
 | @component ResetPassword
 | @brief    Admin password reset page with secure password validation and updating
 | @param    --
 | @return   Reset password page TSX element
 -----------------------------------------------------------------------------------------------------*/
function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [resetToken, setResetToken] = useState("");
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
  | @function validatePasswordStrength
  | @brief Validates password strength against security requirements
  | @param password - password string to validate
  | @return object with strength criteria validation results
  -----------------------------------------------------------------------------------------------------*/
  const validatePasswordStrength = (password: string) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordStrength(strength);
    return strength;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function isPasswordValid
  | @brief Checks if password meets all security requirements
  | @param --
  | @return boolean indicating if password is valid
  -----------------------------------------------------------------------------------------------------*/
  const isPasswordValid = (): boolean => {
    return Object.values(passwordStrength).every(Boolean);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function checkRateLimit
  | @brief Implements client-side rate limiting to prevent abuse
  | @param --
  | @return boolean indicating if user can proceed with request
  -----------------------------------------------------------------------------------------------------*/
  const checkRateLimit = (): boolean => {
    const maxAttempts = 5;
    const blockDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

    const lastBlockTime = localStorage.getItem("resetPasswordBlockTime");
    if (lastBlockTime) {
      const timeSinceBlock = Date.now() - parseInt(lastBlockTime);
      if (timeSinceBlock < blockDuration) {
        setIsBlocked(true);
        const remainingTime = Math.ceil(
          (blockDuration - timeSinceBlock) / 60000
        );
        setError(
          `Too many attempts. Please try again in ${remainingTime} minutes.`
        );
        return false;
      } else {
        localStorage.removeItem("resetPasswordBlockTime");
        localStorage.removeItem("resetPasswordAttempts");
        setIsBlocked(false);
        setAttempts(0);
      }
    }

    return attempts < maxAttempts;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleFailedAttempt
  | @brief Handles failed attempts and implements blocking mechanism
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleFailedAttempt = (): void => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("resetPasswordAttempts", newAttempts.toString());

    if (newAttempts >= 5) {
      const blockTime = Date.now();
      localStorage.setItem("resetPasswordBlockTime", blockTime.toString());
      setIsBlocked(true);
      setError("Too many failed attempts. Temporarily blocked for 15 minutes.");
    } else {
      setError(`Password reset failed. ${5 - newAttempts} attempts remaining.`);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function validateAccess
  | @brief Validates user access to reset password page through proper flow
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    const emailVerified = sessionStorage.getItem("resetEmailVerified");
    const codeVerified = sessionStorage.getItem("resetCodeVerified");
    const storedResetToken = sessionStorage.getItem("resetToken");

    if (!emailVerified || !codeVerified || !storedResetToken) {
      navigate("/fdtm-admin/forgot-password");
      return;
    }

    setResetToken(storedResetToken);

    const savedAttempts = localStorage.getItem("resetPasswordAttempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    checkRateLimit();
  }, [navigate]);

  /*-----------------------------------------------------------------------------------------------------
  | @function handlePasswordChange
  | @brief Handles password input change with strength validation
  | @param value - new password value
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handlePasswordChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setNewPassword(sanitizedValue);
    validatePasswordStrength(sanitizedValue);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief Handles password reset form submission with validation
  | @param e - React form event object
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const sanitizedNewPassword = sanitizeInput(newPassword);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    // Validation checks
    if (!isPasswordValid()) {
      setError("Password does not meet security requirements.");
      setLoading(false);
      return;
    }

    if (sanitizedNewPassword !== sanitizedConfirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (sanitizedNewPassword.length < 8 || sanitizedNewPassword.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/reset-password`,
        {
          resetToken: resetToken,
          newPassword: sanitizedNewPassword,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      setSuccess("Password reset successfully! Redirecting to login...");

      // Clear session data
      sessionStorage.removeItem("resetEmailVerified");
      sessionStorage.removeItem("resetCodeVerified");
      sessionStorage.removeItem("resetToken");
      localStorage.removeItem("resetPasswordAttempts");
      localStorage.removeItem("resetPasswordBlockTime");

      // Save tokens securely
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("adminAccessToken", accessToken);
      localStorage.setItem("adminRefreshToken", refreshToken);
      // Clear form data
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after success
      setTimeout(() => {
        navigate("/fdtm-admin");
      }, 2000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      handleFailedAttempt();

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage =
            err.response.data?.message || "Password reset failed";
          setError(sanitizeInput(errorMessage));
        } else if (err.request) {
          setError(
            "Connection failed. Please check your network and try again."
          );
        } else {
          setError("Request error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function PasswordStrengthIndicator
  | @brief Renders password strength validation indicators
  | @param --
  | @return JSX element with strength indicators
  -----------------------------------------------------------------------------------------------------*/
  const PasswordStrengthIndicator = () => (
    <div className="mt-2 space-y-1">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Password Requirements:
      </div>
      {[
        { key: "length", text: "At least 8 characters" },
        { key: "uppercase", text: "One uppercase letter" },
        { key: "lowercase", text: "One lowercase letter" },
        { key: "number", text: "One number" },
        { key: "special", text: "One special character" },
      ].map(({ key, text }) => (
        <div key={key} className="flex items-center space-x-2">
          {passwordStrength[key as keyof typeof passwordStrength] ? (
            <FiCheck className="h-4 w-4 text-green-500" />
          ) : (
            <FiX className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-sm ${
              passwordStrength[key as keyof typeof passwordStrength]
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {text}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white px-6 sm:px-10 md:px-16 lg:px-20 py-8 sm:py-10 shadow-md rounded-lg">
        <img
          src={logo}
          className="h-20 sm:h-32 md:h-40 w-auto mx-auto mb-4"
          alt="FTDM Logo"
        />

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/fdtm-admin/forgot-password")}
            className="flex items-center text-main-500 hover:opacity-70 transition"
            type="button"
          >
            <FiArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-500">
            Set New Password
          </h2>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-center space-x-3">
            <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-700 text-sm sm:text-base">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xl sm:text-2xl md:text-[30px] font-bold text-main-500"
            >
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={isBlocked}
                minLength={8}
                maxLength={128}
                className="w-full px-3 sm:px-4 py-2 pl-10 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
            {newPassword && <PasswordStrengthIndicator />}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xl sm:text-2xl md:text-[30px] font-bold text-main-500"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(sanitizeInput(e.target.value))
                }
                required
                disabled={isBlocked}
                minLength={8}
                maxLength={128}
                className="w-full px-3 sm:px-4 py-2 pl-10 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="mt-2 flex items-center space-x-2">
                <FiX className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">
                  Passwords do not match
                </span>
              </div>
            )}
            {confirmPassword &&
              newPassword === confirmPassword &&
              confirmPassword.length > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <FiCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Passwords match
                  </span>
                </div>
              )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              isBlocked ||
              !isPasswordValid() ||
              newPassword !== confirmPassword
            }
            className={`w-full mt-6 py-2 px-4 flex items-center justify-center text-xl sm:text-2xl md:text-[30px] text-white font-semibold rounded-lg transition ${
              isBlocked || !isPasswordValid() || newPassword !== confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-main-500 hover:opacity-90"
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
            ) : isBlocked ? (
              "Temporarily Blocked"
            ) : (
              "Reset Password"
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/fdtm-admin")}
                className="text-main-500 hover:opacity-70 font-medium"
              >
                Back to Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
