import React, { useEffect, useState } from "react";
import { X, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  publicId: string;
  type: string;
  url: string;
  _id: string;
};

/*-----------------------------------------------------------------------------------------------------
| @interface ProjectModalProps
| @brief    Props interface for ProjectModal component
| @param    project - full project data to display
| @param    onClose - callback function to close modal
-----------------------------------------------------------------------------------------------------*/
interface ProjectModalProps {
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
  onClose: () => void;
}

/*-----------------------------------------------------------------------------------------------------
| @function ProjectModal
| @brief    Renders a modal popup displaying full project details with media carousel
| @param    ProjectModalProps - project data and close callback
| @return   JSX.Element - rendered modal component
-----------------------------------------------------------------------------------------------------*/
const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Reset media index when project changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [project]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [project]);

  if (!project) return null;

  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief    Formats ISO date string to readable format
  | @param    dateString - ISO date string from backend
  | @return   string - formatted date (e.g., "January 2024")
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
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? project.media.length - 1 : prev - 1
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleNextMedia
  | @brief    Navigates to next media item in carousel
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === project.media.length - 1 ? 0 : prev + 1
    );
  };

  const currentMedia = project.media[currentMediaIndex];

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 pr-12">
            {project.title}
          </h2>
        </div>

        {/* Media Section with Carousel */}
        {project.media && project.media.length > 0 && (
          <div className="relative w-full h-64 md:h-80 bg-gray-200">
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

            {/* Carousel Navigation - only show if more than 1 media item */}
            {project.media.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition"
                  aria-label="Previous media"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>

                {/* Media Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {project.media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentMediaIndex
                          ? "bg-white w-8"
                          : "bg-white bg-opacity-50"
                      }`}
                      aria-label={`View media ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.status === "ongoing"
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {project.status === "ongoing" ? "Ongoing" : "Completed"}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700">
                {project.category}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Location and Date */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-main-500" />
              <span className="font-medium">{project.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2 text-main-500" />
              <span>
                Started:{" "}
                <span className="font-medium">
                  {formatDate(project.startDate)}
                </span>
              </span>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Project Description
            </h3>
            <div
              className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </div>

          {/* Impact Achieved */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Impact achieved
            </h3>
            <p className="text-gray-700">
              Trained{" "}
              <span className="font-semibold">{project.beneficiaries}</span>{" "}
              students in basic computer skills and digital literacy.
            </p>
          </div>

          {/* Key Achievements (placeholder - customize as needed) */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Key achievements
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Computer skills to {project.beneficiaries} beneficiaries</li>
              <li>Digital literacy training</li>
              <li>Community engagement programs</li>
              <li>Teacher training programs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
