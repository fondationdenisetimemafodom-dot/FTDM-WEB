"use client";
/*-----------------------------------------------------------------------------------------------------
| @component AdminContributorsPartners
| @brief    Main component for managing contributors and partners with CRUD operations
| @param    --
| @return   JSX element with tabs for create and view contributors/partners
-----------------------------------------------------------------------------------------------------*/

import React, { useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import { useTranslation } from "react-i18next";

const AdminContributorsPartners: React.FC = () => {
  const { t } = useTranslation("contributors");
  const [activeTab, setActiveTab] = useState<"create" | "view">("create");

  return (
    <div className="bg-bg-blue-100 min-h-screen">
      {/* Header */}
      <div className="">
        <div className="flex items-center px-6 py-4">
          <div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("create")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "create"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("header.createTab")}
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "view"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("header.viewTab")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "create" ? (
        <CreateContributorView />
      ) : (
        <ViewContributorsView />
      )}
    </div>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component CreateContributorView
| @brief    Form component for creating and editing contributors/partners
| @param    contributorId - optional ID for editing mode
| @return   JSX element of contributor creation/editing form
-----------------------------------------------------------------------------------------------------*/

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

interface ContributorFormData {
  name: string;
  role: string;
  type: "contributor" | "partner";
  image: File | null;
  socialMedia: SocialMediaLinks;
}

const CreateContributorView: React.FC = () => {
  const { t } = useTranslation("contributors");
  const [formData, setFormData] = useState<ContributorFormData>({
    name: "",
    role: "",
    type: "contributor",
    image: null,
    socialMedia: {},
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /*-----------------------------------------------------------------------------------------------------
  | @function handleImageChange
  | @brief    Handles image file selection and preview
  | @param    e - file input change event
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSocialMediaChange
  | @brief    Updates social media link in form data
  | @param    platform - social media platform name
  | @param    value - URL value
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [platform]: value,
      },
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief    Submits contributor/partner form data
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Validation
      if (!formData.name.trim()) {
        setErrorMsg(t("create.validation.nameRequired"));
        return;
      }
      if (!formData.role.trim()) {
        setErrorMsg(t("create.validation.roleRequired"));
        return;
      }
      if (!formData.image) {
        setErrorMsg(t("create.validation.imageRequired"));
        return;
      }

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("role", formData.role);
      submitData.append("type", formData.type);
      if (formData.image) {
        submitData.append("media", formData.image);
      }
      submitData.append("socialMedia", JSON.stringify(formData.socialMedia));
      console.log(submitData.get("socialMedia"));
      await axiosInstance.post("/api/contributors-partners", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccessPopup(true);

      // Reset form
      setFormData({
        name: "",
        role: "",
        type: "contributor",
        image: null,
        socialMedia: {},
      });
      setImagePreview("");
    } catch (err: any) {
      console.error("Failed to create contributor/partner:", err);
      setErrorMsg(err.response?.data?.message || t("errors.failedToCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("create.title")}
          </h1>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("create.imageLabel")}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-blue-50 relative overflow-hidden h-[296px]">
                {!imagePreview ? (
                  <>
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88 7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("create.browseText")}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-sm text-cyan-500 hover:text-cyan-600"
                    >
                      {t("create.selectImage")}
                    </label>
                  </>
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <div className="absolute bottom-2 left-2 flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="change-image"
                      />
                      <label
                        htmlFor="change-image"
                        className="cursor-pointer bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100"
                        title="Change image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </label>
                      <button
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image: null });
                        }}
                        className="bg-red-500 bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100 text-white"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("create.nameLabel")}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("create.namePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("create.roleLabel")}
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder={t("create.rolePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("create.typeLabel")}
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="contributor"
                    checked={formData.type === "contributor"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "contributor" | "partner",
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-sm border-2 mr-2 flex items-center justify-center ${
                      formData.type === "contributor"
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.type === "contributor" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    {t("create.typeContributor")}
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="partner"
                    checked={formData.type === "partner"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "contributor" | "partner",
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-sm border-2 mr-2 flex items-center justify-center ${
                      formData.type === "partner"
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {formData.type === "partner" && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    {t("create.typePartner")}
                  </span>
                </label>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("create.socialMediaLabel")}
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <input
                    type="url"
                    value={formData.socialMedia.facebook || ""}
                    onChange={(e) =>
                      handleSocialMediaChange("facebook", e.target.value)
                    }
                    placeholder={t("create.facebookPlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <input
                    type="url"
                    value={formData.socialMedia.twitter || ""}
                    onChange={(e) =>
                      handleSocialMediaChange("twitter", e.target.value)
                    }
                    placeholder={t("create.twitterPlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-pink-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                  <input
                    type="url"
                    value={formData.socialMedia.instagram || ""}
                    onChange={(e) =>
                      handleSocialMediaChange("instagram", e.target.value)
                    }
                    placeholder={t("create.instagramPlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin || ""}
                    onChange={(e) =>
                      handleSocialMediaChange("linkedin", e.target.value)
                    }
                    placeholder={t("create.linkedinPlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-1 5v9h2v-9h-2z" />
                  </svg>
                  <input
                    type="url"
                    value={formData.socialMedia.website || ""}
                    onChange={(e) =>
                      handleSocialMediaChange("website", e.target.value)
                    }
                    placeholder={t("create.websitePlaceholder")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? t("create.publishing") : t("create.publishButton")}
          </button>
        </div>
      </div>

      {/* Processing Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600">{t("create.publishing")}</p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("create.success.title")}
            </h3>
            <p className="text-gray-600 mb-6">{t("create.success.message")}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {t("create.success.closeButton")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component ViewContributorsView
| @brief    Component for viewing and managing all contributors/partners
| @param    --
| @return   JSX element displaying contributors/partners table with CRUD operations
-----------------------------------------------------------------------------------------------------*/

interface Contributor {
  _id: string;
  name: string;
  role: string;
  type: "contributor" | "partner";
  picture: {
    url: string;
    public_id: string;
  };
  socialMedia: SocialMediaLinks;
  createdAt: string;
  updatedAt: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contributorName: string;
  loading: boolean;
}

interface ContributorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributor: Contributor | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contributorName,
  loading,
}) => {
  const { t } = useTranslation("contributors");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {t("view.delete.title")}
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          {t("view.delete.message")} <strong>"{contributorName}"</strong>?
          {t("view.delete.warning")}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            {t("view.delete.cancelButton")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("view.delete.deleting")}
              </>
            ) : (
              /* replaced with translation key */
              t("view.delete.deleteButton")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContributorDetailModal: React.FC<ContributorDetailModalProps> = ({
  isOpen,
  onClose,
  contributor,
}) => {
  const { t } = useTranslation("contributors");

  if (!isOpen || !contributor) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const socialMediaPlatforms = [
    {
      name: t("view.modal.facebookTitle"),
      key: "facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "text-blue-600",
    },
    {
      name: t("view.modal.twitterTitle"),
      key: "twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      color: "text-blue-400",
    },
    {
      name: t("view.modal.instagramTitle"),
      key: "instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
        </svg>
      ),
      color: "text-pink-600",
    },
    {
      name: t("view.modal.linkedinTitle"),
      key: "linkedin",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "text-blue-700",
    },
    {
      name: t("view.modal.websiteTitle"),
      key: "website",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-1 5v9h2v-9h-2z" />
        </svg>
      ),
      color: "text-gray-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {contributor.type === "contributor"
              ? t("view.modal.contributorDetails")
              : t("view.modal.partnerDetails")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Image */}
            <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100">
              <img
                src={contributor.picture.url || "/placeholder.svg"}
                alt={contributor.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name and Role */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {contributor.name}
              </h3>
              <p className="text-lg text-gray-600">{contributor.role}</p>
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                  contributor.type === "contributor"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {contributor.type === "contributor"
                  ? t("create.typeContributor")
                  : t("create.typePartner")}
              </span>
            </div>

            {/* Social Media Links */}
            {contributor.socialMedia &&
              Object.keys(contributor.socialMedia).length > 0 && (
                <div className="w-full">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                    {t("view.modal.socialMediaTitle")}
                  </h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {socialMediaPlatforms.map((platform) => {
                      const url =
                        contributor.socialMedia[
                          platform.key as keyof SocialMediaLinks
                        ];
                      if (!url) return null;

                      return (
                        <a
                          key={platform.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${platform.color}`}
                          title={platform.name}
                        >
                          {platform.icon}
                          <span className="text-sm text-gray-700">
                            {platform.name}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Dates */}
            <div className="w-full pt-4 border-t text-center">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">
                    {t("view.modal.createdLabel")}
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDate(contributor.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("view.modal.lastUpdatedLabel")}
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDate(contributor.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewContributorsView: React.FC = () => {
  const { t } = useTranslation("contributors");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [filteredContributors, setFilteredContributors] = useState<
    Contributor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "contributor" | "partner"
  >("all");
  const [selectedContributor, setSelectedContributor] =
    useState<Contributor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    contributorId: "",
    contributorName: "",
    loading: false,
  });

  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief    Formats ISO date string to readable format
  | @param    dateString - ISO date string
  | @return   formatted date string
  -----------------------------------------------------------------------------------------------------*/
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSearch
  | @brief    Filters contributors based on search query and type
  | @param    query - search term
  | @param    type - filter type
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSearch = (
    query: string,
    type: "all" | "contributor" | "partner"
  ) => {
    setSearchQuery(query);
    setFilterType(type);

    let filtered = contributors;

    // Filter by type
    if (type !== "all") {
      filtered = filtered.filter((c) => c.type === type);
    }

    // Filter by search query
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.role.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredContributors(filtered);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchContributors
  | @brief    Fetches all contributors/partners from backend API
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchContributors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/contributors-partners");
      const contributorsData = response.data.contributors || response.data;

      console.log(contributorsData);
      setContributors(contributorsData);
      setFilteredContributors(contributorsData);
    } catch (err: any) {
      console.error("Failed to fetch contributors:", err);
      setError(err.response?.data?.message || t("errors.failedToFetch"));
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleViewContributor
  | @brief    Opens contributor detail modal
  | @param    contributor - contributor to view
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleViewContributor = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setShowDetailModal(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDeleteContributor
  | @brief    Opens delete confirmation modal
  | @param    contributorId - ID of contributor to delete
  | @param    contributorName - name for confirmation
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDeleteContributor = (
    contributorId: string,
    contributorName: string
  ) => {
    setDeleteModal({
      isOpen: true,
      contributorId,
      contributorName,
      loading: false,
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function confirmDeleteContributor
  | @brief    Executes contributor deletion
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const confirmDeleteContributor = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      // TODO: Replace with actual API call using axiosInstance
      // await axiosInstance.delete(`/api/contributors/${deleteModal.contributorId}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedContributors = contributors.filter(
        (c) => c._id !== deleteModal.contributorId
      );
      setContributors(updatedContributors);
      handleSearch(searchQuery, filterType);

      setDeleteModal({
        isOpen: false,
        contributorId: "",
        contributorName: "",
        loading: false,
      });
    } catch (err: any) {
      console.error("Failed to delete contributor:", err);
      setError(err.response?.data?.message || t("view.delete.errorMessage"));
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function closeDeleteModal
  | @brief    Closes delete confirmation modal
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({
        isOpen: false,
        contributorId: "",
        contributorName: "",
        loading: false,
      });
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function retryFetch
  | @brief    Retries fetching contributors after error
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const retryFetch = () => {
    fetchContributors();
  };

  // Fetch contributors on component mount
  React.useEffect(() => {
    fetchContributors();
  }, []);

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("view.title")}
            </h1>
            {filteredContributors.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredContributors.length}{" "}
                {filteredContributors.length !== 1
                  ? t("view.items")
                  : t("view.item")}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={retryFetch}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          {/* Type Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleSearch(searchQuery, "all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === "all"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("view.allFilter")}
            </button>
            <button
              onClick={() => handleSearch(searchQuery, "contributor")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === "contributor"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("view.contributorsFilter")}
            </button>
            <button
              onClick={() => handleSearch(searchQuery, "partner")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === "partner"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("view.partnersFilter")}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t("view.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value, filterType)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm w-64"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("", filterType)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {t("errors.tryAgain")}
            </button>
          </div>
        )}

        {/* Contributors Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.nameHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.roleHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.typeHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.socialMediaHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.lastUpdateHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.actionHeader")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("view.table.deleteHeader")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500">
                          {t("view.table.loading")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredContributors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500">
                          {searchQuery || filterType !== "all"
                            ? t("view.table.noResults")
                            : t("view.table.noContributors")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContributors.map((contributor) => (
                    <tr
                      key={contributor._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={contributor.picture.url || "/placeholder.svg"}
                            alt={contributor.name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleViewContributor(contributor)}
                          />
                          <span className="font-medium text-gray-900 text-sm">
                            {contributor.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {contributor.role}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            contributor.type === "contributor"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {contributor.type === "contributor"
                            ? t("create.typeContributor")
                            : t("create.typePartner")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {contributor.socialMedia?.facebook && (
                            <a
                              href={contributor.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                              title="Facebook"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </a>
                          )}
                          {contributor.socialMedia?.twitter && (
                            <a
                              href={contributor.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500"
                              title="Twitter"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </a>
                          )}
                          {contributor.socialMedia?.linkedin && (
                            <a
                              href={contributor.socialMedia.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-800"
                              title="LinkedIn"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </a>
                          )}
                          {contributor.socialMedia?.website && (
                            <a
                              href={contributor.socialMedia.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700"
                              title="Website"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 3c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm-1 5v9h2v-9h-2z" />
                              </svg>
                            </a>
                          )}
                          {!contributor.socialMedia ||
                            (Object.keys(contributor.socialMedia).length ===
                              0 && (
                              <span className="text-xs text-gray-400">
                                {t("view.table.noneText")}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(contributor.updatedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewContributor(contributor)}
                          className="text-cyan-500 cursor-pointer underline hover:text-cyan-600 transition-colors text-sm"
                        >
                          {t("view.table.viewButton")}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            handleDeleteContributor(
                              contributor._id,
                              contributor.name
                            )
                          }
                          className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ContributorDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        contributor={selectedContributor}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteContributor}
        contributorName={deleteModal.contributorName}
        loading={deleteModal.loading}
      />
    </>
  );
};

export default AdminContributorsPartners;
