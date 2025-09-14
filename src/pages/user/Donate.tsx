"use client";

/*-----------------------------------------------------------------------------------------------------
 | @component Donate
 | @brief    Donation page with i18n translation, form for user input, and key donation benefits
 | @param    --
 | @return   Donation page JSX element
 -----------------------------------------------------------------------------------------------------*/

import React from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaCheckCircle } from "react-icons/fa";

function Donate() {
  const { t } = useTranslation("donate");

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype Header
       | @brief    Page introduction with main call-to-action text
       | @param    --
       | @return   --
       -----------------------------------------------------------------------------------------------------*/}
      <div className="flex flex-col items-center w-screen ">
        <div className="flex flex-col items-center max-w-[1074px] gap-10 px-4 py-25">
          <span className="text-[56px] font-bold text-main-500 ">
            {t("header")}
          </span>
          <span className="text-3xl font-semibold text-secondary-text-500 text-center">
            {t("subheader")}
          </span>
        </div>

        {/*-----------------------------------------------------------------------------------------------------
         | @blocktype DonationForm
         | @brief    Donation form capturing amount, personal info, and comments
         | @param    --
         | @return   Form JSX
         -----------------------------------------------------------------------------------------------------*/}
        <div className="bg-[#F3F5F8] w-full p-25">
          <form className="max-w-[1074px] mx-auto bg-white rounded-xl p-10 space-y-6">
            <div className="flex flex-col space-y-4">
              {/* Benefits section */}
              <div className="flex justify-between w-full mb-10">
                <div className="flex gap-5 items-center">
                  <FaCheckCircle className="h-6 w-6 text-green-500 ml-2" />
                  <span className="text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.updates")}
                  </span>
                </div>
                <div className="flex gap-5 items-center">
                  <FaCheckCircle className="h-6 w-6 text-green-500 ml-2" />
                  <span className="text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.secure")}
                  </span>
                </div>
                <div className="flex gap-5 items-center">
                  <FaCheckCircle className="h-6 w-6 text-green-500 ml-2" />
                  <span className="text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.transparent")}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <label className="text-main-500 text-3xl font-bold mb-5">
                {t("amount")}
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="amount"
                  placeholder={t("amountPlaceholder")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 p-2 w-full"
                  required
                />
              </div>

              {/* Personal Info */}
              <label className="text-main-500 text-3xl font-bold mt-3 mb-5">
                {t("personalInfo")}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="first-name"
                  placeholder={t("firstName")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 p-2 w-full"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  id="last-name"
                  placeholder={t("lastName")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 p-2 w-full"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="email"
                  id="email"
                  placeholder={t("email")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 p-2 w-full"
                  required
                />
              </div>
              <div className="flex items-center">
                <textarea
                  id="comments"
                  placeholder={t("comments")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 p-2 w-full h-24"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-main-500 text-white rounded-lg p-3 font-bold hover:bg-main-600 transition duration-300"
              >
                {t("donateBtn")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Donate;
