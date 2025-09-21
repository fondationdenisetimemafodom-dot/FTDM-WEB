"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component CreateProjectSuccessPopUp
 | @brief    Popup modal to thank users after making a donation (with i18n support)
 | @param    show (boolean) - controls visibility
 | @param    onClose (function) - closes the popup
 | @return   JSX modal element
 -----------------------------------------------------------------------------------------------------*/

import React from "react";
import { FaCheckCircle } from "react-icons/fa";

interface ThankYouPopupProps {
  show: boolean;
  onClose: () => void;
}

const CreateProjectSuccessPopUp: React.FC<ThankYouPopupProps> = ({
  show,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[120]">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full mx-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-green-500 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Project Created Successfully!
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Your project has been published and is now live. Thank you for making
          a difference!
        </p>
        <button
          onClick={onClose}
          className="bg-cyan-500 w-full text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CreateProjectSuccessPopUp;
