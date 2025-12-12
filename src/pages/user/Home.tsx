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
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css/bundle';
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
              className="block max-w-[500px] font-bold text-[30px] sm:text-[25px] md:text-[35px lg:text-[40px] text-main-500"
              style={{
                lineHeight: "1.9",
                // fontFamily: "inter, sans-serif",
                letterSpacing: "1px",
              }}
            >
              {t("hero.title")}
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500 block mt-9 max-w-[567px]"
              style={{
                lineHeight: "2.1",
                fontFamily: "Arial, sans-serif",
              }}
            >
              {t("hero.subtitle")}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="flex flex-col md:flex-row items-center gap-10 md:gap-24 mt-20"
            >
              <NavLink
                to="/donate"
                className="flex items-center justify-center bg-main-500 w-54 md:w-28 lg:w-50 px-4 py-2 text-white text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                {t("hero_buttons.donate")}
              </NavLink>

              {/* <button
                onClick={() => setShowVolunteer(true)}
                className="border-[3px] border-main-500 py-2 px-4 text-main-500 text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                {t("hero_buttons.volunteer")}
              </button> */}
             <NavLink
                to="/projects"
                className="border-[3px] border-main-500 py-2 px-4 text-main-500 text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                {t("hero_buttons.viewprojects")}
              </NavLink>
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

