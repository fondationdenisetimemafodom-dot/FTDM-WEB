"use client";
/*-----------------------------------------------------------------------------------------------------
| @component MediaLibrary
| @brief    Main component for managing media library with upload and view operations
| @param    --
| @return   JSX element with tabs for upload, view images, and view videos
-----------------------------------------------------------------------------------------------------*/

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../lib/axiosInstance";

const MediaLibrary: React.FC = () => {
  const { t } = useTranslation("media-library");
  const [activeTab, setActiveTab] = useState<"upload" | "images" | "videos">(
    "upload"
  );

  return (
    <div className="bg-bg-blue-100 min-h-screen">
      <div className="">
        <div className="flex items-center px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "upload"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("uploadMediaTab")}
              </button>
              <button
                onClick={() => setActiveTab("images")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "images"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("viewImagesTab")}
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "videos"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("viewVideosTab")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "upload" ? (
        <UploadMediaView />
      ) : activeTab === "images" ? (
        <ViewMediaView mediaType="image" />
      ) : (
        <ViewMediaView mediaType="video" />
      )}
    </div>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component UploadMediaView
| @brief    Form component for uploading media files
| @param    --
| @return   JSX element of media upload form
-----------------------------------------------------------------------------------------------------*/

const UploadMediaView: React.FC = () => {
  const { t } = useTranslation("media-library");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /*-----------------------------------------------------------------------------------------------------
  | @function handleMediaChange
  | @brief    Handles media file selection and preview
  | @param    e - file input change event
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));

      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else {
        setMediaType(null);
      }
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief    Submits media file to backend API
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      if (!mediaFile) {
        setErrorMsg(t("pleaseSelectMedia"));
        return;
      }

      if (!mediaType) {
        setErrorMsg(t("invalidFileType"));
        return;
      }

      const formData = new FormData();
      formData.append("media", mediaFile);

      await axiosInstance.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccessPopup(true);

      setMediaFile(null);
      setMediaPreview("");
      setMediaType(null);
    } catch (err: any) {
      console.error("Failed to upload media:", err);
      setErrorMsg(err.response?.data?.message || t("failedToUpload"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-4 lg:mx-8 mb-8 p-4 lg:p-6 bg-white shadow-sm rounded-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("uploadMediaTitle")}
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("mediaFileLabel")}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-blue-50 relative overflow-hidden min-h-[296px]">
              {!mediaPreview ? (
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">
                    {t("browseToUpload")}
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer text-sm text-cyan-500 hover:text-cyan-600"
                  >
                    {t("selectFile")}
                  </label>
                </>
              ) : (
                <div className="w-full h-full relative">
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-md max-h-[400px]"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full h-full object-contain rounded-md max-h-[400px]"
                    />
                  )}
                  <div className="absolute bottom-2 left-2 flex space-x-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                      id="change-media"
                    />
                    <label
                      htmlFor="change-media"
                      className="cursor-pointer bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100"
                      title={t("changeFile")}
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
                        setMediaPreview("");
                        setMediaFile(null);
                        setMediaType(null);
                      }}
                      className="bg-red-500 bg-opacity-90 p-2 rounded-full shadow-md hover:bg-opacity-100 text-white"
                      title={t("removeFile")}
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

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? t("uploading") : t("uploadButton")}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600">{t("uploading")}</p>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
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
              {t("successTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("successMessage")}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {t("closeButton")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component ViewMediaView
| @brief    Component for viewing and managing media files (images or videos)
| @param    mediaType - type of media to display ("image" or "video")
| @return   JSX element displaying media grid with CRUD operations
-----------------------------------------------------------------------------------------------------*/

interface Media {
  public_id: string;
  url: string;
  type: "image" | "video";
  folder: string;
  created_at: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: Media | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const { t } = useTranslation("media-library");

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
            {t("deleteMediaTitle")}
          </h2>
        </div>

        <p className="text-gray-600 mb-6">{t("deleteConfirmation")}</p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            {t("cancelButton")}
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
                {t("deleting")}
              </>
            ) : (
              t("deleteButton")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  isOpen,
  onClose,
  media,
}) => {
  const { t } = useTranslation("media-library");

  if (!isOpen || !media) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {media.type === "image" ? t("imageDetails") : t("videoDetails")}
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

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col items-center space-y-6">
            {media.type === "image" ? (
              <img
                src={media.url || "/placeholder.svg"}
                alt="Media"
                className="w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : (
              <video
                src={media.url}
                controls
                className="w-full max-h-[500px] object-contain rounded-lg"
              />
            )}

            <div className="w-full pt-4 border-t">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">{t("createdLabel")}</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(media.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("folderLabel")}</p>
                  <p className="text-sm text-gray-700">{media.folder}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-500">{t("urlLabel")}</p>
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-500 hover:text-cyan-600 break-all"
                  >
                    {media.url}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewMediaView: React.FC<{ mediaType: "image" | "video" }> = ({
  mediaType,
}) => {
  const { t } = useTranslation("media-library");
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    mediaId: "",
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
  | @brief    Filters media based on search query
  | @param    query - search term
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredMedia(mediaList);
    } else {
      const filtered = mediaList.filter((m) =>
        m.url.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedia(filtered);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchMedia
  | @brief    Fetches all media from backend API and filters by type
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/media");
      const allMedia = response.data;

      const filtered = allMedia.filter((m: Media) => m.type === mediaType);
      setMediaList(filtered);
      setFilteredMedia(filtered);
    } catch (err: any) {
      console.error("Failed to fetch media:", err);
      setError(err.response?.data?.message || t("failedToLoadMedia"));
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleViewMedia
  | @brief    Opens media detail modal
  | @param    media - media to view
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleViewMedia = (media: Media) => {
    setSelectedMedia(media);
    setShowDetailModal(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDeleteMedia
  | @brief    Opens delete confirmation modal
  | @param    mediaId - ID of media to delete
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDeleteMedia = (mediaId: string) => {
    setDeleteModal({
      isOpen: true,
      mediaId,
      loading: false,
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function confirmDeleteMedia
  | @brief    Executes media deletion
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const confirmDeleteMedia = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      await axiosInstance.delete(`/api/media/${deleteModal.mediaId}`);

      const updatedMedia = mediaList.filter(
        (m) => m.public_id !== deleteModal.mediaId
      );
      setMediaList(updatedMedia);
      handleSearch(searchQuery);

      setDeleteModal({
        isOpen: false,
        mediaId: "",
        loading: false,
      });
    } catch (err: any) {
      console.error("Failed to delete media:", err);
      setError(err.response?.data?.message || t("failedToDeleteMedia"));
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
        mediaId: "",
        loading: false,
      });
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function retryFetch
  | @brief    Retries fetching media after error
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const retryFetch = () => {
    fetchMedia();
  };

  React.useEffect(() => {
    fetchMedia();
  }, [mediaType]);

  return (
    <>
      <div className="mx-4 lg:mx-8 mb-8 p-4 lg:p-6 bg-white shadow-sm rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {mediaType === "image" ? t("allImages") : t("allVideos")}
            </h1>
            {filteredMedia.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredMedia.length}{" "}
                {filteredMedia.length === 1
                  ? t("itemSingular")
                  : t("itemPlural")}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={retryFetch}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors disabled:opacity-50"
              title={t("refresh")}
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

        <div className="mb-6">
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
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm w-full lg:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
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
              {t("tryAgain")}
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500">{t("loading")}</p>
            </div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="py-12 text-center">
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
                {searchQuery
                  ? t("noResultsFound")
                  : mediaType === "image"
                  ? t("noImagesFound")
                  : t("noVideosFound")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((media) => (
              <div
                key={media.public_id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="aspect-video bg-gray-100 cursor-pointer"
                  onClick={() => handleViewMedia(media)}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.url || "/placeholder.svg"}
                      alt="Media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(media.created_at)}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewMedia(media)}
                      className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
                    >
                      {t("view")}
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(media.public_id)}
                      className="text-red-500 hover:text-red-600"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        media={selectedMedia}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteMedia}
        loading={deleteModal.loading}
      />
    </>
  );
};

export default MediaLibrary;
