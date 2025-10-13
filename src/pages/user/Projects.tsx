import React, { useState, useEffect } from "react";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import ProjectCard from "../../components/ProjectCard";
import axiosInstance from "../../lib/axiosInstance";
import { Loader2 } from "lucide-react";
import ProjectModal from "../../components/ProjectModal";
import { NavLink } from "react-router";

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
| @constant CATEGORIES
| @brief    Array of available project categories for filtering
-----------------------------------------------------------------------------------------------------*/
const CATEGORIES = [
  "All Projects",
  "Health",
  "Education",
  "Culture",
  "Social Development",
  "Humanitarian Aid",
];

function Projects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Projects");
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchProjects
  | @brief    Fetches all projects from backend API and calculates totals
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
      setTotalProjects(projectsData.length);

      // Calculate total beneficiaries across all projects
      const beneficiariesSum = projectsData.reduce(
        (sum: number, project: Project) => {
          const beneficiaryCount = parseInt(project.beneficiaries) || 0;
          return sum + beneficiaryCount;
        },
        0
      );
      setTotalBeneficiaries(beneficiariesSum);
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
  | @function handleFilterChange
  | @brief    Filters projects based on selected category
  | @param    category - selected category to filter by
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleFilterChange = (category: string) => {
    setActiveFilter(category);

    if (category === "All Projects") {
      setFilteredProjects(projects);
    } else {
      // Filter projects by category (case-insensitive comparison)
      const filtered = projects.filter(
        (project) =>
          project.category.trim().toLowerCase() ===
          category.trim().toLowerCase()
      );
      setFilteredProjects(filtered);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleProjectClick
  | @brief    Opens modal with selected project details
  | @param    project - project object to display in modal
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCloseModal
  | @brief    Closes project details modal
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserNavbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center w-full bg-white py-12 md:py-16 lg:py-20">
        <div className="flex flex-col items-center max-w-[1074px] gap-6 md:gap-10 px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-[56px] text-center font-bold text-main-500 leading-tight">
            Our Projects and work
          </h1>
          <p className="text-lg md:text-xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
            Discover the comprehensive initiatives we've undertaken to create
            lasting positive change in communities across India.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col items-center w-full py-8 md:py-10 bg-white border-t border-gray-200">
        <div className="max-w-7xl w-full px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`px-4 py-2 text-sm md:text-base border-2 rounded-full transition-all duration-200 ${
                  activeFilter === category
                    ? "bg-main-500 border-main-500 text-white"
                    : "border-main-500 text-main-500 hover:bg-main-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex-grow w-full py-12 bg-white md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-main-500 mb-4" />
              <p className="text-gray-600 text-lg">Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-600 text-center">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="mt-4 w-full px-4 py-2 bg-main-500 text-white rounded-lg hover:bg-main-600 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Projects State */}
          {!loading && !error && filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-600 text-lg text-center">
                No projects found for this category.
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  {...project}
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Collective Impact Objectives Section */}
      <div className="flex flex-col items-center py-12 md:py-16 lg:py-20 gap-6 px-4 md:px-6 lg:px-8 bg-white">
        <h2 className="font-bold text-3xl md:text-4xl lg:text-[48px] text-center text-gray-800">
          Collective impact objectives
        </h2>
        <p className="text-center text-lg md:text-2xl lg:text-3xl max-w-[774px] text-secondary-text-500">
          The Measurable difference we are going to make this year
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-6 mt-6 w-full max-w-6xl">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-green-500">
              {totalProjects}+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              Projects
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-main-500">
              {totalBeneficiaries.toLocaleString()}+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              Lives Impacted
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-red-500">
              15+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              Villages Reached
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-purple-500">
              100K+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              Investments
            </span>
          </div>
        </div>
        <NavLink
          to="/donate"
          className="flex items-center justify-center bg-main-500 px-8 py-3 md:px-10 md:py-3 text-white text-xl md:text-2xl font-semibold rounded-xl hover:bg-main-600 transition-colors duration-200 mt-4"
        >
          Donate
        </NavLink>
      </div>
      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={handleCloseModal} />

      <Footer />
    </div>
  );
}

export default Projects;