{/* trustbadges */}
<section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* ONLUS */}
          <div className="text-center card-hover p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("trust.onlusCertified")}</h3>
            <p className="text-sm text-gray-600">{t("trust.onlusSubtitle")}</p>
          </div>

          {/* Lives */}
          <div className="text-center card-hover p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("trust.lives")}</h3>
            <p className="text-sm text-gray-600">{t("trust.livesSubtitle")}</p>
          </div>

          {/* Yantou */}
          <div className="text-center card-hover p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("trust.centerYantou")}</h3>
            <p className="text-sm text-gray-600">{t("trust.centerSubtitle")}</p>
          </div>

          {/* Impact */}
          <div className="text-center card-hover p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-white">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t("trust.impact")}</h3>
            <p className="text-sm text-gray-600">{t("trust.impactSubtitle")}</p>
          </div>

        </div>
      </div>
    </section>


    <section
      id="about"
      className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-orange-50"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* TITLE + INTRO */}
        <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t("Topabout.title")}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("Topabout.paragraph")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* MISSION */}
          <div
            className="bg-white rounded-3xl p-8 shadow-xl card-hover"
            data-aos="fade-right"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Topabout.missionTitle")}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {t("Topabout.missionText")}
            </p>

            <div className="mt-6 space-y-3">
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.missionPoints.p1")}</p>
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.missionPoints.p2")}</p>
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.missionPoints.p3")}</p>
            </div>
          </div>

          {/* VISION */}
          <div
            className="bg-white rounded-3xl p-8 shadow-xl card-hover"
            data-aos="fade-left"
          >
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-7 h-7 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Topabout.visionTitle")}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {t("Topabout.visionText")}
            </p>

            <div className="mt-6 space-y-3">
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.visionPoints.p1")}</p>
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.visionPoints.p2")}</p>
              <p className="text-gray-700 leading-relaxed">• {t("Topabout.visionPoints.p3")}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
        {/* About us section */}
        <div className="w-full p-10 lg:p-25 flex flex-col md:flex-row justify-between items-center">
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
                {t("about.label")}
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
                {t("about.title")}
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
                {t("about.description")}
              </motion.span>
              <NavLink
                to="/about-us"
                className="flex items-center justify-center bg-main-500  py-2 w-50 text-white text-xl font-semibold rounded-[12px] hover:cursor-pointer hover:vibrate"
              >
                <a href="">{t("about.link")}</a>
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

        <section id="mission" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t("coreValues.title")}
            </h2>
            <p className="text-lg text-gray-700">{t("coreValues.description")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Impact Direct */}
            <div
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 card-hover"
              data-aos="fade-up"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("impactDirect.title")}</h3>
              <p className="text-gray-700 leading-relaxed">{t("impactDirect.text")}</p>
            </div>

            {/* Transparency */}
            <div
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 card-hover"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("transparency.title")}</h3>
              <p className="text-gray-700 leading-relaxed">{t("transparency.text")}</p>
            </div>

            {/* Sustainability */}
            <div
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 card-hover"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("sustainability.title")}</h3>
              <p className="text-gray-700 leading-relaxed">{t("sustainability.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t("focusAreas.title")}
            </h2>
            <p className="text-lg text-gray-700">{t("focusAreas.description")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Health */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg card-hover border-t-4 border-blue-600"
              data-aos="fade-up"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("health.title")}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{t("health.text")}</p>
            </div>

            {/* Education */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg card-hover border-t-4 border-green-600"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("education.title")}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{t("education.text")}</p>
            </div>

            {/* Culture */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg card-hover border-t-4 border-purple-600"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("culture.title")}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{t("culture.text")}</p>
            </div>

            {/* Humanitarian Aid */}
            <div
              className="bg-white rounded-2xl p-8 shadow-lg card-hover border-t-4 border-orange-600"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-orange-600"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("humanitarianAid.title")}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{t("humanitarianAid.text")}</p>
            </div>
          </div>
        </div>
      </section>

        {/* Support Our Work Section */}
        <div className="w-full bg-white p-4  flex justify-center">
          <div className="p-10 md-p25 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full flex flex-col md:grid md:grid-cols-2 items-start md:items-center gap-6">
              <div className="w-full md:col-start-1 md:row-start-1 flex flex-col items-start gap-6">
                <div className="flex flex-row items-start gap-5">
                  <div className="mt-2 bg-soft-dark-500 h-2 w-20"></div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="uppercase lg:text-[15px] md:text-2xl font-bold text-soft-dark-500"
                  >
                    {t("support.label")}
                  </motion.p>
                </div>

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
                  {t("support.title")}
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
                    {t("support.description1")}
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {t("support.description2")}
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {t("support.description3")}
                  </p>
                  <p
                    className="text-[14px] sm:text-[16px] md:text-[20px] font-medium text-secondary-500"
                    style={{
                      lineHeight: "2.1",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {t("support.description4")}
                  </p>
                </motion.div>
              </div>

              <div className="w-full md:col-start-2 md:row-start-1 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="w-full flex justify-center"
                >
                  <img
                    src={home_donate_image || "/placeholder.svg"}
                    alt="Children being supported by the foundation"
                    className="w-full max-w-[440px] md:max-w-[500px] h-[250px] md:h-[600px] rounded-lg shadow-lg object-cover"
                  />
                </motion.div>
              </div>

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
                  {t("support.button")}
                </NavLink>
              </motion.div>
            </div>
          </div>
        </div>

        <section
      id="stories"
      className="py-20 md:py-28 bg-gradient-to-br from-orange-50 via-white to-blue-50"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t("stories.title")}
          </h2>
          <p className="text-lg text-gray-700">
            {t("stories.description")}
          </p>
        </div>

        {/* Story Card */}
        <div
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80"
              alt={t("stories.alt")}
              className="w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-blue-100"
            />

            <div className="flex-1 text-center md:text-left">
              <blockquote className="text-xl md:text-2xl font-semibold text-gray-900 italic mb-4">
                {t("stories.quote")}
              </blockquote>
              <p className="text-gray-600 font-medium">
                {t("stories.author")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

        {/*projects section*/}
        <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-[#F3F5F8]">
          <span className=" text-[30px] font-bold self-center">
            {t("projects.title")}
          </span>
          <div className="flex flex-row items-start gap-5 self-start mt-8">
            {/* <div className="mt-2 bg-soft-dark-500 h-2 w-20"></div>
            <p className="uppercase text-[16px] md:text-2xl font-bold text-soft-dark-500">
              {t("projects.label")}
            </p> */}
          </div>

          {/* Projects Display */}
          <div className="w-full mt-zz">
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
                    {t("projects.viewAll")}
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
          <span className="text-xl md:text-[20px] font-semibold block mt-4">
            {t("joinUs.subtitle")}
          </span>
        </div>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-6 md:gap-8 lg:gap-12 mt-12 text-xl md:text-2xl lg:text-[30px] max-w-6xl mx-auto font-semibold">
          <NavLink
            to="/donate"
            className="bg-white hover:vibrate text-main-500 py-4 px-6 w-[230px]  md:min-w-[200px] lg:min-w-[230px] rounded-2xl flex items-center justify-center hover:cursor-pointer hover:bg-gray-50 transition-colors text-[20px]"
          >
            {t("joinUs.buttons.donate")}
          </NavLink>
          <button
            onClick={() => setShowVolunteer(true)}
            className="bg-main-500 hover:vibrate hover:cursor-pointer text-white py-4 px-6 w-[230px] md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors text-[18px]
"
          >
            {t("joinUs.buttons.volunteer")}
          </button>
          <button
            onClick={() => setShowPartnership(true)}
            className="bg-main-500 hover:vibrate hover:cursor-pointer text-white py-4 px-6 w-[230px] md:min-w-[200px] lg:min-w-[293px] rounded-2xl flex items-center justify-center hover:bg-main-600 transition-colors text-[18px]
"
          >
            {t("joinUs.buttons.partner")}
          </button>
        </div>
      </div>
{/* Gallery Section */}
<section className="py-20 md:py-28 bg-white">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
        {t('gallery.title')}
      </h2>
      <p className="text-lg text-gray-700">
        {t('gallery.description')}
      </p>
    </div>

    <div className="relative" data-aos="fade-up" data-aos-delay="200">
      {/* Navigation Buttons */}
      <button
        className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center ml-4 hover:bg-gray-50 transition-all hover:scale-105 hidden md:flex"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center mr-4 hover:bg-gray-50 transition-all hover:scale-105 hidden md:flex"
        aria-label="Next image"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Swiper Container */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: '.gallery-pagination',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        navigation={{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        className="gallerySwiper pb-12"
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="transition-all duration-400 ease-out hover:translate-y-[-8px]">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl">
              <img
                src={t('gallery.image1Src')}
                alt={t('gallery.image1Alt')}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="transition-all duration-400 ease-out hover:translate-y-[-8px]">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl">
              <img
                src={t('gallery.image2Src')}
                alt={t('gallery.image2Alt')}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div className="transition-all duration-400 ease-out hover:translate-y-[-8px]">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl">
              <img
                src={t('gallery.image3Src')}
                alt={t('gallery.image3Alt')}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 4 */}
        <SwiperSlide>
          <div className="transition-all duration-400 ease-out hover:translate-y-[-8px]">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl">
              <img
                src={t('gallery.image4Src')}
                alt={t('gallery.image4Alt')}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Pagination Dots */}
      <div className="gallery-pagination flex justify-center mt-8 space-x-2">
        <style>{`
          .gallery-pagination .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background-color: #d1d5db;
            opacity: 0.5;
            transition: all 0.3s ease;
            display: inline-block;
            border-radius: 50%;
            cursor: pointer;
          }
          .gallery-pagination .swiper-pagination-bullet:hover {
            opacity: 0.8;
          }
          .gallery-pagination .swiper-pagination-bullet-active {
            background-color: #3b82f6;
            opacity: 1;
            transform: scale(1.2);
          }
        `}</style>
      </div>
    </div>
  </div>
</section>
     
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
