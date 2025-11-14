import React, { useEffect, useState } from "react";
import API_BASE_URL from "../lib/api";

import {
  MapPin,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

type MediaItem = {
  publicId: string;
  type: string;
  url: string;
  _id: string;
};
type Article = {
  _id: string;
  title: string;
  content: string;
  projectTitle: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
/*-----------------------------------------------------------------------------------------------------
| @interface ProjectDetailsPageProps
| @brief    Props interface for ProjectDetailsPage component
-----------------------------------------------------------------------------------------------------*/
interface ProjectDetailsPageProps {
  project: {
    _id: string;
    title: string;
    category: string;
    location: string;
    status: "ongoing" | "completed";
    beneficiaries: string;
    startDate: string;
    description: string;
    media: MediaItem[];
  } | null;
  onBack: () => void;
}

/*-----------------------------------------------------------------------------------------------------
| @function ProjectDetailsPage
| @brief    Renders a full page displaying complete project details with media carousel and gallery
-----------------------------------------------------------------------------------------------------*/
const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({
  project,
  onBack,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState("");
  // Return early if no project
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Project not found</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-main-500 text-white rounded-lg hover:bg-main-600 transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief    Formats ISO date string to readable format
  -----------------------------------------------------------------------------------------------------*/
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handlePrevMedia
  | @brief    Navigates to previous media item in carousel
  -----------------------------------------------------------------------------------------------------*/
  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? project.media.length - 1 : prev - 1
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleNextMedia
  | @brief    Navigates to next media item in carousel
  -----------------------------------------------------------------------------------------------------*/
  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === project.media.length - 1 ? 0 : prev + 1
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function sanitizeHtml
  | @brief    Sanitizes HTML content to only allow safe formatting tags
  -----------------------------------------------------------------------------------------------------*/
  const sanitizeHtml = (html: string): string => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const dangerousTags = temp.querySelectorAll(
      "script, style, iframe, object, embed"
    );
    dangerousTags.forEach((tag) => tag.remove());
    return temp.innerHTML;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        setArticlesError("");
        const response = await fetch(`${API_BASE_URL}/api/articles`);

        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await response.json();
        const allArticles = data.articles || data;

        // Filter articles that match the project title and are published
        const filteredArticles = allArticles.filter(
          (article: Article) =>
            article.projectTitle === project?.title && article.published
        );

        setArticles(filteredArticles);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setArticlesError("Failed to load articles");
      } finally {
        setArticlesLoading(false);
      }
    };

    if (project) {
      fetchArticles();
    }
  }, [project?.title]);
  const currentMedia = project.media?.[currentMediaIndex];
  const sanitizedDescription = sanitizeHtml(project.description || "");
  const galleryMedia = project.media?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-main-500 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Projects</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Media Carousel */}
          {project.media && project.media.length > 0 && currentMedia && (
            <div className="relative w-full h-64 md:h-96 bg-gray-200">
              {currentMedia.type === "video" ? (
                <video
                  src={currentMedia.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentMedia.url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Carousel Navigation */}
              {project.media.length > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  {/* Media Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {project.media.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`h-2 rounded-full transition ${
                          index === currentMediaIndex
                            ? "bg-white w-8"
                            : "bg-white bg-opacity-50 w-2"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Status and Category Badges */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    project.status === "ongoing"
                      ? "bg-gray-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {project.status === "ongoing" ? "Ongoing" : "Completed"}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-700 shadow">
                  {project.category}
                </span>
              </div>
            </div>
          )}

          {/* Project Title and Info */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              {project.title}
            </h1>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 mr-3 text-main-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="font-semibold text-gray-800">
                    {project.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 mr-3 text-main-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Beneficiaries
                  </p>
                  <p className="font-semibold text-gray-800">
                    {project.beneficiaries}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 mr-3 text-main-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Started</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(project.startDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Project Description
              </h2>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm md:prose-base max-w-none [&>p]:mb-4 [&>strong]:font-bold [&>em]:italic [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          </div>
        </div>

        {/* Media Gallery - First 4 Media Items */}
        {galleryMedia.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Project Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryMedia.map((media, index) => (
                <div
                  key={media._id}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 hover:shadow-lg transition cursor-pointer"
                  onClick={() => setCurrentMediaIndex(index)}
                >
                  {media.type === "video" ? (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Play icon overlay for videos */}
                  {media.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[16px] border-l-gray-800 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl mt-10 shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Associated Articles
          </h2>

          {articlesLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-500"></div>
              <p className="text-gray-500 mt-4">Loading articles...</p>
            </div>
          ) : articlesError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
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
              <p className="text-red-700">{articlesError}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No articles found for this project
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {article.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-2">
                    {article.content}
                  </p>
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-main-100 text-main-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
