"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../lib/api";
import { useNavigate } from "react-router";
import logo from "../../../assets/images/logo.png";
import { FiCheck, FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "react-i18next";

/*-----------------------------------------------------------------------------------------------------
 | @component ForgotPassword
 | @brief    Admin forgot password page with email request and code verification functionality
 | @param    --
 | @return   Forgot password page TSX element
 -----------------------------------------------------------------------------------------------------*/
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
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
  | @function validateCode
  | @brief Validates 6-digit reset code format
  | @param code - code string to validate
  | @return boolean indicating if code format is valid
  -----------------------------------------------------------------------------------------------------*/
  const validateCode = (code: string): boolean => {
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function checkRateLimit
  | @brief Implements client-side rate limiting to prevent abuse
  | @param --
  | @return boolean indicating if user can proceed with request
  -----------------------------------------------------------------------------------------------------*/
  const checkRateLimit = (): boolean => {
    const maxAttempts = 3;
    const blockDuration = 10 * 60 * 1000; // 10 minutes in milliseconds

    const lastBlockTime = localStorage.getItem("forgotPasswordBlockTime");
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
        localStorage.removeItem("forgotPasswordBlockTime");
        localStorage.removeItem("forgotPasswordAttempts");
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
    localStorage.setItem("forgotPasswordAttempts", newAttempts.toString());

    if (newAttempts >= 3) {
      const blockTime = Date.now();
      localStorage.setItem("forgotPasswordBlockTime", blockTime.toString());
      setIsBlocked(true);
      setError("Too many failed attempts. Temporarily blocked for 10 minutes.");
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function startCountdown
  | @brief Starts countdown timer to prevent immediate resend requests
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const startCountdown = (): void => {
    setCountdown(60); // 60 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function loadSecurityState
  | @brief Loads security state on component mount to maintain rate limiting across sessions
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    const savedAttempts = localStorage.getItem("forgotPasswordAttempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    checkRateLimit();
  }, []);

  /*-----------------------------------------------------------------------------------------------------
  | @function handleEmailSubmit
  | @brief Handles email submission for password reset request
  | @param e - React form event object
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/reset-password-request`,
        {
          email: sanitizedEmail,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      setSuccess(
        "If an account exists for this email, a reset code has been sent."
      );
      setStep("code");
      startCountdown();
    } catch (err: any) {
      console.error("Reset password request error:", err);
      handleFailedAttempt();

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage = err.response.data?.message || "Request failed";
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
  | @function handleCodeSubmit
  | @brief Handles code verification submission
  | @param e - React form event object
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const sanitizedCode = sanitizeInput(code);

    if (!validateCode(sanitizedCode)) {
      setError("Please enter a valid 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/verify-reset-code`,
        {
          email: sanitizeInput(email),
          code: sanitizedCode,
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (response.data.resetToken) {
        // Store the reset token for the password reset page
        sessionStorage.setItem("resetToken", response.data.resetToken);
      }

      // Store verified state and navigate to reset password
      sessionStorage.setItem("resetEmailVerified", email);
      sessionStorage.setItem("resetCodeVerified", "true");
      navigate("/fdtm-admin/reset-password");
    } catch (err: any) {
      console.error("Code verification error:", err);
      handleFailedAttempt();

      if (axios.isAxiosError(err)) {
        if (err.response) {
          const errorMessage =
            err.response.data?.message || "Code verification failed";
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
  | @function handleResendCode
  | @brief Handles resending verification code
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError("");
    setSuccess("");
    await handleEmailSubmit(new Event("submit") as any);
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

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              step === "code" ? setStep("email") : navigate("/fdtm-admin")
            }
            className="flex items-center text-main-500 hover:opacity-70 transition"
            type="button"
          >
            <FiArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm sm:text-base">{t("common.back")}</span>
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-gray-500">
            {step === "email"
              ? t("forgotPassword.title")
              : t("forgotPassword.verifyCodeTitle")}
          </h2>
          <div className="w-16"></div>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-center space-x-3">
            <FiCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-700 text-sm sm:text-base">{success}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-main-500 flex items-center space-x-3">
            <div className="flex-1">
              <p className="text-main-500 text-sm sm:text-base">
                {t("forgotPassword.infoMessage")}
              </p>
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

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xl mb-2 sm:text-2xl md:text-[30px] font-bold text-main-500"
              >
                {t("common.email")}
              </label>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                  required
                  disabled={isBlocked}
                  maxLength={254}
                  className="mt-1 w-full px-3 sm:px-4 py-2 pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={t("login.emailPlaceholder")}
                />
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
                t("common.temporarilyBlocked")
              ) : (
                t("forgotPassword.sendButton")
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-xl sm:text-2xl md:text-[30px] font-bold text-main-500"
              >
                {t("forgotPassword.codeLabel")}
              </label>
              <p className="text-sm text-gray-600 mb-2">
                {t("forgotPassword.codeDescription", { email })}
              </p>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) =>
                  setCode(sanitizeInput(e.target.value.replace(/\D/g, "")))
                }
                required
                disabled={isBlocked}
                maxLength={6}
                minLength={6}
                pattern="\d{6}"
                className="mt-1 w-full px-3 sm:px-4 py-2 sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-main-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-center text-2xl tracking-widest"
                placeholder={t("forgotPassword.codePlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || isBlocked || code.length !== 6}
              className={`w-full mt-5 py-2 px-4 flex items-center justify-center text-xl sm:text-2xl md:text-[30px] text-white font-semibold rounded-lg transition ${
                isBlocked || code.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-main-500 hover:opacity-90"
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
              ) : isBlocked ? (
                t("common.temporarilyBlocked")
              ) : (
                t("forgotPassword.verifyButton")
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className={`text-sm sm:text-base font-medium transition ${
                  countdown > 0 || loading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-main-500 hover:opacity-70"
                }`}
              >
                {countdown > 0
                  ? t("forgotPassword.resendCountdown", { seconds: countdown })
                  : t("forgotPassword.resendCode")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
