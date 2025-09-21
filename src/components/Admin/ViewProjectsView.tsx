"use client";
/*-----------------------------------------------------------------------------------------------------
| @component ViewProjectsView
| @brief    Component for viewing all NGO projects with backend integration and CRUD operations
| @param    --
| @return   JSX element displaying projects table with actions
-----------------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiEdit,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "../../lib/api";
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
| @param    id - unique project identifier
| @param    title - project title/name
| @param    cause - project cause/category
| @param    location - project location
| @param    markAs - project status (ongoing/completed)
| @param    beneficiaries - number of beneficiaries
| @param    startDate - project start date
| @param    description - project description
| @param    mediaFiles - array of project media URLs
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
| @component DeleteConfirmationModal
| @brief    Modal component for confirming project deletion
| @param    props - modal properties
| @return   JSX modal element
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

const ViewProjectsView = () => {
  // State management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  | @function getThumbnailImage
  | @brief    Returns first media file URL or placeholder
  | @param    mediaFiles - array of media file URLs
  | @return   image URL string
  -----------------------------------------------------------------------------------------------------*/
  const getThumbnailUrl = (media: MediaItem[]) => {
    if (media && media.length > 0) {
      const first = media[0];
      if (first.type === "video") {
        return "https://img.icons8.com/ios-filled/50/000000/video.png"; // placeholder icon
      }
      return first.url;
    }

    return "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=40&h=40&fit=crop";
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchProjects
  | @brief    Fetches all projects from backend API
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminAccessToken");
      const response = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched projects:", response.data);
      setProjects(response.data.projects || response.data);
      console.log("Projects set in state:", projects);
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
  | @function handleDeleteProject
  | @brief    Handles project deletion with confirmation
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
  | @brief    Confirms and executes project deletion
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const confirmDeleteProject = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));

      const token = localStorage.getItem("adminAccessToken");
      await axios.delete(
        `${API_BASE_URL}/api/projects/${deleteModal.projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove project from local state
      setProjects((prev) =>
        prev.filter((project) => project._id !== deleteModal.projectId)
      );

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
  | @brief    Handles project update navigation (placeholder for future implementation)
  | @param    projectId - ID of project to update
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleUpdateProject = (projectId: string) => {
    // TODO: Navigate to update/edit page
    console.log("Update project:", projectId);
    // Example: router.push(`/projects/edit/${projectId}`);
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
            {projects.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
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
            <button
              onClick={() => navigate("/admin/login")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              + NEW PROJECT
            </button>
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
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiAlertCircle className="text-gray-400 text-2xl" />
                        </div>
                        <p className="text-gray-500">No projects found</p>
                        <p className="text-sm text-gray-400">
                          Create your first project to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={getThumbnailUrl(project.media)}
                            alt={project.title}
                            className="w-10 h-10 rounded-[6px] cursor-pointer object-cover"
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
                        <button className="text-main-500 cursor-pointer underline hover:text-cyan-500 transition-colors">
                          View
                        </button>
                        <button
                          onClick={() => handleUpdateProject(project._id)}
                          className="text-main-500 cursor-pointer hover:text-cyan-500 transition-colors"
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
                          className="text-red-500 hover:text-red-600 cursor-pointer  transition-colors"
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
