import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import ProjectCard from "../../components/ProjectCard";
import axiosInstance from "../../lib/axiosInstance";
import { Loader2 } from "lucide-react";
import { NavLink } from "react-router";
import BgImage from "../../assets/images/projects.jpg";
import { motion } from "framer-motion";

type MediaItem = {
  publicId: string;
  type: string;
  url: string;
  _id: string;
};

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

function Projects() {
  const { t } = useTranslation("projects");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState(t("categories.all"));
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/api/projects");
      const projectsData = response.data.projects || response.data;

      setProjects(projectsData);
      setFilteredProjects(projectsData);
      setTotalProjects(projectsData.length);

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
      setError(err.response?.data?.message || t("states.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);

    if (category === t("categories.all")) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.category.trim().toLowerCase() ===
          category.trim().toLowerCase()
      );
      setFilteredProjects(filtered);
    }
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project._id}`, { state: { project } });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const CATEGORIES = [
    t("categories.all"),
    t("categories.healthcare"),
    t("categories.education"),
    t("categories.culture"),
    t("categories.social"),
    t("categories.humanitarian"),
  ];
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserNavbar />

      <div
        className="w-full p-10 lg:p-25 flex flex-col lg:flex-row justify-center items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url(${BgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center justify-center text-center max-w-[1074px] gap-6 md:gap-10 px-4 md:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-[25px]  md:text-4xl lg:text-[35px] text-center font-bold text-white leading-tight"
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-sm md:text-xl lg:text-xl font-regular text-white text-center font-weight 600px linespacing-0.5px"
          >
            {t("hero.subtitle")}
          </motion.p>
        </div>
      </div>

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

      <div className="flex-grow w-full py-12 bg-white md:py-16">
        <div className="w-[90%] mx-auto px-4 md:px-6 lg:px-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-main-500 mb-4" />
              <p className="text-gray-600 text-lg">{t("states.loading")}</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-600 text-center">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="mt-4 w-full px-4 py-2 bg-main-500 text-white rounded-lg hover:bg-main-600 transition"
                >
                  {t("states.tryAgain")}
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-600 text-lg text-center">
                {t("states.noProjects")}
              </p>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="flex flex-col gap-6 md:gap-8">
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

      <div className="flex flex-col items-center py-12 md:py-16 lg:py-20 gap-6 px-4 md:px-6 lg:px-8 bg-white">
        <h2 className="font-bold text-2xl md:text-4xl lg:text-[30px] text-center text-gray-800">
          {t("collective.title")}
        </h2>
        <p className="text-center text-xl md:text-2xl lg:text-xl max-w-[774px] text-secondary-text-500">
          {t("collective.subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-6 mt-6 w-full max-w-6xl">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-6xl lg:text-4xl font-extrabold text-gray-700">
              {totalProjects}+
            </span>
            <span className="text-[20px] md:text-2xl lg:text-2xl font-semibold text-secondary-text-500 text-center">
              {t("collective.stats.projects")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-6xl lg:text-4xl font-extrabold text-gray-700">
              {totalBeneficiaries.toLocaleString()}+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              {t("collective.stats.lives")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-6xl lg:text-4xl font-extrabold text-gray-700">
              3+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              {t("collective.stats.villages")}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-6xl lg:text-4xl font-extrabold text-gray-700">
              100K+
            </span>
            <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary-text-500 text-center">
              {t("collective.stats.investments")}
            </span>
          </div>
        </div>
        <NavLink
          to="/donate"
          className="flex items-center justify-center bg-main-500 px-8 py-3 md:px-10 md:py-3 text-white text-xl md:text-2xl font-semibold rounded-xl hover:bg-main-600 transition-colors duration-200 mt-4"
        >
          {t("collective.donate")}
        </NavLink>
      </div>

      <Footer />
    </div>
  );
}

export default Projects;
