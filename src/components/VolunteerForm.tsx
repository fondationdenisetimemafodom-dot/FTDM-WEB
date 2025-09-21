/*-----------------------------------------------------------------------------------------------------
 | @component VolunteerForm
 | @brief    Form component for volunteers to submit their details (with i18n support)
 | @param    --
 | @return   Volunteer form JSX element
 -----------------------------------------------------------------------------------------------------*/

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

function VolunteerForm() {
  const { t } = useTranslation();

  return (
    <form className="space-y-4 w-full lg:w-[800px] mx-auto  p-6 rounded-lg ">
      <h2 className="text-[30px] text-secondary-500 font-bold text-center">
        {t("volunteerForm.title")}
      </h2>
      <p className="text-center text-sm text-gray-600">
        {t("volunteerForm.description")}
      </p>

      {/* First Name */}
      <input
        type="text"
        placeholder={t("volunteerForm.firstName")}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Last Name */}
      <input
        type="text"
        placeholder={t("volunteerForm.lastName")}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Email */}
      <input
        type="email"
        placeholder={t("volunteerForm.email")}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Whatsapp Number */}
      <input
        type="text"
        placeholder={t("volunteerForm.whatsapp")}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Reason for Volunteering */}
      <textarea
        placeholder={t("volunteerForm.reason")}
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        rows={3}
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        {t("volunteerForm.submit")}
      </button>
    </form>
  );
}

export default VolunteerForm;
