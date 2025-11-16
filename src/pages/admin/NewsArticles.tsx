"use client";
/*-----------------------------------------------------------------------------------------------------
| @component NewsArticles
| @brief    Main component for managing articles with CRUD operations
| @param    --
| @return   JSX element with tabs for create and view articles
-----------------------------------------------------------------------------------------------------*/

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../lib/axiosInstance";

const NewsArticles: React.FC = () => {
  const { t } = useTranslation("news-articles");
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
                {t("createArticle")}
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "view"
                    ? "text-main-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("viewArticles")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "create" ? <CreateArticleView /> : <ViewArticlesView />}
    </div>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component CreateArticleView
| @brief    Form component for creating and editing articles
| @param    --
| @return   JSX element of article creation/editing form
-----------------------------------------------------------------------------------------------------*/

interface ArticleFormData {
  title: string;
  content: string;
  projectTitle: string;
  tags: string[];
  published: boolean;
}

const CreateArticleView: React.FC = () => {
  const { t } = useTranslation("news-articles");
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    projectTitle: "",
    tags: [],
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [tagInput, setTagInput] = useState("");

  /*-----------------------------------------------------------------------------------------------------
  | @function handleAddTag
  | @brief    Adds a new tag to the article
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleRemoveTag
  | @brief    Removes a tag from the article
  | @param    tag - tag to remove
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSubmit
  | @brief    Submits article form data
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Validation
      if (!formData.title.trim()) {
        setErrorMsg(t("titleRequired"));
        return;
      }
      if (!formData.content.trim()) {
        setErrorMsg(t("contentRequired"));
        return;
      }
      if (!formData.projectTitle.trim()) {
        setErrorMsg(t("projectRequired"));
        return;
      }

      const submitData = {
        title: formData.title,
        content: formData.content,
        projectTitle: formData.projectTitle,
        tags: formData.tags,
        published: formData.published,
      };

      await axiosInstance.post("/api/articles", submitData);

      setShowSuccessPopup(true);

      // Reset form
      setFormData({
        title: "",
        content: "",
        projectTitle: "",
        tags: [],
        published: false,
      });
      setTagInput("");
    } catch (err: any) {
      console.error("Failed to create article:", err);
      setErrorMsg(err.response?.data?.message || t("failedToCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t("createArticle")}
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

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("articleTitle")}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t("enterArticleTitle")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("projectTitle")}
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData({ ...formData, projectTitle: e.target.value })
              }
              placeholder={t("associatedProject")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("tags")}
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t("addTagPrompt")}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
              >
                {t("add")}
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-cyan-600 hover:text-cyan-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("content")}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder={t("enterContent")}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Published Status */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {t("publishImmediately")}
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? t("publishing") : t("publish")}
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
            <p className="text-gray-600">{t("processingLoader")}</p>
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
              {t("successTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("articlePublished")}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component ViewArticlesView
| @brief    Component for viewing and managing all articles
| @param    --
| @return   JSX element displaying articles table with CRUD operations
-----------------------------------------------------------------------------------------------------*/

interface Article {
  _id: string;
  title: string;
  content: string;
  projectTitle: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  articleTitle: string;
  loading: boolean;
}

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

const ViewArticlesView: React.FC = () => {
  const { t } = useTranslation("news-articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "draft"
  >("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: "",
    articleTitle: "",
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
  | @brief    Filters articles based on search query and publication status
  | @param    query - search term
  | @param    status - filter status
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSearch = (
    query: string,
    status: "all" | "published" | "draft"
  ) => {
    setSearchQuery(query);
    setFilterPublished(status);

    let filtered = articles;

    // Filter by publication status
    if (status !== "all") {
      filtered = filtered.filter((a) =>
        status === "published" ? a.published : !a.published
      );
    }

    // Filter by search query
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.projectTitle.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchArticles
  | @brief    Fetches all articles from backend API
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/articles");
      const articlesData = response.data.articles || response.data;

      setArticles(articlesData);
      setFilteredArticles(articlesData);
    } catch (err: any) {
      console.error("Failed to fetch articles:", err);
      setError(t("failedToFetch"));
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleViewArticle
  | @brief    Opens article detail modal
  | @param    article - article to view
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowDetailModal(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDeleteArticle
  | @brief    Opens delete confirmation modal
  | @param    articleId - ID of article to delete
  | @param    articleTitle - title for confirmation
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDeleteArticle = (articleId: string, articleTitle: string) => {
    setDeleteModal({
      isOpen: true,
      articleId,
      articleTitle,
      loading: false,
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function confirmDeleteArticle
  | @brief    Executes article deletion
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const confirmDeleteArticle = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      await axiosInstance.delete(`/api/articles/${deleteModal.articleId}`);

      const updatedArticles = articles.filter(
        (a) => a._id !== deleteModal.articleId
      );
      setArticles(updatedArticles);
      handleSearch(searchQuery, filterPublished);

      setDeleteModal({
        isOpen: false,
        articleId: "",
        articleTitle: "",
        loading: false,
      });
    } catch (err: any) {
      console.error("Failed to delete article:", err);
      setError(t("failedToDelete"));
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
        articleId: "",
        articleTitle: "",
        loading: false,
      });
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function retryFetch
  | @brief    Retries fetching articles after error
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const retryFetch = () => {
    fetchArticles();
  };

  // Fetch articles on component mount
  React.useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {t("allArticles")}
            </h1>
            {filteredArticles.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredArticles.length}{" "}
                {filteredArticles.length === 1 ? t("item") : t("items")}
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

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          {/* Status Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleSearch(searchQuery, "all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterPublished === "all"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("filterAll")}
            </button>
            <button
              onClick={() => handleSearch(searchQuery, "published")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterPublished === "published"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("filterPublished")}
            </button>
            <button
              onClick={() => handleSearch(searchQuery, "draft")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterPublished === "draft"
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("filterDraft")}
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
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value, filterPublished)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm w-72"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("", filterPublished)}
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
              {t("refresh")}
            </button>
          </div>
        )}

        {/* Articles Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableTitle")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableProject")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableStatus")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableTags")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableLastUpdate")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableAction")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    {t("tableDelete")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500">{t("loading")}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
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
                          {searchQuery || filterPublished !== "all"
                            ? t("noResults")
                            : t("noArticles")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr
                      key={article._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {article.title}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {article.projectTitle}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            article.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {article.published
                            ? t("statusPublished")
                            : t("statusDraft")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                              +{article.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(article.updatedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewArticle(article)}
                          className="text-cyan-500 cursor-pointer underline hover:text-cyan-600 transition-colors text-sm"
                        >
                          {t("viewArticle")}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            handleDeleteArticle(article._id, article.title)
                          }
                          className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                          title={t("deleteArticle")}
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
      <ArticleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        article={selectedArticle}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteArticle}
        articleTitle={deleteModal.articleTitle}
        loading={deleteModal.loading}
      />
    </>
  );
};

const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  isOpen,
  article,
}) => {
  const { t } = useTranslation("news-articles");

  if (!isOpen || !article) return null;

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
            {t("articleDetails")}
          </h2>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[90vh] overflow-hidden space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500">
              {t("detailProject")}{" "}
              <span className="font-medium">{article.projectTitle}</span>
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{t("detailStatus")}</p>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  article.published
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {article.published ? t("statusPublished") : t("statusDraft")}
              </span>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                {t("detailTags")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {t("detailContent")}
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {article.content}
              </p>
            </div>
          </div>

          {/* Author and Dates */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">{t("detailCreated")}</p>
                <p className="font-medium text-gray-700">
                  {formatDate(article.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("detailLastUpdated")}
                </p>
                <p className="font-medium text-gray-700">
                  {formatDate(article.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  articleTitle,
  loading,
}) => {
  const { t } = useTranslation("news-articles");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
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
            {t("deleteArticle")}
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          {t("deleteConfirmation")} <strong>"{articleTitle}"</strong>?{" "}
          {t("deleteWarning")}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            {t("cancel")}
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
              /* using translation key for Delete button */
              t("deleteButton")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsArticles;
