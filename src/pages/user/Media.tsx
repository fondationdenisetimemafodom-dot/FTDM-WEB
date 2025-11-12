"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Media
 | @brief    Media library page with project highlights slider and media gallery with tabs
 | @param    --
 | @return   Media JSX element
 -----------------------------------------------------------------------------------------------------*/

import type React from "react";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import mediaBackground from "../../assets/images/media-pic.png";
import { NavLink } from "react-router-dom";
import VolunteerForm from "../../components/VolunteerForm";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axiosInstance";
import { Loader2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion } from "framer-motion";

/*-----------------------------------------------------------------------------------------------------
| @interface Project
| @brief    Interface defining project structure from backend
| @param    _id - unique project identifier
| @param    title - project title/name
| @param    category - project cause/category
| @param    location - project location
| @param    status - project status (ongoing/completed)
| @param    beneficiaries - number of beneficiaries
| @param    startDate - project start date
| @param    description - project description
| @param    media - array of project media items
| @param    createdAt - project creation timestamp
| @param    updatedAt - last update timestamp
-----------------------------------------------------------------------------------------------------*/
interface Project {
  _id: string;
  title: string;
  category: string;
  location: string;
  status: "ongoing" | "completed";
  beneficiaries: string;
  startDate: string;
  description: string;
  media: { publicId: string; type: string; url: string; _id: string }[];
  createdAt: string;
  updatedAt: string;
}

/*-----------------------------------------------------------------------------------------------------
| @interface Media
| @brief    Interface defining media structure from Cloudinary API
| @param    public_id - unique media identifier from Cloudinary
| @param    url - media file URL
| @param    type - media type (image or video)
| @param    folder - Cloudinary folder path
| @param    created_at - media creation timestamp
-----------------------------------------------------------------------------------------------------*/
interface Media {
  public_id: string;
  url: string;
  type: "image" | "video";
  folder: string;
  created_at: string;
}

/*-----------------------------------------------------------------------------------------------------
 | @component Modal
 | @brief    Generic modal wrapper with blurred background and close functionality
 | @param    {children} React.ReactNode - modal content
 | @param    {onClose} () => void - callback to close modal
 | @return   Modal JSX element
 -----------------------------------------------------------------------------------------------------*/
const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg lg:max-w-[900px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl z-10"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

/*-----------------------------------------------------------------------------------------------------
 | @component MediaModal
 | @brief    Modal for displaying full-size media (image or video)
 | @param    media - media object to display
 | @param    onClose - callback to close modal
 | @return   Modal JSX element with media content
 -----------------------------------------------------------------------------------------------------*/
const MediaModal = ({
  media,
  onClose,
}: {
  media: Media | null;
  onClose: () => void;
}) => {
  if (!media) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Media Preview
        </h2>
        {media.type === "image" ? (
          <img
            src={media.url || "/placeholder.svg"}
            alt="Media preview"
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        ) : (
          <video
            src={media.url}
            controls
            className="w-full h-auto max-h-[70vh] rounded-lg"
          />
        )}
        <p className="text-sm text-gray-500 mt-4">
          Uploaded: {new Date(media.created_at).toLocaleDateString()}
        </p>
      </div>
    </Modal>
  );
};

