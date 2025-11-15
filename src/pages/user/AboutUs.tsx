/*-----------------------------------------------------------------------------------------------------
| @file AboutUs.tsx
| @brief About Us page with dynamic contributor/partner fetching and display
| @param --
| @return About Us page JSX with mission, vision, and supporters sections
-----------------------------------------------------------------------------------------------------*/

import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import Mission1 from "../../assets/images/mission1.png";
import Mission2 from "../../assets/images/mission2.png";
import Mission3 from "../../assets/images/mission3.png";
import API_BASE_URL from "../../lib/api";
import ContributorCard from "../../components/ContributorCard";
import { NavLink } from "react-router";
import BgImage from "../../assets/images/aboutus.jpg";
import { motion } from "framer-motion";

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

interface Contributor {
  _id: string;
  name: string;
  role: string;
  type: "contributor" | "partner";
  picture: {
    url: string;
    public_id: string;
  };
  socialMedia?: SocialMediaLinks;
  createdAt: string;
  updatedAt: string;
}

function AboutUs() {
  const { t } = useTranslation("about-us");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [partners, setPartners] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchContributors
  | @brief Fetches all contributors and partners from backend API and separates them by type
  | @param --
  | @return --
  -----------------------------------------------------------------------------------------------------*/
  const fetchContributors = async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<{ contributors: Contributor[] }>(
        `${API_BASE_URL}/api/contributors-partners`,
        { timeout: 10000 }
      );

      const allData = response.data.contributors || [];

      // Separate contributors and partners
      const contributorsList = allData.filter(
        (item) => item.type === "contributor"
      );
      const partnersList = allData.filter((item) => item.type === "partner");

      setContributors(contributorsList);
      setPartners(partnersList);
    } catch (err: any) {
      console.error("Failed to fetch contributors:", err);
      setError("Failed to load supporters. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contributors on component mount
  useEffect(() => {
    fetchContributors();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      <div
        className="flex flex-col items-center justify-center w-full px-4 py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url(${BgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col items-center text-center max-w-[1074px] gap-6 md:gap-10">
          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-[40px]  md:text-4xl lg:text-[56px] text-center font-bold text-white leading-tight"
          >
            {t("hero.title")}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-lg md:text-xl lg:text-3xl font-regular text-white text-center"
          >
            {t("hero.description")}
          </motion.span>
        </div>
      </div>

      <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-[#F3F5F8]">
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[40px] font-bold self-center"
        >
          {t("missionVision.sectionTitle")}
        </motion.span>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-30 mt-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-start gap-10 self-start mt-8"
          >
            <div className="flex flex-row items-start gap-5 self-start mt-8">
              <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>
              <p className="uppercase text-lg md:text-2xl font-bold text-soft-dark-500">
                {t("missionVision.missionLabel")}
              </p>
            </div>
            <div className="max-w-[496px]">
              <p className="text-lg md:text-3xl font-bold text-secondary-text-500">
                {t("missionVision.missionTitle")}
              </p>
              <p className="text-[16px] md:text-[20px] font-bold text-gray-400 mt-8">
                {t("missionVision.missionDescription")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col items-start gap-10 self-start mt-8"
          >
            <div className="flex flex-row items-start gap-5 self-start mt-8">
              <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>
              <p className="uppercase text-lg md:text-2xl font-bold text-soft-dark-500">
                {t("missionVision.visionLabel")}
              </p>
            </div>
            <div className="max-w-[496px]">
              <p className="text-lg md:text-3xl font-bold text-secondary-text-500">
                {t("missionVision.visionTitle")}
              </p>
              <p className="text-[16px] md:text-[20px] font-bold text-gray-400 mt-8">
                {t("missionVision.visionDescription")}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-10 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="shadow-md rounded-2xl p-8 py-16 max-w-[350px] flex flex-col items-start justify-center gap-6"
            style={{
              backgroundImage: `url(${Mission2})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span className="text-[20px] md:text-2xl font-bold text-white">
              {t("missionCards.education.title")}
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              {t("missionCards.education.description")}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="shadow-md rounded-2xl p-8 py-16 max-w-[350px] flex flex-col items-start justify-center gap-6"
            style={{
              backgroundImage: `url(${Mission3})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span className="text-[20px] md:text-2xl font-bold text-white">
              {t("missionCards.culture.title")}
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              {t("missionCards.culture.description")}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="shadow-md rounded-2xl p-8 py-16 max-w-[350px] flex flex-col items-start justify-center gap-6"
            style={{
              backgroundImage: `url(${Mission1})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <span className="text-[20px] md:text-2xl font-bold text-white">
              {t("missionCards.health.title")}
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              {t("missionCards.health.description")}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-white">
        <div className="flex flex-col justify-between items-center mb-12">
          <span className="text-[40px] font-bold text-center mb-4">
            {t("supporters.title")}
          </span>
          <span className="text-center max-w-[600px] text-gray-600 text-base">
            {t("supporters.description")}
          </span>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg
              className="animate-spin h-12 w-12 text-main-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-500 text-lg">{t("supporters.loading")}</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 max-w-2xl">
            <svg
              className="w-6 h-6 text-red-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && contributors.length > 0 && (
          <div className="w-full mb-20">
            <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-16">
              {contributors.map((contributor) => (
                <ContributorCard
                  key={contributor._id}
                  contributor={contributor}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && partners.length > 0 && (
          <div className="w-full">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              {t("supporters.partnersTitle")}
            </h3>
            <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-16">
              {partners.map((partner) => (
                <ContributorCard key={partner._id} contributor={partner} />
              ))}
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          contributors.length === 0 &&
          partners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                {t("supporters.noSupporters")}
              </p>
            </div>
          )}
        <span className="text-[40px] font-bold text-center my-6">
          {t("supporters.becomeSupporter")}
        </span>
        <NavLink
          to="/donate"
          className="flex items-center hover:vibrate justify-center bg-main-500  py-3 px-5 text-white text-2xl font-semibold rounded-[12px] hover:cursor-pointer"
        >
          {t("supporters.donateButton")}
        </NavLink>
      </div>

      <Footer />
    </div>
  );
}

export default AboutUs;
