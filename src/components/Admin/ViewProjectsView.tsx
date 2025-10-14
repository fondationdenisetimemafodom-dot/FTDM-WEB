"use client";
/*-----------------------------------------------------------------------------------------------------
| @component ViewProjectsView
| @brief    Enhanced component for viewing NGO projects with search, project details modal, and CRUD operations
| @param    --
| @return   JSX element displaying projects table with search and modal functionality
-----------------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiEdit,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import axiosInstance from "../../lib/axiosInstance";
import { useNavigate } from "react-router";

type MediaItem = {
  publicId: string;
  type: string;
  url: string;
  _id: string;
};

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
  media: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

/*-----------------------------------------------------------------------------------------------------
| @interface DeleteConfirmationModalProps
| @brief    Props for delete confirmation modal
| @param    isOpen - modal visibility state
| @param    onClose - close modal function
| @param    onConfirm - confirm deletion function
| @param    projectTitle - title of project being deleted
| @param    loading - deletion loading state
-----------------------------------------------------------------------------------------------------*/
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
  loading: boolean;
}

/*-----------------------------------------------------------------------------------------------------
| @interface ProjectDetailModalProps
| @brief    Props for project detail modal
| @param    isOpen - modal visibility state
| @param    onClose - close modal function
| @param    project - project data to display
-----------------------------------------------------------------------------------------------------*/
interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

