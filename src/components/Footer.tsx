/*-----------------------------------------------------------------------------------------------------
| @component Footer
| @brief Footer component with contact info, navigation links, dynamic social media, and anonymous message form
| @param --
| @return Footer JSX element with secure message submission and fetched social links
-----------------------------------------------------------------------------------------------------*/

import { useState, useRef, useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios, { AxiosError } from "axios";
import logo from "../../src/assets/images/logo-white.png";
import API_BASE_URL from "../lib/api";

// TypeScript interfaces
interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

interface SecurityCheckResult {
  isSecure: boolean;
  issues: string[];
}

interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

interface MessagePayload {
  content: string;
  purpose: "general";
  message_type: "anonymous";
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
| @function validateMessageContent
| @brief Validates message content according to security rules
| @param content - message content to validate
| @return object with isValid boolean and error message
-----------------------------------------------------------------------------------------------------*/
const validateMessageContent = (content: string): ValidationResult => {
  if (!content || content.trim().length < 10) {
    return {
      isValid: false,
      error: "Message must be at least 10 characters long",
    };
  }

  if (content.length > 1000) {
    return {
      isValid: false,
      error: "Message is too long (max 1000 characters)",
    };
  }

  const linkCount = (content.match(/(https?:\/\/[^\s]+)/gi) || []).length;
  if (linkCount > 2) {
    return { isValid: false, error: "Too many links in message" };
  }

  const spamPatterns = [/(.)\1{10,}/, /^[A-Z\s!]{20,}$/];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: "Message contains suspicious content" };
    }
  }

  return { isValid: true, error: null };
};

