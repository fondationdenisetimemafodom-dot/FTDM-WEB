import React from "react";
import { MapPin, Users, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("projects");

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
  | @function sanitizeHtml
  | @brief    Sanitizes HTML content to only allow safe formatting tags
  | @param    html - HTML string from text editor
  | @return   string - sanitized HTML with only safe tags
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
  const sanitizedDescription = sanitizeHtml(description);

  return (
    <div className="w-[90vw] p-10 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row justify-between md:h-[75vh] h-[90vh]">
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {title}
        </h3>

        <div
          className="text-gray-600 text-sm mb-4 flex-grow overflow-hidden relative"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            maxHeight: "9rem",
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            className="prose prose-sm max-w-none [&>p]:mb-2 [&>strong]:font-bold [&>em]:italic [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
          />
        </div>

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
              {t("projects-card.beneficiaries")}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-main-500" />
            <span>
              {t("projects-card.started")}{" "}
              <span className="font-medium">{formatDate(startDate)}</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClick}
          className="w-full px-4 py-2 bg-main-500 text-white rounded-lg hover:bg-main-600 transition-colors duration-200 font-medium"
        >
          {t("projects-card.readMore")}
        </button>
      </div>

      <div className="flex-1 relative rounded-3xl overflow-hidden bg-gray-200">
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

        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === "ongoing"
                ? "bg-gray-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {status === "ongoing"
              ? t("projects-card.ongoing")
              : t("projects-card.completed")}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200">
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