function Media() {
  const [showVolunteer, setShowVolunteer] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">(
    "all"
  );
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [displayCount, setDisplayCount] = useState(9);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await axiosInstance.get("/api/projects");
      const projectsData = response.data.projects || response.data;
      setProjects(projectsData.slice(0, 3));
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoadingMedia(true);
      const response = await axiosInstance.get("/api/media");
      setMediaItems(response.data);
    } catch (err: any) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const getFilteredMedia = () => {
    if (activeTab === "all") return mediaItems;
    if (activeTab === "images")
      return mediaItems.filter((m) => m.type === "image");
    if (activeTab === "videos")
      return mediaItems.filter((m) => m.type === "video");
    return mediaItems;
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleShowMore = () => {
    setDisplayCount(getFilteredMedia().length);
  };

  useEffect(() => {
    fetchProjects();
    fetchMedia();
  }, []);

  const filteredMedia = getFilteredMedia();
  const currentProject = projects[currentSlide];

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      <div
        className="flex flex-col items-center w-full"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffffcc 30%, #dbeafe)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center max-w-[1074px] gap-2 px-4 py-10">
          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-[40px] md:text-4xl lg:text-[56px] text-center font-bold  leading-tight
             text-main-500"
          >
            Featured Highlights
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-lg md:text-xl lg:text-3xl font-regular text-secondary-text-500 text-center"
          >
            Explore the moments, stories, and milestones of Fondation Denise
            Time Mafodom
          </motion.span>
        </div>

        <div className="w-full max-w-[1200px] px-4 pb-16">
          {loadingProjects ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-main-500 mb-4" />
              <p className="text-gray-600 text-lg">Loading highlights...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-8">
                <div className="relative h-[300px] lg:h-[400px] rounded-xl overflow-hidden bg-gray-100">
                  {currentProject?.media && currentProject.media.length > 0 ? (
                    currentProject.media[0].type === "image" ? (
                      <img
                        src={currentProject.media[0].url || "/placeholder.svg"}
                        alt={currentProject.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={currentProject.media[0].url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No media available
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-main-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentProject?.status === "ongoing"
                        ? "Ongoing"
                        : "Completed"}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {currentProject?.category}
                    </span>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {currentProject?.title}
                  </h3>

                  <p className="text-gray-600 text-base line-clamp-4">
                    {currentProject?.description &&
                      stripHtmlTags(currentProject.description)}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{currentProject?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span>{currentProject?.beneficiaries} beneficiaries</span>
                    </div>
                  </div>

                  <NavLink
                    to="/projects"
                    className="bg-main-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-main-600 transition-colors w-fit flex items-center gap-2"
                  >
                    Read More
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </NavLink>
                </div>
              </div>

              {projects.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>

                  <div className="flex justify-center gap-2 pb-6">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? "w-8 bg-main-500"
                            : "w-2 bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No featured projects available
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex flex-col  items-start sm:justify-between mb-8 gap-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Media Gallery ({filteredMedia.length} items)
          </h2>

          <div className="flex gap-5 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm md:text-base border-2 rounded-full transition-all duration-200  ${
                activeTab === "all"
                  ? "bg-main-500 border-main-500 text-white"
                  : "border-main-500 text-main-500 hover:bg-main-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`px-4 py-2 text-sm md:text-base border-2 rounded-full transition-all duration-200  ${
                activeTab === "images"
                  ? "bg-main-500 border-main-500 text-white"
                  : "border-main-500 text-main-500 hover:bg-main-50"
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 text-sm md:text-base border-2 rounded-full transition-all duration-200  ${
                activeTab === "videos"
                  ? "bg-main-500 border-main-500 text-white"
                  : "border-main-500 text-main-500 hover:bg-main-50"
              }`}
            >
              Videos
            </button>
          </div>
        </div>

        {loadingMedia ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-main-500 mb-4" />
            <p className="text-gray-600 text-lg">Loading media...</p>
          </div>
        ) : filteredMedia.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.slice(0, displayCount).map((media) => (
                <div
                  key={media.public_id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(media)}
                >
                  <div className="relative h-[250px] bg-gray-100">
                    {media.type === "image" ? (
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-white/90 rounded-full p-4">
                            <Play className="w-8 h-8 text-main-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(media.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedMedia(media)}
                      className="bg-main-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-main-600 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMedia.length > displayCount && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleShowMore}
                  className="bg-main-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-main-600 transition-colors"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No {activeTab === "all" ? "" : activeTab} found
            </p>
          </div>
        )}
      </div>

      <div
        className="flex flex-col items-center w-full lg:w-[70vw] mx-auto my-20 p-8 lg:p-20 rounded-3xl"
        style={{
          backgroundImage: `url(${mediaBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <span className="text-[28px] lg:text-[40px] text-center font-bold text-white">
          You can contribute to provide a place for children with special needs!
        </span>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-8 lg:gap-12 mt-12 text-xl md:text-2xl lg:text-[30px] max-w-6xl mx-auto font-semibold">
          <button
            onClick={() => setShowVolunteer(true)}
            className="bg-main-500 text-white hover:cursor-pointer py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors"
          >
            Join as a volunteer
          </button>
          <NavLink
            to="/donate"
            className="bg-white text-main-500 py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Donate
          </NavLink>
        </div>
      </div>

      <Footer />

      {showVolunteer && (
        <Modal onClose={() => setShowVolunteer(false)}>
          <VolunteerForm />
        </Modal>
      )}

      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}

export default Media;
