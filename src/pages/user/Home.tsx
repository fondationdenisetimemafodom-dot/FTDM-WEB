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
import { NavLink, useNavigate } from "react-router-dom";
import VolunteerForm from "../../components/VolunteerForm";
import PartnershipForm from "../../components/PartnershipForm";
import ProjectCard from "../../components/ProjectCard";
import axiosInstance from "../../lib/axiosInstance";
import homeImage from "../../assets/images/home-image.png";
import BgImage from "../../assets/images/home-bg.png";
import BgImageBottom from "../../assets/images/home_bottom.jpg";
import home_donate_image from "../../assets/images/home_donate.jpg";
import video from "../../assets/videos/fdtmvideo.mp4";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
  const navigate = useNavigate();
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
    navigate(`/projects/${project._id}`, { state: { project } });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCloseModal
  | @brief    Closes project details modal
  | @param    --
  | @return   --
  -----------------------------------------------------------------------------------------------------*/

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
          className=" w-full pt-27 pb-40 p-2 px-10 lg:px-25 flex flex-col lg:flex-row justify-between items-center "
          style={{
            backgroundImage: `linear-gradient(to right, #ffffffcc 30%, #dbeafe), url(${BgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div>
            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="block max-w-[500px] font-bold text-[22px] sm:text-[20px] md:text-[35px lg:text-[40px] text-main-500"
              style={{
                lineHeight: "1.9",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "1px",
              }}
            >
              TRANSFORMING LIVES THROUGH SOLIDARITY
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500 block mt-9 max-w-[567px]"
              style={{
                lineHeight: "2.1",

                fontFamily: "Arial, sans-serif",
                // letterSpacing: "0.055em",
              }}
            >
              Where compassion meets action. From Dschang to the world, we're
              building bridges of hope through education, healthcare, cultural
              enrichment, and humanitarian outreach. Transforming lives one
              community at a time.
            </motion.span>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="flex flex-col md:flex-row items-center gap-10 md:gap-24 mt-20"
            >
              <NavLink
                to="/donate"
                className="flex items-center justify-center bg-main-500 w-58 md:w-28 lg:w-50 px-4 py-2 text-white text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                Donate
              </NavLink>

              <button
                onClick={() => setShowVolunteer(true)}
                className="border-[3px] border-main-500 py-2 px-4 text-main-500 text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                Volunteer with us
              </button>
            </motion.div>
          </div>
          <motion.img
            initial={{
              opacity: 0,
              scale: 0.1,
              rotate: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 360,
            }}
            transition={{
              duration: 1.5,
              delay: 1,
              ease: "easeOut",
            }}
            src={homeImage}
            className="w-[400px] h-[319px] mt-20 lg:mt-0 lg:w-[574px] lg:h-[496px]"
          />
        </div>
        {/* About us section */}
        <div className="w-full p-10 lg:p-25 flex flex-col md:flex-row justify-between items-center">
          {/* Video */}
          <div className="w-full max-w-[440px] md:max-w-[500px] h-[250px] md:h-[600px] rounded-xl overflow-hidden mb-8 md:mb-0 md:mr-12 shadow-lg flex items-center justify-center">
            <video
              className="w-full h-[100%] object-cover rounded-xl"
              autoPlay
              loop
              muted
              playsInline
              ref={(video) => {
                if (video) {
                  video.play().catch((error) => {
                    console.log("Autoplay prevented:", error);
                  });

                  const observer = new IntersectionObserver(
                    (entries) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                          video.play().catch((error) => {
                            console.log("Play prevented:", error);
                          });
                        } else {
                          video.pause();
                        }
                      });
                    },
                    { threshold: 0.5 }
                  );
                  observer.observe(video);
                }
              }}
            >
              <source src={video} type="video/mp4" />
              <source src="/path-to-video.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex flex-col items-start justify-center gap-8">
            <div className="flex flex-row items-start gap-5">
              <div className="mt-2 bg-soft-dark-500 h-2 w-20"></div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="uppercase lg:text-[15px] md:text-2xl font-bold text-soft-dark-500"
              >
                Know about us
              </motion.p>
            </div>
            <div className="flex flex-col gap-2 max-w-[682px]">
              <motion.span
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.5, delay: 0.4 }}
                className="block max-w-[500px] font-bold text-[22px] sm:text-[20px] md:text-[35px] lg:text-[30px] text-main-700"
                style={{
                  lineHeight: "1.4",
                  fontFamily: "Arial, sans-serif",
                  letterSpacing: "1px",
                }}
              >
                Weaving Health, Progress, and Heritage Into the Fabric of
                Tomorrow
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500 block max-w-[567px]"
                style={{
                  lineHeight: "2.1",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                In every community we serve, from the vibrant streets of Dschang
                to villages across Cameroon and beyond, we see untapped
                potential waiting to flourish. Our mission transcends borders
                and barriers. We don't just build clinics and schools; we
                cultivate ecosystems where health thrives, where education opens
                doors once thought permanently closed, and where cultural
                traditions become sources of pride and economic opportunity.
              </motion.span>
              {/* <motion.span
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500 block max-w-[567px] mt-8"
                style={{
                  lineHeight: "2.1",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                Every initiative we launch is rooted in the belief that
                sustainable development begins with people, their stories, their
                strengths, their dreams. By honoring cultural wisdom while
                embracing innovation, by treating health as a fundamental right
                rather than a privilege, and by investing in education that
                transforms generations, we're not simply creating projects.
                We're nurturing movements of change that ripple outward,
                touching countless lives and reshaping what's possible for
                entire communities.
              </motion.span> */}
              <NavLink
                to="/about-us"
                className="flex items-center justify-center bg-main-500  py-2 w-50 text-white text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                <a href="">Learn more</a>
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
        {/* Support Our Work Section */}
        <div className="w-full bg-white p-4  flex justify-center">
          <div className="p-10 md-p25 flex flex-col md:flex-row items-center gap-6">
            {/* Header moved into left column (small label + big title) */}

            {/* Two-column layout: text (left) and image (right) - mobile stacks with button last */}
            <div className="w-full flex flex-col md:grid md:grid-cols-2 items-start md:items-center gap-6">
              {/* Left: text content (md: row 1 col 1) */}
              <div className="w-full md:col-start-1 md:row-start-1 flex flex-col items-start gap-6">
                {/* small header above the big title (like Know about us) */}
                <div className="flex flex-row items-start gap-5">
                  <div className="mt-2 bg-soft-dark-500 h-2 w-20"></div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="uppercase lg:text-[15px] md:text-2xl font-bold text-soft-dark-500"
                  >
                    Donate
                  </motion.p>
                </div>

                {/* Big title: Support our work (match 'Weaving Health' sizes) */}
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="block max-w-[500px] font-bold text-[22px] sm:text-[20px] md:text-[35px] lg:text-[30px] text-main-700"
                  style={{
                    lineHeight: "1.4",
                    fontFamily: "Arial, sans-serif",
                    letterSpacing: "1px",
                  }}
                >
                  Support our work - Your gifts- Births dreams
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col gap-4"
                >
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Your support fuels real change in communities that need it
                    most. Every gift helps provide healthcare, education, and
                    essential resources.
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    With your generosity, we build schools, clinics, and safe
                    spaces. You empower families to dream bigger and achieve
                    more.
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Together, we turn hope into action and ideas into reality.
                    Your contribution breathes life into projects that transform
                    lives.
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    From newborns to elders, your kindness creates lasting
                    impact. Join us because every gift births a brighter
                    tomorrow.
                  </p>
                </motion.div>

                {/* button moved down so on mobile it appears after image (last) */}
              </div>

              {/* Right: image (md: row 1 col 2) */}
              <div className="w-full md:col-start-2 md:row-start-1 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="w-full flex justify-center"
                >
                  <img
                    src={home_donate_image}
                    alt="Children being supported by the foundation"
                    className="w-full max-w-[440px] md:max-w-[500px] h-[250px] md:h-[600px] rounded-lg shadow-lg object-cover"
                  />
                </motion.div>
              </div>

              {/* Donate button: placed after image in DOM so mobile shows it last; on md placed under left column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="w-full md:col-start-1 md:row-start-2 flex justify-center md:justify-start"
              >
                <NavLink
                  to="/donate"
                  className="flex items-center justify-center bg-main-500 px-4 py-2 text-white text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
                >
                  Donate today
                </NavLink>
              </motion.div>
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
      <div
        className="bg-secondary-500 text-white py-16 md:py-20 lg:py-30 px-6 md:px-12 lg:px-30 mt-auto border-b-4 border-b-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url(${BgImageBottom})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
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
            className="bg-white hover:vibrate text-main-500 py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {t("joinUs.buttons.donate")}
          </NavLink>
          <button
            onClick={() => setShowVolunteer(true)}
            className="bg-main-500 hover:vibrate text-white hover:cursor-pointer py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors"
          >
            {t("joinUs.buttons.volunteer")}
          </button>
          <button
            onClick={() => setShowPartnership(true)}
            className="bg-main-500 hover:vibrate hover:cursor-pointer text-white py-4 px-6 w-full md:w-auto md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors"
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
    </div>
  );
}

export default Home;
