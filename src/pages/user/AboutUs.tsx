/*-----------------------------------------------------------------------------------------------------
| @file AboutUs.tsx
| @brief About Us page with dynamic contributor/partner fetching and display
| @param --
| @return About Us page JSX with mission, vision, and supporters sections
-----------------------------------------------------------------------------------------------------*/

import { useState, useEffect } from "react";
import axios from "axios";
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

      {/* Hero section */}
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
            Building Bridges of Hope Across Communities
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-lg md:text-xl lg:text-3xl font-regular text-white text-center"
          >
            Born from a vision of boundless human solidarity, Fondation Denise
            Time Mafodom transforms lives through compassionate action. From the
            vibrant heart of Dschang, Cameroon, we weave together philanthropic
            dreams, educational opportunities, cultural celebrations, scientific
            innovation, and humanitarian missions creating ripples of positive
            change that touch communities near and far. Every project we
            undertake, every hand we extend, carries the promise of a brighter
            tomorrow built on dignity, knowledge, and shared humanity.
          </motion.span>
        </div>
      </div>

      {/* Mission section */}
      <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-[#F3F5F8]">
        <motion.span
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[40px] font-bold self-center"
        >
          Our Mission And Vision
        </motion.span>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-30 mt-10">
          {/* Mission */}
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
                OUR MISSION
              </p>
            </div>
            <div className="max-w-[496px]">
              <p className="text-lg md:text-3xl font-bold text-secondary-text-500">
                Igniting hope, empowering lives, transforming communities
                through shared humanity
              </p>
              <p className="text-[16px] md:text-[20px] font-bold text-gray-400 mt-8">
                To champion human solidarity by creating pathways to opportunity
                through transformative education, vibrant cultural exchange,
                compassionate humanitarian aid, groundbreaking scientific
                collaboration, and sustainable social development. We believe
                that when communities are equipped with knowledge, resources,
                and unwavering support, they don't just survive , they flourish,
                innovate, and inspire generations to come.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
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
                OUR VISION
              </p>
            </div>
            <div className="max-w-[496px]">
              <p className="text-lg md:text-3xl font-bold text-secondary-text-500">
                A world united by compassion, where every community thrives with
                dignity and purpose
              </p>
              <p className="text-[16px] md:text-[20px] font-bold text-gray-400 mt-8">
                We envision a future where compassion and solidarity transcend
                all borders geographic, cultural, and economic. A world where
                every community, regardless of circumstance, possesses the
                knowledge to grow, the resources to prosper, and the support
                network to overcome any challenge. Where children dream without
                limits, where traditions are celebrated as bridges rather than
                barriers, and where human potential knows no boundaries.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission Cards */}
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
              Education
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              Unlocking potential through knowledge and learning opportunities.
              We believe education is the cornerstone of empowerment, opening
              doors to brighter futures and breaking cycles of poverty across
              generations.
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
              Culture
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              Celebrating heritage while building bridges between communities.
              We honor cultural traditions as sources of strength and identity,
              fostering mutual understanding and respect across diverse
              backgrounds.
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
              Health Endeavours
            </span>
            <span className="text-[12px] md:text-[16px] font-bold text-white">
              Building healthier communities through accessible healthcare and
              wellness initiatives. We ensure that quality health services reach
              those who need them most, because well-being is a fundamental
              human right.
            </span>
          </motion.div>
        </div>
      </div>
      {/* Contributors section */}
      <div className="w-full p-10 lg:p-25 flex flex-col justify-between items-center bg-white">
        <div className="flex flex-col justify-between items-center mb-12">
          <span className="text-[40px] font-bold text-center mb-4">
            Our Top Supporters
          </span>
          <span className="text-center max-w-[600px] text-gray-600 text-base">
            We are deeply grateful to our top supporters whose generosity and
            commitment drive our mission forward. Together, we are building a
            brighter future for all.
          </span>
        </div>

        {/* Loading State */}
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
            <p className="text-gray-500 text-lg">Loading supporters...</p>
          </div>
        )}

        {/* Error State */}
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

        {/* Contributors Grid */}
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

        {/* Partners Grid */}
        {!loading && !error && partners.length > 0 && (
          <div className="w-full">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Our Partners
            </h3>
            <div className="flex flex-wrap items-start justify-center gap-x-12 gap-y-16">
              {partners.map((partner) => (
                <ContributorCard key={partner._id} contributor={partner} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
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
                No supporters to display at this time
              </p>
            </div>
          )}
        <span className="text-[40px] font-bold text-center my-6">
          You can become one of our Top supporters too!
        </span>
        <NavLink
          to="/donate"
          className="flex items-center hover:vibrate justify-center bg-main-500  py-3 px-5 text-white text-2xl font-semibold rounded-[12px] hover:cursor-pointer"
        >
          Donate to become
        </NavLink>
      </div>

      <Footer />
    </div>
  );
}

export default AboutUs;
