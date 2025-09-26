/*-----------------------------------------------------------------------------------------------------
 | @component PendingPopup
 | @brief    Modal popup component to display pending status during donation processing
 | @param    show - Boolean to control popup visibility
 | @return   Pending popup JSX element
 -----------------------------------------------------------------------------------------------------*/

"use client";

interface PendingPopupProps {
  show: boolean;
}

function PendingPopup({ show }: PendingPopupProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-main-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Processing Donation
          </h2>
          <p className="text-gray-600">
            Please approve transaction in your mobile device . This may take a
            few moments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PendingPopup;