/*-----------------------------------------------------------------------------------------------------
| @component DeleteConfirmationModal
| @brief    Modal component for confirming project deletion
| @param    props - modal properties including state and handlers
| @return   JSX modal element for delete confirmation
-----------------------------------------------------------------------------------------------------*/
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectTitle,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <FiAlertCircle className="text-red-500 text-xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Delete Project
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>"{projectTitle}"</strong>?
          This action cannot be undone.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/*-----------------------------------------------------------------------------------------------------
| @component ProjectDetailModal
| @brief    Modal component for displaying project details with media carousel
| @param    props - modal properties including project data
| @return   JSX modal element showing project details
-----------------------------------------------------------------------------------------------------*/
const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  /*-----------------------------------------------------------------------------------------------------
  | @function navigateMedia
  | @brief    Navigates through project media items in carousel
  | @param    direction - navigation direction ('prev' or 'next')
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const navigateMedia = (direction: "prev" | "next") => {
    if (!project?.media || project.media.length === 0) return;

    if (direction === "prev") {
      setCurrentMediaIndex((prev) =>
        prev === 0 ? project.media.length - 1 : prev - 1
      );
    } else {
      setCurrentMediaIndex((prev) =>
        prev === project.media.length - 1 ? 0 : prev + 1
      );
    }
  };

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
      month: "long",
      day: "numeric",
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function getStatusColor
  | @brief    Returns appropriate CSS class for project status badge
  | @param    status - project status
  | @return   CSS class string
  -----------------------------------------------------------------------------------------------------*/
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // Reset media index when project changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [project]);

  if (!isOpen || !project) return null;

  const currentMedia = project.media?.[currentMediaIndex];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {project.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Media Section */}
            <div className="space-y-4">
              {project.media && project.media.length > 0 ? (
                <>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-80">
                    {currentMedia.type === "image" ? (
                      <img
                        src={currentMedia.url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={currentMedia.url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* Media Navigation */}
                    {project.media.length > 1 && (
                      <>
                        <button
                          onClick={() => navigateMedia("prev")}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateMedia("next")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {currentMediaIndex + 1} / {project.media.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Media Thumbnails */}
                  {project.media.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {project.media.map((media, index) => (
                        <button
                          key={media._id}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                            index === currentMediaIndex
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No media available</p>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status === "ongoing" ? "Ongoing" : "Completed"}
                </span>
                <span className="text-sm text-gray-500">
                  Created {formatDate(project.createdAt)}
                </span>
              </div>

              {/* Project Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FiMapPin className="w-5 h-5 text-gray-400" />
                  <span>{project.location}</span>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <FiCalendar className="w-5 h-5 text-gray-400" />
                  <span>Started {formatDate(project.startDate)}</span>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <FiUsers className="w-5 h-5 text-gray-400" />
                  <span>{project.beneficiaries} beneficiaries</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Category
                </h3>
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {project.category}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <div
                  className="text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {/* Last Updated */}
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Last updated {formatDate(project.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewProjectsView = () => {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: "",
    projectTitle: "",
    loading: false,
  });
  const navigate = useNavigate();

  /*-----------------------------------------------------------------------------------------------------
  | @function getStatusColor
  | @brief    Returns appropriate CSS class for project status badge
  | @param    status - project status
  | @return   CSS class string
  -----------------------------------------------------------------------------------------------------*/
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-gray-400";
      case "completed":
        return "bg-green-500";
      case "upcoming":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

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
  | @function getThumbnailUrl
  | @brief    Returns first media file URL or placeholder
  | @param    media - array of media items
  | @return   image URL string
  -----------------------------------------------------------------------------------------------------*/
  const getThumbnailUrl = (media: MediaItem[]) => {
    if (media && media.length > 0) {
      const first = media[0];
      if (first.type === "video") {
        return "https://img.icons8.com/ios-filled/50/000000/video.png";
      }
      return first.url;
    }
    return "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=40&h=40&fit=crop";
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleSearch
  | @brief    Filters projects based on search query in title
  | @param    query - search term
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) =>
        project.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchProjects
  | @brief    Fetches all projects from backend API using axios instance
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/projects");
      const projectsData = response.data.projects || response.data;
      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleViewProject
  | @brief    Opens project detail modal with selected project data
  | @param    project - project to view in detail
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDeleteProject
  | @brief    Opens delete confirmation modal for specified project
  | @param    projectId - ID of project to delete
  | @param    projectTitle - title for confirmation modal
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectTitle,
      loading: false,
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function confirmDeleteProject
  | @brief    Executes project deletion using axios instance
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const confirmDeleteProject = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      await axiosInstance.delete(`/api/projects/${deleteModal.projectId}`);

      // Remove project from local state
      const updatedProjects = projects.filter(
        (project) => project._id !== deleteModal.projectId
      );
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);

      // Close modal
      setDeleteModal({
        isOpen: false,
        projectId: "",
        projectTitle: "",
        loading: false,
      });
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete project. Please try again."
      );
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
        projectId: "",
        projectTitle: "",
        loading: false,
      });
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleUpdateProject
  | @brief    Navigates to create project page with project data for editing
  | @param    projectId - ID of project to update
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleUpdateProject = (projectId: string) => {
    navigate(`/admin/projects/edit/${projectId}`);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function retryFetch
  | @brief    Retries fetching projects after error
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const retryFetch = () => {
    fetchProjects();
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <div className="mx-8 mb-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              All Projects
            </h1>
            {filteredProjects.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredProjects.length} project
                {filteredProjects.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={retryFetch}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors disabled:opacity-50"
              title="Refresh projects"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects by title..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={retryFetch}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Projects Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    PROJECT
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    CAUSE
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    LOCATION
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    STATUS
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    BENEFICIARIES
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    LAST UPDATE
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    ACTION
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                    DELETE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FiLoader className="animate-spin text-cyan-500 text-2xl" />
                        <p className="text-gray-500">Loading projects...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiAlertCircle className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No projects found matching "${searchQuery}"`
                            : "No projects found"}
                        </p>
                        {!searchQuery && (
                          <p className="text-sm text-gray-400">
                            Create your first project to get started
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getThumbnailUrl(project.media)}
                            alt={project.title}
                            className="w-10 h-10 rounded-[6px] cursor-pointer object-cover hover:opacity-80 transition-opacity"
                            onClick={() => handleViewProject(project)}
                          />
                          <div>
                            <span className="font-medium text-gray-900 text-sm block">
                              {project.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              Created {formatDate(project.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {project.category}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {project.location}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status === "ongoing"
                            ? "Ongoing"
                            : "Completed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm flex justify-center text-gray-700">
                        {project.beneficiaries}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="py-5 px-4 flex items-center justify-between">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="text-cyan-500 cursor-pointer underline hover:text-cyan-600 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUpdateProject(project._id)}
                          className="text-cyan-500 cursor-pointer hover:text-cyan-600 transition-colors"
                          title="Edit project"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-3 px-4 ">
                        <button
                          onClick={() =>
                            handleDeleteProject(project._id, project.title)
                          }
                          className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                          title="Delete project"
                        >
                          <FiTrash2 className="w-4 h-4" />
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

      {/* Project Detail Modal */}
      <ProjectDetailModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        project={selectedProject}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteProject}
        projectTitle={deleteModal.projectTitle}
        loading={deleteModal.loading}
      />
    </>
  );
};

export default ViewProjectsView;
