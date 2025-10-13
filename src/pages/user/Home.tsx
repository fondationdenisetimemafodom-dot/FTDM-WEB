"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Home
 | @brief    Main home page with navbar, hero section, Join Us actions, and footer with i18n support
 | @param    --
 | @return   Home JSX element
 -----------------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { NavLink } from "react-router-dom";
import VolunteerForm from "../../components/VolunteerForm";
import PartnershipForm from "../../components/PartnershipForm";
import ProjectCard from "../../components/ProjectCard";
import ProjectModal from "../../components/ProjectModal";
import axiosInstance from "../../lib/axiosInstance";
import homeImage from "../../assets/images/home-image.png";
import BgImage from "../../assets/images/home-bg.png";
import { Loader2 } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg lg:max-w-[900px] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
        >
          ✕
        </button>

        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
};

function Home() {
  const { t } = useTranslation("home");
  const [showVolunteer, setShowVolunteer] = useState(false);
  const [showPartnership, setShowPartnership] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchProjects
  | @brief    Fetches first 3 projects from backend API for home page display
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await axiosInstance.get("/api/projects");
      const projectsData = response.data.projects || response.data;

      // Get only first 3 projects for home page
      setProjects(projectsData.slice(0, 3));
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
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
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      <div className=" w-full ">
        {/*hero section*/}
        <div
          className=" w-full  p-10 lg:p-25 flex flex-col lg:flex-row justify-between items-center "
          style={{
            backgroundImage: `linear-gradient(to right, #ffffffcc 30%, #dbeafe), url(${BgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div>
            <span className=" block max-w-[500px] font-bold text-[40px] md:text-[60px] text-main-500 ">
              Together for Human Solidarity
            </span>
            <span className=" text-[20px] md:text-[30px] font-medium  text-secondary-500 block mt-6 max-w-[567px]">
              Fondation Denise Time Mafodom is committed to philanthropic,
              educational, cultural, scientific, and social initiatives that
              empower communities.
            </span>
            <div className="flex items-center gap-10 md:gap-24 mt-12 ">
              <NavLink
                to="/donate"
                className="flex items-center justify-center bg-main-500 w-28 lg:w-50 py-2 text-white text-2xl font-semibold rounded-[12px] hover:cursor-pointer"
              >
                Donate
              </NavLink>
              <button
                onClick={() => setShowVolunteer(true)}
                className="border-[3px] border-main-500  py-2 px-4 text-main-500 text-2xl font-semibold rounded-[12px] hover:cursor-pointer"
              >
                Volunteer with us
              </button>
            </div>
          </div>
          <img
            src={homeImage}
            className="w-[400px] h-[319px] mt-20 lg:mt-0 lg:w-[574px] lg:h-[496px]"
          />
        </div>
        {/* About us section */}
        <div className="w-full p-10 lg:p-25 flex flex-col md:flex-row justify-between items-center">
          {/* Video placeholder with proper styling */}
          <div className="w-full max-w-[350px] md:max-w-[400px] h-[250px] md:h-[300px] rounded-xl bg-gray-200 mb-8 md:mb-0 md:mr-12 flex items-center justify-center">
            <span className="text-gray-500 text-lg font-medium">
              Video Coming Soon
            </span>
          </div>

          <div className="flex flex-col items-start justify-center gap-8">
            <div className="flex flex-row items-start gap-5">
              <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>
              <p className="uppercase text-lg md:text-2xl font-bold text-soft-dark-500">
                Know about us
              </p>
            </div>
            <div className="flex flex-col gap-2 max-w-[682px]">
              <h2 className="text-[28px] md:text-[48px] font-bold mt-2">
                We promote health, developement and culture, for a better
                tomorrow
              </h2>
              <p className="text-secondary-text-500 text-base md:text-2xl">
                Every step forward is built on resilience, knowledge, and the
                richness of shared culture
              </p>
              <p className="text-secondary-text-500 text-base md:text-2xl mt-4">
                By fostering well-being, encouraging growth, and strengthening
                community ties, we create meaningful impact.
              </p>
              <NavLink
                to="/about-us"
                className="bg-main-500 text-lg md:text-2xl font-semibold mt-4 text-white hover:cursor-pointer py-4 px-6 max-w-[70%] md:max-w-[40%] rounded-2xl flex items-center justify-center gap-2"
              >
                Learn more
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 md:w-8 md:h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 8l4 4-4 4"
                    />
                  </svg>
                </span>
              </NavLink>
            </div>
          </div>
        </div>
        {/*projects section*/}
        <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-[#F3F5F8]">
          <span className=" text-[40px] font-bold self-center">
            Projects We Have Done
          </span>
          <div className="flex flex-row items-start gap-5 self-start mt-8">
            <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>
            <p className="uppercase text-lg md:text-2xl font-bold text-soft-dark-500">
              VIEW OUR PROJECTS
            </p>
          </div>

          {/* Projects Display */}
          <div className="w-full mt-12">
            {loadingProjects ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-main-500 mb-4" />
                <p className="text-gray-600 text-lg">Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      {...project}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <NavLink
                    to="/projects"
                    className="bg-main-500 text-xl md:text-2xl font-semibold text-white hover:bg-main-600 transition-colors py-4 px-8 rounded-xl flex items-center justify-center gap-2"
                  >
                    View All Projects
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </NavLink>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-600 text-lg text-center">
                  No projects available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Us section */}
      <div className="bg-secondary-500 text-white py-16 md:py-20 lg:py-30 px-6 md:px-12 lg:px-30 mt-auto border-b-4 border-b-white">
        <div className="text-center ">
          <span className="text-3xl md:text-[40px] font-bold">
            {t("joinUs.title")}
          </span>
          <span className="text-xl md:text-[30px] font-semibold block mt-4">
            {t("joinUs.subtitle")}
          </span>
        </div>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-8 lg:gap-12 mt-12 text-xl md:text-2xl lg:text-[30px] max-w-6xl mx-auto font-semibold">
          <NavLink
            to="/donate"
            className="bg-white text-main-500 py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {t("joinUs.buttons.donate")}
          </NavLink>
          <button
            onClick={() => setShowVolunteer(true)}
            className="bg-main-500 text-white hover:cursor-pointer py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors"
          >
            {t("joinUs.buttons.volunteer")}
          </button>
          <button
            onClick={() => setShowPartnership(true)}
            className="bg-main-500 hover:cursor-pointer text-white py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors"
          >
            {t("joinUs.buttons.partner")}
          </button>
        </div>
      </div>

      <Footer />

      {/* Volunteer Modal */}
      {showVolunteer && (
        <Modal onClose={() => setShowVolunteer(false)}>
          <VolunteerForm />
        </Modal>
      )}

      {/* Partnership Modal */}
      {showPartnership && (
        <Modal onClose={() => setShowPartnership(false)}>
          <PartnershipForm />
        </Modal>
      )}

      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={handleCloseModal} />
    </div>
  );
}

export default Home;
