/*-----------------------------------------------------------------------------------------------------
 | @component PartnershipForm
 | @brief    Form component for partners to submit their details (aligned with backend requirements)
 | @param    --
 | @return   Partnership form JSX element
 -----------------------------------------------------------------------------------------------------*/

"use client";

import type React from "react";
import { useState } from "react";
//import { useTranslation } from "react-i18next";
import axios from "axios";
import API_BASE_URL from "../lib/api";

interface PartnershipFormData {
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  proposal: string;
  website: string; // honeypot field (if security pipeline is used)
}

interface FormErrors {
  organizationName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  proposal?: string;
  general?: string;
}

function PartnershipForm() {
  //const { t } = useTranslation();

  const [formData, setFormData] = useState<PartnershipFormData>({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    proposal: "",
    website: "", // honeypot field
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  /*-----------------------------------------------------------------------------------------------------
   | @function validateForm
   | @brief    Client-side validation for partnership form fields
   | @return   boolean - true if form is valid, false otherwise
   -----------------------------------------------------------------------------------------------------*/
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Organization name validation
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    } else if (formData.organizationName.trim().length < 2) {
      newErrors.organizationName =
        "Organization name must be at least 2 characters";
    }

    // Contact person validation
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    } else if (formData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = "Contact person must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && formData.phone.trim().length > 0) {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (cleanPhone.length < 10) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Proposal validation
    if (!formData.proposal.trim()) {
      newErrors.proposal = "Partnership proposal is required";
    } else if (formData.proposal.trim().length < 10) {
      newErrors.proposal = "Proposal must be at least 10 characters";
    } else if (formData.proposal.length > 5000) {
      newErrors.proposal = "Proposal must be less than 5000 characters";
    }

    // Max links = 3 (if content checking is enabled)
    const linkCount = (formData.proposal.match(/https?:\/\/[^\s]+/g) || [])
      .length;
    if (linkCount > 3) {
      newErrors.proposal = "Too many links (max 3 allowed)";
    }

    // Honeypot field must stay empty (bot detection)
    if (formData.website.trim()) {
      newErrors.general = "Spam detected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /*-----------------------------------------------------------------------------------------------------
   | @function handleInputChange
   | @brief    Handles form input changes and clears related errors
   | @param    field - form field name
   | @param    value - new field value
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const handleInputChange = (
    field: keyof PartnershipFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear general error when user makes changes
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  /*-----------------------------------------------------------------------------------------------------
   | @function handleSubmit
   | @brief    Handles form submission with enhanced error handling and success feedback
   | @param    e - React form event
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Remove honeypot field before sending to API
      const { website, ...submitData } = formData;

      // Clean and prepare data for submission (match backend field names)
      const cleanedData = {
        organizationName: submitData.organizationName.trim(),
        contactPerson: submitData.contactPerson.trim(),
        email: submitData.email.trim().toLowerCase(),
        phone: submitData.phone.trim() || undefined,
        proposal: submitData.proposal.trim(),
      };

      // Debug logging
      console.log("Sending partnership data:", cleanedData);
      console.log("API URL:", `${API_BASE_URL}/api/forms/partnerships/apply`);
      console.log("Form data before cleaning:", formData);
      console.log("Submit data after extraction:", submitData);

      const response = await axios.post(
        `${API_BASE_URL}/api/forms/partnerships/apply`,
        cleanedData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000, // Increased timeout for potential security pipeline processing
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Reset form on success
        setFormData({
          organizationName: "",
          contactPerson: "",
          email: "",
          phone: "",
          proposal: "",
          website: "",
        });
        setIsSuccess(true);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Full partnership error:", error);

      let errorMessage =
        "Failed to submit partnership request. Please try again later.";

      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);

        if (error.response?.status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment before trying again.";
        } else if (error.response?.status === 400) {
          errorMessage =
            error.response?.data?.message ||
            "Please check your information and try again.";
        } else if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please try again.";
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full lg:w-[800px] mx-auto p-6 rounded-lg"
    >
      <h2 className="text-[30px] text-secondary-500 font-bold text-center">
        Partnership form
      </h2>
      <p className="text-center text-sm text-gray-600">
        Fill the form below correctly and we will review and get to you
      </p>

      {/* Success message display */}
      {isSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
          <p className="font-medium">
            Partnership request submitted successfully!
          </p>
          <p className="text-sm">
            Thank you for your interest. We'll review your proposal and be in
            touch soon.
          </p>
        </div>
      )}

      {/* General error display */}
      {errors.general && (
        <div className="text-red-500 text-sm text-center">{errors.general}</div>
      )}

      {/* Honeypot field (hidden from users, visible to bots) */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(e) => handleInputChange("website", e.target.value)}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Organization Name */}
      <input
        type="text"
        placeholder="Organization Name"
        value={formData.organizationName}
        onChange={(e) => handleInputChange("organizationName", e.target.value)}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={isLoading}
        maxLength={100}
      />
      {errors.organizationName && (
        <p className="text-sm text-red-500">{errors.organizationName}</p>
      )}

      {/* Contact Person */}
      <input
        type="text"
        placeholder="Contact Person"
        value={formData.contactPerson}
        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={isLoading}
        maxLength={50}
      />
      {errors.contactPerson && (
        <p className="text-sm text-red-500">{errors.contactPerson}</p>
      )}

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={isLoading}
        maxLength={100}
      />
      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

      {/* Whatsapp Number */}
      <input
        type="tel"
        placeholder="Whatsapp number"
        value={formData.phone}
        onChange={(e) => handleInputChange("phone", e.target.value)}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={isLoading}
        maxLength={20}
      />
      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}

      {/* Partnership Proposal */}
      <textarea
        placeholder="Tell Us Why You Would Want To Partner With Us"
        value={formData.proposal}
        onChange={(e) => handleInputChange("proposal", e.target.value)}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={isLoading}
        rows={3}
        maxLength={5000}
      />
      {errors.proposal && (
        <p className="text-sm text-red-500">{errors.proposal}</p>
      )}
      <p className="text-xs text-gray-500 text-right">
        {formData.proposal.length}/5000
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 flex items-center justify-center text-white py-2 rounded hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        disabled={isLoading || isSuccess}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
        ) : (
          "Submit"
        )}
      </button>
    </form>
  );
}

export default PartnershipForm;
