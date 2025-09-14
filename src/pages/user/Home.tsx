"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Home
 | @brief    Main home page with navbar, hero section, Join Us actions, and footer
 | @param    --
 | @return   Home JSX element
 -----------------------------------------------------------------------------------------------------*/

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { NavLink } from "react-router-dom";
import VolunteerForm from "../../components/VolunteerForm";
import PartnershipForm from "../../components/PartnershipForm";

/*-----------------------------------------------------------------------------------------------------
 | @component Modal
 | @brief    Generic modal wrapper with overlay and close functionality
 | @param    {children} React.ReactNode - modal content
 | @param    {onClose} () => void - callback to close modal
 | @return   Modal JSX element
 -----------------------------------------------------------------------------------------------------*/
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

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />
      <div>Home page</div>

      {/* Welcome Message */}
      <h1 className="text-3xl text-amber-400">{t("hero.title")}</h1>

      {/* Join Us section */}
      <div className="bg-secondary-500 text-white py-30 px-30 mt-auto border-b-4 border-b-white">
        <div className="text-center ">
          <span className="text-[40px] font-bold">
            Join Us in making a difference
          </span>
          <span className="text-[30px] font-semibold block mt-4">
            Every contribution, no matter how small, creates ripples of positive
            change in communities
          </span>
        </div>
        <div className="flex justify-between mt-12 text-[30px] px-27 font-semibold">
          <NavLink
            to="/donate"
            className="bg-white text-main-500 py-4 px-6 min-w-[293px] rounded-2xl flex items-center justify-center"
          >
            Donate
          </NavLink>
          <button
            onClick={() => setShowVolunteer(true)}
            className="bg-main-500 text-white py-4 px-6 min-w-[293px] rounded-2xl flex items-center justify-center"
          >
            Volunteer
          </button>
          <button
            onClick={() => setShowPartnership(true)}
            className="bg-main-500 text-white py-4 px-6 min-w-[293px] rounded-2xl flex items-center justify-center"
          >
            Partner with us
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
