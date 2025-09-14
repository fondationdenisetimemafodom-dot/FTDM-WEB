"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Contact
 | @brief    Contact page with i18n translation, contact details, social links, and message form
 | @param    --
 | @return   Contact JSX element
 -----------------------------------------------------------------------------------------------------*/

import React from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

function ContactUs() {
  const { t } = useTranslation("contact"); // Load "contact.json" namespace

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype ContactSection
       | @brief    Displays main contact details, description, and office addresses
       | @param    --
       | @return   --
       -----------------------------------------------------------------------------------------------------*/}
      <section>
        <div className="flex flex-col gap-12 items-center">
          <div className="flex items-start justify-center bg-[#F3F5F8] w-full py-20 px-25 gap-28 ">
            <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>

            <div>
              <p className="uppercase text-2xl font-bold text-soft-dark-500">
                {t("title")}
              </p>
              <div className="flex flex-col gap-2 max-w-[480px]">
                <h2 className="text-[56px] font-bold text-main-500 mt-2">
                  {t("headline")}
                </h2>
                <p className="text-secondary-text-500 text-3xl">
                  {t("description")}
                </p>
              </div>
            </div>

            <div className="space-y-12 text-gray-700">
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("letsTalk")}
                </h3>
                <div className="flex space-x-10">
                  <span className="text-gray-500">{t("phone")}</span>
                  <span className="text-gray-500">{t("email")}</span>
                </div>
                <hr className="mt-3 text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("headOffice")}
                </h3>
                <p className="text-gray-500">{t("headOfficeAddress1")}</p>
                <p className="text-gray-500">{t("headOfficeAddress2")}</p>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  {t("branchOffice")}
                </h3>
                <p className="text-gray-500">{t("branchOfficeAddress1")}</p>
                <p className="text-gray-500">{t("branchOfficeAddress2")}</p>
              </div>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>

          {/*-----------------------------------------------------------------------------------------------------
           | @blocktype MessageForm
           | @brief    Contact form for sending a message
           | @param    --
           | @return   --
           -----------------------------------------------------------------------------------------------------*/}
          <div className="bg-white rounded-xl p-8">
            <h3 className="text-[40px] text-soft-dark-500 font-bold mb-6 text-center">
              {t("formHeadline")}
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <input
                  type="text"
                  placeholder={t("form.firstName")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
                <input
                  type="text"
                  placeholder={t("form.lastName")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <input
                  type="email"
                  placeholder={t("form.email")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
                <input
                  type="text"
                  placeholder={t("form.subject")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
              </div>
              <textarea
                placeholder={t("form.message")}
                rows={5}
                className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-main-500 text-white py-3 rounded-lg font-semibold hover:bg-secondary-600 transition"
              >
                {t("form.send")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