/*-----------------------------------------------------------------------------------------------------
| @function useRateLimit
| @brief Custom hook to implement client-side rate limiting for form submissions only
| @param limit - maximum number of requests
| @param windowMs - time window in milliseconds
| @return object with canMakeRequest boolean and resetTime
-----------------------------------------------------------------------------------------------------*/
const useRateLimit = (limit: number = 3, windowMs: number = 60000) => {
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

const Footer: React.FC = () => {
  const { t } = useTranslation("footer");

  // Form state management
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null);
  const [socialLinksLoading, setSocialLinksLoading] = useState<boolean>(true);

  // Security features
  const [honeypot, setHoneypot] = useState<string>("");
  const { canMakeRequest, getResetTime, checkCanMakeRequest } = useRateLimit(
    3,
    60000
  );
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
  const getSocialIcon = (platform: string): JSX.Element => {
    const iconProps = { size: 20 };

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
  | @function getSocialPlatformName
  | @brief Returns the display name for a social platform
  | @param platform - social media platform key
  | @return formatted platform name
  ------------------------------------------------------------------------------------------------------*/
  const getSocialPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      facebook: "Facebook",
      twitter: "Twitter",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      tiktok: "TikTok",
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      website: "Website",
    };
    return names[platform] || platform;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleInputChange
  | @brief Handles input changes with security validation and interaction tracking
  | @param field - field name being updated
  | @param value - new field value
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleInputChange = (field: string, value: string): void => {
    interactionCount.current += 1;

    const sanitizedValue = sanitizeInput(value);

    switch (field) {
      case "message":
        setMessage(sanitizedValue);
        break;
      case "honeypot":
        setHoneypot(sanitizedValue);
        break;
      default:
        break;
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function performSecurityChecks
  | @brief Performs comprehensive security validation before form submission
  | @param --
  | @return object with isSecure boolean and reasons array
  ------------------------------------------------------------------------------------------------------*/
  const performSecurityChecks = (): SecurityCheckResult => {
    const issues: string[] = [];

    if (honeypot.trim() !== "") {
      issues.push("Honeypot field filled");
    }

    const submissionTime = Date.now() - formStartTime.current;
    if (submissionTime < 5000) {
      issues.push("Form submitted too quickly");
    }

    if (interactionCount.current < 3) {
      issues.push("Insufficient user interaction");
    }

    if (!checkCanMakeRequest()) {
      issues.push("Rate limit exceeded");
    }

    const contentValidation = validateMessageContent(message);
    if (!contentValidation.isValid) {
      issues.push(contentValidation.error || "Content validation failed");
    }

    return {
      isSecure: issues.length === 0,
      issues,
    };
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function submitMessage
  | @brief Handles secure message submission with comprehensive validation
  | @param event - form submission event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const submitMessage = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const securityCheck = performSecurityChecks();

      if (!securityCheck.isSecure) {
        console.log("Security check failed:", securityCheck.issues);
        setSubmitStatus({
          type: "error",
          message: "Please try again later.",
        });
        return;
      }

      const payload: MessagePayload = {
        content: message.trim(),
        purpose: "general",
        message_type: "anonymous",
        client_timestamp: Date.now(),
        interaction_count: interactionCount.current,
        form_duration: Date.now() - formStartTime.current,
      };

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/messages/create/anonymous`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setSubmitStatus({
          type: "success",
          message: response.data.message || "Message sent successfully!",
        });

        setMessage("");
        setHoneypot("");
        formStartTime.current = Date.now();
        interactionCount.current = 0;

        setTimeout(() => setShowForm(false), 3000);
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
          errorMessage =
            axiosError.response.data.error || "Invalid message data.";
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

  /*-----------------------------------------------------------------------------------------------------
  | @function resetForm
  | @brief Resets form to initial state
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const resetForm = (): void => {
    setShowForm(false);
    setMessage("");
    setSubmitStatus(null);
    setHoneypot("");
    formStartTime.current = Date.now();
    interactionCount.current = 0;
  };

  return (
    <footer className="bg-secondary-500 text-white py-8 px-20 mt-auto">
      <div className="mx-auto flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-8 lg:gap-16">
        {/* Logo and Info */}
        <div>
          <div className="flex flex-row items-start">
            <img src={logo} alt="Foundation Logo" className="w-16 mb-3" />
            <div className="ml-3 space-y-2 text-sm">
              <h2 className="font-bold max-w-54 text-2xl">{t("title")}</h2>
              {socialLinks?.email && (
                <p className="flex items-center gap-2">
                  <MdEmail /> {socialLinks.email}
                </p>
              )}
              <p className="flex items-center gap-2">
                <MdLocationOn /> {t("contact.location")}
              </p>
              {socialLinks?.phone && (
                <p className="flex items-center gap-2">
                  <MdPhone /> {socialLinks.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Home Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.home")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/about-us" className="hover:underline">
                {t("links.about")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/what-we-do" className="hover:underline">
                {t("links.whatWeDo")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact-us" className="hover:underline">
                {t("links.contact")}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.more")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/projects" className="hover:underline">
                {t("links.projects")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className="hover:underline">
                {t("links.events")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/donate" className="hover:underline">
                {t("links.donate")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className="hover:underline">
                {t("links.blog")}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Connect Links - Dynamic Social Media */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.connect")}</h3>
          {socialLinksLoading ? (
            <div className="text-sm text-gray-300">Loading...</div>
          ) : socialLinks && socialLinks.isActive ? (
            <ul className="space-y-2 text-sm">
              {Object.entries(socialLinks).map(([platform, url]) => {
                // Skip non-social fields and empty values
                if (
                  platform === "isActive" ||
                  platform === "email" ||
                  platform === "phone" ||
                  platform === "_id" ||
                  platform === "updatedAt" ||
                  platform === "createdAt" ||
                  !url ||
                  typeof url !== "string" ||
                  url.trim() === ""
                ) {
                  return null;
                }

                return (
                  <li key={platform}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline transition-all hover:text-gray-200"
                    >
                      {getSocialIcon(platform)}
                      <span>{getSocialPlatformName(platform)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FaFacebook /> {t("social.facebook")}
              </li>
              <li className="flex items-center gap-2">
                <FaInstagram /> {t("social.instagram")}
              </li>
              <li className="flex items-center gap-2">
                <FaTwitter /> {t("social.twitter")}
              </li>
              <li className="flex items-center gap-2">
                <FaLinkedin /> {t("social.linkedin")}
              </li>
            </ul>
          )}
        </div>

        {/* Anonymous Message Section */}
        <div className="min-w-80">
          <h3 className="font-bold text-3xl mb-2">{t("sections.message")}</h3>

          {!showForm ? (
            <div className="flex border-2 mt-4 border-white rounded-md overflow-hidden">
              <input
                type="text"
                value={message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                onFocus={() => setShowForm(true)}
                placeholder={
                  t("form.placeholder") || "Send us a quick message..."
                }
                className="w-full p-2 text-white focus:outline-none placeholder:text-white bg-transparent"
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-white text-secondary-500 px-4 font-medium hover:bg-gray-100 transition-colors"
              >
                {t("form.send") || "Expand"}
              </button>
            </div>
          ) : (
            <form onSubmit={submitMessage} className="space-y-3 mt-4">
              {/* Honeypot field */}
              <input
                type="text"
                name="website"
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

              <div>
                <textarea
                  value={message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder={t("form.placeholder") || "Your message..."}
                  className="w-full p-3 border-2 border-white rounded-md bg-transparent text-white placeholder:text-gray-300 focus:outline-none focus:border-gray-300 resize-vertical"
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-gray-300 mt-1">
                  {message.length}/1000 characters
                </div>
              </div>

              {submitStatus && (
                <div
                  className={`text-sm p-2 rounded ${
                    submitStatus.type === "success"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {!checkCanMakeRequest() && (
                <div className="text-sm text-yellow-300">
                  {getRateLimitMessage()}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !checkCanMakeRequest() ||
                    message.trim().length < 10
                  }
                  className="flex-1 bg-white text-secondary-500 px-4 py-2 font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t("form.sending") || "Sending..."
                    : t("form.send") || "Send"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:text-secondary-500 transition-colors"
                >
                  {t("form.cancel") || "Cancel"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
