/*-----------------------------------------------------------------------------------------------------
 | @component ErrorPopup
 | @brief    Modal popup component to display error messages during donation processing
 | @param    show - Boolean to control popup visibility
 | @param    message - Error message to display
 | @param    onClose - Function to handle popup close action
 | @return   Error popup JSX element
 -----------------------------------------------------------------------------------------------------*/

"use client";

interface ErrorPopupProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

function ErrorPopup({ show, message, onClose }: ErrorPopupProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Donation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {message ||
              "An error occurred while processing your donation. Please try again."}
          </p>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPopup;
