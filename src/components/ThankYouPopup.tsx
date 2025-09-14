"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component ThankYouPopup
 | @brief    Popup modal to thank users after making a donation (with i18n support)
 | @param    show (boolean) - controls visibility
 | @param    onClose (function) - closes the popup
 | @return   JSX modal element
 -----------------------------------------------------------------------------------------------------*/

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface ThankYouPopupProps {
  show: boolean;
  onClose: () => void;
}

const ThankYouPopup: React.FC<ThankYouPopupProps> = ({ show, onClose }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {t("thankYouPopup.title")}
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          {t("thankYouPopup.message")}
        </p>
        <button
          onClick={onClose}
          className="bg-main-500 w-full text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-600 transition"
        >
          {t("thankYouPopup.close")}
        </button>
      </div>
    </div>
  );
};

export default ThankYouPopup;
