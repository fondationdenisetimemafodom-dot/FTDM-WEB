"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Contact
 | @brief    Contact page with i18n translation, contact details, social links, and message form
 | @param    --
 | @return   Contact JSX element
 -----------------------------------------------------------------------------------------------------*/

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import API_BASE_URL from "../../lib/api";

// TypeScript interfaces
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

interface MessagePayload {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  content: string;
  message_type: "identified";
  client_timestamp: number;
  interaction_count: number;
  form_duration: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    type: string;
    status: string;
    created_at: string;
  };
  error?: string;
}

/*-----------------------------------------------------------------------------------------------------
| @function sanitizeInput
| @brief Sanitizes user input to prevent XSS attacks and other malicious content
| @param input - string to sanitize
| @return sanitized string
-----------------------------------------------------------------------------------------------------*/
const sanitizeInput = (input: string): string => {
  if (!input) return "";

  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, 1000); // Limit length - keep spaces intact
};

/*-----------------------------------------------------------------------------------------------------
| @function validateForm
| @brief Validates form data for identified messages
| @param formData - form data to validate
| @return validation result with errors
-----------------------------------------------------------------------------------------------------*/
const validateForm = (formData: FormData): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // First name validation
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  // Last name validation
  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  // Subject validation
  if (!formData.subject.trim()) {
    errors.subject = "Subject is required";
  } else if (formData.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters";
  }

  // Message validation
  if (!formData.message.trim()) {
    errors.message = "Message is required";
  } else if (formData.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  } else if (formData.message.length > 5000) {
    errors.message = "Message is too long (max 5000 characters)";
  }

  // Check for excessive links
  const linkCount = (formData.message.match(/(https?:\/\/[^\s]+)/gi) || [])
    .length;
  if (linkCount > 5) {
    errors.message = "Too many links in message";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/*-----------------------------------------------------------------------------------------------------
| @function useRateLimit
| @brief Custom hook to implement client-side rate limiting for form submissions
| @param limit - maximum number of requests
| @param windowMs - time window in milliseconds
| @return object with rate limiting functions
-----------------------------------------------------------------------------------------------------*/
const useRateLimit = (limit: number = 2, windowMs: number = 120000) => {
  // 2 requests per 2 minutes for identified messages
  const [requests, setRequests] = useState<number[]>([]);

  const canMakeRequest = (): boolean => {
    const now = Date.now();
    const validRequests = requests.filter((time) => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    setRequests([...validRequests, now]);
    return true;
  };

  const getResetTime = (): number => {
    if (requests.length === 0) return 0;
    const oldestRequest = Math.min(...requests);
    return Math.max(0, windowMs - (Date.now() - oldestRequest));
  };

  const checkCanMakeRequest = (): boolean => {
    const now = Date.now();
    const validRequests = requests.filter((time) => now - time < windowMs);
    return validRequests.length < limit;
  };

  return { canMakeRequest, getResetTime, checkCanMakeRequest };
};

function ContactUs() {
  const { t } = useTranslation("contact"); // Load "contact.json" namespace

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [honeypot, setHoneypot] = useState<string>(""); // Honeypot field

  // Security features
  const { canMakeRequest, getResetTime, checkCanMakeRequest } = useRateLimit(
    2,
    120000
  );
  const formStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);

  /*-----------------------------------------------------------------------------------------------------
  | @function handleInputChange
  | @brief Handles input changes with sanitization and interaction tracking
  | @param field - field name being updated
  | @param value - new field value
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleInputChange = (
    field: keyof FormData | "honeypot",
    value: string
  ): void => {
    interactionCount.current += 1;

    if (field === "honeypot") {
      setHoneypot(sanitizeInput(value));
      return;
    }

    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function performSecurityChecks
  | @brief Performs comprehensive security validation before form submission
  | @param --
  | @return boolean indicating if submission should proceed
  ------------------------------------------------------------------------------------------------------*/
  const performSecurityChecks = (): boolean => {
    // Honeypot check - bots often fill hidden fields
    if (honeypot.trim() !== "") {
      console.log("Security check failed: Honeypot field filled");
      return false;
    }

    // Timing check - too fast submission indicates bot
    const submissionTime = Date.now() - formStartTime.current;
    if (submissionTime < 10000) {
      // Less than 10 seconds for longer form
      console.log("Security check failed: Form submitted too quickly");
      return false;
    }

    // Interaction check - bots often don't interact naturally
    if (interactionCount.current < 5) {
      // More interactions required for longer form
      console.log("Security check failed: Insufficient user interaction");
      return false;
    }

    // Rate limiting check
    if (!checkCanMakeRequest()) {
      console.log("Security check failed: Rate limit exceeded");
      return false;
    }

    return true;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function submitForm
  | @brief Handles secure form submission with comprehensive validation
  | @param event - form submission event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const submitForm = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) return;

    // Clear previous status
    setSubmitStatus(null);

    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Perform security checks
      if (!performSecurityChecks()) {
        setSubmitStatus({
          type: "error",
          message: "Please try again later.",
        });
        return;
      }

      // Prepare payload
      const payload: MessagePayload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        content: formData.message.trim(),
        message_type: "identified",
        client_timestamp: Date.now(),
        interaction_count: interactionCount.current,
        form_duration: Date.now() - formStartTime.current,
      };

      // Submit to backend
      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/messages/create/identified`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          withCredentials: true,
          timeout: 15000, // 15 second timeout for identified messages
        }
      );

      if (response.data.success) {
        setSubmitStatus({
          type: "success",
          message: response.data.message || "Message sent successfully!",
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
        setFormErrors({});
        setHoneypot("");
        formStartTime.current = Date.now();
        interactionCount.current = 0;
      } else {
        throw new Error(response.data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Message submission error:", error);

      let errorMessage = "Failed to send message. Please try again.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;

        if (axiosError.response?.status === 429) {
          errorMessage = "Too many requests. Please wait before trying again.";
        } else if (axiosError.response?.status === 400) {
          errorMessage = axiosError.response.data.error || "Invalid form data.";
        } else if (axiosError.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (axiosError.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        }
      }

      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function getRateLimitMessage
  | @brief Gets user-friendly rate limit message
  | @param --
  | @return string with rate limit information
  ------------------------------------------------------------------------------------------------------*/
  const getRateLimitMessage = (): string => {
    const resetTime = Math.ceil(getResetTime() / 1000);
    return `Please wait ${resetTime} seconds before sending another message.`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype ContactSection
       | @brief    Displays main contact details, description, and office addresses
       | @param    --
       | @return   --
       -----------------------------------------------------------------------------------------------------*/}
      <section>
        <div className="flex flex-col gap-12 items-center">
          <div className="flex items-start justify-center bg-[#F3F5F8] w-full py-20 px-25 gap-28 ">
            <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>

            <div>
              <p className="uppercase text-2xl font-bold text-soft-dark-500">
                {t("title")}
              </p>
              <div className="flex flex-col gap-2 max-w-[480px]">
                <h2 className="text-[56px] font-bold text-main-500 mt-2">
                  {t("headline")}
                </h2>
                <p className="text-secondary-text-500 text-3xl">
                  {t("description")}
                </p>
              </div>
            </div>

            <div className="space-y-12 text-gray-700">
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("letsTalk")}
                </h3>
                <div className="flex space-x-10">
                  <span className="text-gray-500">{t("phone")}</span>
                  <span className="text-gray-500">{t("email")}</span>
                </div>
                <hr className="mt-3 text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("headOffice")}
                </h3>
                <p className="text-gray-500">{t("headOfficeAddress1")}</p>
                <p className="text-gray-500">{t("headOfficeAddress2")}</p>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("branchOffice")}
                </h3>
                <p className="text-gray-500">{t("branchOfficeAddress1")}</p>
                <p className="text-gray-500">{t("branchOfficeAddress2")}</p>
              </div>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>

          {/*-----------------------------------------------------------------------------------------------------
           | @blocktype MessageForm
           | @brief    Contact form for sending identified messages with security features
           | @param    --
           | @return   --
           -----------------------------------------------------------------------------------------------------*/}
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full">
            <h3 className="text-[40px] text-soft-dark-500 font-bold mb-6 text-center">
              {t("formHeadline")}
            </h3>

            {/* Status messages */}
            {submitStatus && (
              <div
                className={`text-sm p-4 rounded-lg mb-6 ${
                  submitStatus.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Rate limit warning */}
            {!checkCanMakeRequest() && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6 border border-amber-200">
                {getRateLimitMessage()}
              </div>
            )}

            <form onSubmit={submitForm} className="space-y-4">
              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="company"
                value={honeypot}
                onChange={(e) => handleInputChange("honeypot", e.target.value)}
                style={{
                  position: "absolute",
                  left: "-9999px",
                  visibility: "hidden",
                  opacity: 0,
                  height: 0,
                  width: 0,
                }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder={t("form.firstName")}
                    className={`border-3 rounded p-2 focus:outline-none px-4 py-2 w-full ${
                      formErrors.firstName
                        ? "border-red-300 focus:border-red-500"
                        : "border-blue-300 focus:border-blue-500"
                    }`}
                    maxLength={50}
                    required
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder={t("form.lastName")}
                    className={`border-3 rounded p-2 focus:outline-none px-4 py-2 w-full ${
                      formErrors.lastName
                        ? "border-red-300 focus:border-red-500"
                        : "border-blue-300 focus:border-blue-500"
                    }`}
                    maxLength={50}
                    required
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t("form.email")}
                    className={`border-3 rounded p-2 focus:outline-none px-4 py-2 w-full ${
                      formErrors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-blue-300 focus:border-blue-500"
                    }`}
                    maxLength={100}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder={t("form.subject")}
                    className={`border-3 rounded p-2 focus:outline-none px-4 py-2 w-full ${
                      formErrors.subject
                        ? "border-red-300 focus:border-red-500"
                        : "border-blue-300 focus:border-blue-500"
                    }`}
                    maxLength={200}
                    required
                  />
                  {formErrors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder={t("form.message")}
                  rows={5}
                  className={`border-3 rounded p-2 focus:outline-none px-4 py-2 w-full resize-vertical ${
                    formErrors.message
                      ? "border-red-300 focus:border-red-500"
                      : "border-blue-300 focus:border-blue-500"
                  }`}
                  maxLength={5000}
                  required
                />
                {formErrors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.message}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/5000 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !checkCanMakeRequest()}
                className="w-full bg-main-500 flex items-center justify-center text-white py-3 rounded-lg font-semibold hover:bg-secondary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                ) : (
                  t("form.send")
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
