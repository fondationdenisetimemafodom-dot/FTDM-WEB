import React from "react";
import { MapPin, Users, Calendar } from "lucide-react";

type MediaItem = {
  publicId: string;
  type: string;
  url: string;
  _id: string;
};

/*-----------------------------------------------------------------------------------------------------
| @interface ProjectCardProps
| @brief    Props interface for ProjectCard component
| @param    _id - unique project identifier
| @param    title - project title/name
| @param    category - project cause/category
| @param    location - project location
| @param    status - project status (ongoing/completed)
| @param    beneficiaries - number of beneficiaries
| @param    startDate - project start date
| @param    description - project description
| @param    media - array of project media items
| @param    onClick - callback function when card is clicked
-----------------------------------------------------------------------------------------------------*/
interface ProjectCardProps {
  _id: string;
  title: string;
  category: string;
  location: string;
  status: "ongoing" | "completed";
  beneficiaries: string;
  startDate: string;
  description: string;
  media: MediaItem[];
  onClick: () => void;
}

/*-----------------------------------------------------------------------------------------------------
| @function ProjectCard
| @brief    Renders a single project card with image, details, and status badge
| @param    ProjectCardProps - project data to display
| @return   JSX.Element - rendered project card component
-----------------------------------------------------------------------------------------------------*/
const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  category,
  location,
  status,
  beneficiaries,
  startDate,
  description,
  media,
  onClick,
}) => {
  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief    Formats ISO date string to readable format
  | @param    dateString - ISO date string from backend
  | @return   string - formatted date (e.g., "Jan 2024")
  -----------------------------------------------------------------------------------------------------*/
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function stripHtmlTags
  | @brief    Removes HTML tags from description text for preview
  | @param    html - HTML string from text editor
  | @return   string - plain text without HTML tags
  -----------------------------------------------------------------------------------------------------*/
  const stripHtmlTags = (html: string): string => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function getMediaUrl
  | @brief    Gets the first media URL from project media array
  | @param    --
  | @return   object with url and type of media
  -----------------------------------------------------------------------------------------------------*/
  const getMediaUrl = (): { url: string; type: string } => {
    if (media && media.length > 0) {
      return {
        url: media[0].url,
        type: media[0].type,
      };
    }
    return {
      url: "https://via.placeholder.com/400x250",
      type: "image",
    };
  };

  const mediaData = getMediaUrl();
  const plainDescription = stripHtmlTags(description);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Project Media */}
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-200">
        {mediaData.type === "video" ? (
          <video
            src={mediaData.url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={mediaData.url}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === "ongoing"
                ? "bg-green-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200">
            {category}
          </span>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Description - stripped of HTML */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {plainDescription}
        </p>

        {/* Project Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-main-500" />
            <span className="font-medium">{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-main-500" />
            <span>
              <span className="font-semibold text-gray-800">
                {beneficiaries}
              </span>{" "}
              beneficiaries
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-main-500" />
            <span>
              Started:{" "}
              <span className="font-medium">{formatDate(startDate)}</span>
            </span>
          </div>
        </div>

        {/* Read More Button */}
        <button
          onClick={onClick}
          className="w-full px-4 py-2 bg-main-500 text-white rounded-lg hover:bg-main-600 transition-colors duration-200 font-medium"
        >
          Read more
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
