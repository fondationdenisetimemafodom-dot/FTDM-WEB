/*-----------------------------------------------------------------------------------------------------
| @file ContactUs.tsx
| @brief Contact page with i18n translation, contact details, dynamic social links, and message form
| @param --
| @return Contact page JSX with responsive layout and secure message submission
-----------------------------------------------------------------------------------------------------*/

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
} from "react-icons/fa";
import API_BASE_URL from "../../lib/api";

/*-----------------------------------------------------------------------------------------------------
| TypeScript Interfaces
-----------------------------------------------------------------------------------------------------*/

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

interface SocialLinksData {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
  phone?: string;
  website?: string;
  isActive: boolean;
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
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .substring(0, 1000);
};

/*-----------------------------------------------------------------------------------------------------
| @function validateForm
| @brief Validates form data for identified messages
| @param formData - form data to validate
| @return validation result with errors
-----------------------------------------------------------------------------------------------------*/
const validateForm = (formData: FormData): ValidationResult => {
  const errors: { [key: string]: string } = {};

  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  if (!formData.subject.trim()) {
    errors.subject = "Subject is required";
  } else if (formData.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters";
  }

  if (!formData.message.trim()) {
    errors.message = "Message is required";
  } else if (formData.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  } else if (formData.message.length > 5000) {
    errors.message = "Message is too long (max 5000 characters)";
  }

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
  const { t } = useTranslation("contact");

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
  const [honeypot, setHoneypot] = useState<string>("");

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null);
  const [socialLinksLoading, setSocialLinksLoading] = useState<boolean>(true);

  const { getResetTime, checkCanMakeRequest } = useRateLimit(2, 120000);
  const formStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchSocialLinks
  | @brief Fetches active social media links from backend API
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchSocialLinks = async (): Promise<void> => {
    try {
      setSocialLinksLoading(true);
      const response = await axios.get<{ socialLinks: SocialLinksData }>(
        `${API_BASE_URL}/api/social-links/active`,
        { timeout: 5000 }
      );

      if (response.data.socialLinks && response.data.socialLinks.isActive) {
        setSocialLinks(response.data.socialLinks);
      }
    } catch (error) {
      console.error("Failed to fetch social links:", error);
      // Fail silently - social links are not critical
    } finally {
      setSocialLinksLoading(false);
    }
  };

  // Fetch social links on component mount
  useEffect(() => {
    fetchSocialLinks();
  }, []);

  /*-----------------------------------------------------------------------------------------------------
  | @function getSocialIcon
  | @brief Returns the appropriate icon component for a social platform
  | @param platform - social media platform name
  | @return React icon component
  ------------------------------------------------------------------------------------------------------*/
  const getSocialIcon = (platform: string): React.ReactElement => {
    const iconProps = {
      className: "text-secondary-500 hover:text-secondary-600 text-xl",
    };

    switch (platform) {
      case "facebook":
        return <FaFacebook {...iconProps} />;
      case "instagram":
        return <FaInstagram {...iconProps} />;
      case "twitter":
        return <FaTwitter {...iconProps} />;
      case "linkedin":
        return <FaLinkedin {...iconProps} />;
      case "youtube":
        return <FaYoutube {...iconProps} />;
      case "tiktok":
        return <FaTiktok {...iconProps} />;
      case "whatsapp":
        return <FaWhatsapp {...iconProps} />;
      case "telegram":
        return <FaTelegram {...iconProps} />;
      case "website":
        return <FaGlobe {...iconProps} />;
      default:
        return <FaGlobe {...iconProps} />;
    }
  };

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
    if (honeypot.trim() !== "") {
      console.log("Security check failed: Honeypot field filled");
      return false;
    }

    const submissionTime = Date.now() - formStartTime.current;
    if (submissionTime < 10000) {
      console.log("Security check failed: Form submitted too quickly");
      return false;
    }

    if (interactionCount.current < 5) {
      console.log("Security check failed: Insufficient user interaction");
      return false;
    }

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

    setSubmitStatus(null);

    const validation = validateForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!performSecurityChecks()) {
        setSubmitStatus({
          type: "error",
          message: "Please try again later.",
        });
        return;
      }

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

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/messages/create/identified`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          withCredentials: true,
          timeout: 15000,
        }
      );

      if (response.data.success) {
        setSubmitStatus({
          type: "success",
          message: response.data.message || "Message sent successfully!",
        });

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
        } else if (axiosError.response && axiosError.response.status >= 500) {
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

  /*-----------------------------------------------------------------------------------------------------
  | @function renderSocialLinks
  | @brief Renders dynamic social media links or fallback static links
  | @param --
  | @return JSX elements for social media links
  ------------------------------------------------------------------------------------------------------*/
  const renderSocialLinks = (): React.ReactElement => {
    if (socialLinksLoading) {
      return (
        <div className="flex gap-4 mt-4">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      );
    }

    if (socialLinks && socialLinks.isActive) {
      // Filter and map over available social platforms
      const availablePlatforms = Object.entries(socialLinks).filter(
        ([platform, url]) =>
          platform !== "isActive" &&
          platform !== "email" &&
          platform !== "phone" &&
          platform !== "_id" &&
          platform !== "updatedAt" &&
          platform !== "createdAt" &&
          url &&
          typeof url === "string" &&
          url.trim() !== ""
      );

      if (availablePlatforms.length > 0) {
        return (
          <div className="flex gap-4 mt-4">
            {availablePlatforms.map(([platform, url]) => (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all"
              >
                {getSocialIcon(platform)}
              </a>
            ))}
          </div>
        );
      }
    }

    // Fallback to static social links if no dynamic links available
    return (
      <div className="flex gap-4 mt-4">
        <a
          href="#"
          className="text-secondary-500 hover:text-secondary-600 text-xl"
        >
          <FaFacebook />
        </a>
        <a
          href="#"
          className="text-secondary-500 hover:text-secondary-600 text-xl"
        >
          <FaInstagram />
        </a>
        <a
          href="#"
          className="text-secondary-500 hover:text-secondary-600 text-xl"
        >
          <FaTwitter />
        </a>
        <a
          href="#"
          className="text-secondary-500 hover:text-secondary-600 text-xl"
        >
          <FaLinkedin />
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype ContactSection
       | @brief Displays main contact details, description, and office addresses with dynamic social links
       | @param --
       | @return --
       -----------------------------------------------------------------------------------------------------*/}
      <section>
        <div className="flex flex-col gap-12 items-center">
          <div className="flex flex-col lg:flex-row items-start justify-center bg-[#F3F5F8] w-full py-10 lg:py-20 px-4 lg:px-25 gap-8 lg:gap-28">
            <div className=" hidden lg:block mt-2 bg-soft-dark-500 h-4 w-20"></div>

            <div className="w-full lg:w-auto">
              <div className="flex flex-row items-center gap-4">
                <div className=" block lg:hidden  bg-soft-dark-500 h-3 w-15"></div>
                <p className="uppercase text-xl lg:text-2xl font-bold text-soft-dark-500">
                  {t("title")}
                </p>
              </div>
              <div className="flex flex-col gap-2 max-w-full lg:max-w-[480px]">
                <h2 className="text-[40px] lg:text-[56px] font-bold text-main-500 mt-2">
                  {t("headline")}
                </h2>
                <p className="text-secondary-text-500 text-lg lg:text-3xl">
                  {t("description")}
                </p>
              </div>
            </div>

            <div className="space-y-8 lg:space-y-12 text-gray-700 w-full lg:w-auto">
              <div>
                <h3 className="font-bold text-xl lg:text-2xl text-secondary-500">
                  {t("letsTalk")}
                </h3>
                <div className="flex flex-col lg:flex-row lg:space-x-10 space-y-2 lg:space-y-0">
                  <span className="text-gray-500 text-sm lg:text-base">
                    {t("phone")}
                  </span>
                  <span className="text-gray-500 text-sm lg:text-base">
                    {t("email")}
                  </span>
                </div>
                <hr className="mt-3 text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-xl lg:text-2xl text-secondary-500">
                  {t("headOffice")}
                </h3>
                <p className="text-gray-500 text-sm lg:text-base">
                  {t("headOfficeAddress1")}
                </p>
                <p className="text-gray-500 text-sm lg:text-base">
                  {t("headOfficeAddress2")}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-xl lg:text-2xl text-secondary-500">
                  {t("branchOffice")}
                </h3>
                <p className="text-gray-500 text-sm lg:text-base">
                  {t("branchOfficeAddress1")}
                </p>
                <p className="text-gray-500 text-sm lg:text-base">
                  {t("branchOfficeAddress2")}
                </p>
              </div>
              {renderSocialLinks()}
            </div>
          </div>

          {/*-----------------------------------------------------------------------------------------------------
           | @blocktype MessageForm
           | @brief Contact form for sending identified messages with security features
           | @param --
           | @return --
           -----------------------------------------------------------------------------------------------------*/}
          <div className="bg-white rounded-xl p-4 lg:p-8 max-w-4xl w-full px-4">
            <h3 className="text-2xl lg:text-[40px] text-soft-dark-500 font-bold mb-6 text-center">
              {t("formHeadline")}
            </h3>

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

            {!checkCanMakeRequest() && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6 border border-amber-200">
                {getRateLimitMessage()}
              </div>
            )}

            <form onSubmit={submitForm} className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-20">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-20">
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
