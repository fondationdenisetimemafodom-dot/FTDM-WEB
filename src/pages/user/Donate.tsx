/*-----------------------------------------------------------------------------------------------------
| @file Donate.tsx
| @brief Donation page with webhook verification, pending states, and enhanced error handling
| @param --
| @return Responsive donation page JSX element
-----------------------------------------------------------------------------------------------------*/

import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaCheckCircle } from "react-icons/fa";
import ThankYouPopup from "../../components/ThankYouPopup";
import PendingPopup from "../../components/PendingPopup";
import ErrorPopup from "../../components/ErrorPopup";
import axios from "axios";
import API_BASE_URL from "../../lib/api";
import { motion } from "framer-motion";
import BgImage from "../../assets/images/Donate.jpg";
/*-----------------------------------------------------------------------------------------------------
| @function Donate
| @brief Enhanced donation component with webhook verification and comprehensive state management
| @param --
| @return JSX element for donation page
-----------------------------------------------------------------------------------------------------*/
function Donate() {
  const { t } = useTranslation("donate");

  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [amount, setAmount] = useState<number | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [phone, setPhone] = useState("");

  const [transactionId, setTransactionId] = useState<string | null>(null);

  const suggestedAmounts = [1000, 2500, 5000, 10000];

  /*-----------------------------------------------------------------------------------------------------
  | @function validateForm
  | @brief Validates all required form fields before submission
  | @param --
  | @return Boolean indicating form validity
  ------------------------------------------------------------------------------------------------------*/
  const validateForm = (): boolean => {
    if (!amount || amount <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      setShowErrorPopup(true);
      return false;
    }
    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      setShowErrorPopup(true);
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      setShowErrorPopup(true);
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setShowErrorPopup(true);
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function pollTransactionStatus
  | @brief Polls the backend to check transaction status via webhook verification
  | @param transactionId - ID of the transaction to monitor
  | @return Promise resolving to transaction status
  ------------------------------------------------------------------------------------------------------*/
  const pollTransactionStatus = async (
    transactionId: string
  ): Promise<boolean> => {
    const maxAttempts = 30;
    let attempts = 0;
    console.log(transactionId);
    return new Promise((resolve) => {
      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/donations/status/${transactionId}`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          console.log("Checking donation status:");
          console.log("Polling response:", response.data);
          const { status } = response.data;
          console.log("Donation status:", status);
          if (status === "successful") {
            clearInterval(pollInterval);
            resolve(true);
          } else if (status === "failed" || status === "expired") {
            clearInterval(pollInterval);
            resolve(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            resolve(false);
          }
        } catch (error) {
          console.error("Error polling transaction status:", error);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            resolve(false);
          }
        }
      }, 5000);
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function resetForm
  | @brief Resets all form fields to initial state
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const resetForm = () => {
    setAmount("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setComments("");
    setPhone("");
    setTransactionId(null);
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDonation
  | @brief Handles donation submission with webhook verification and comprehensive error handling
  | @param e - Form event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowPendingPopup(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/donations/direct-pay`,
        {
          amount: amount,
          phone: phone,
          donorName: `${firstName} ${lastName}`,
          donorEmail: email,
          message: comments,
          isAnonymous: false,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        const newTransactionId = response.data.data.transactionId;
        setTransactionId(newTransactionId);
        console.log("Transaction ID:", newTransactionId);

        const isSuccessful = await pollTransactionStatus(newTransactionId);

        setShowPendingPopup(false);

        if (isSuccessful) {
          setShowThankYouPopup(true);
          resetForm();
        } else {
          setErrorMessage(
            "Donation verification failed. Please contact support if payment was deducted."
          );
          setShowErrorPopup(true);
        }
      } else {
        setShowPendingPopup(false);
        setErrorMessage(
          response.data?.message || "Donation failed. Please try again."
        );
        setShowErrorPopup(true);
      }
    } catch (error: any) {
      setShowPendingPopup(false);
      console.log(error);
      setErrorMessage(
        error?.response?.data?.message || "Network error, please try again."
      );
      setShowErrorPopup(true);
    }
  };
  console.log(transactionId);

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype Header
       | @brief Page introduction with main call-to-action text
       | @param --
       | @return --
       -----------------------------------------------------------------------------------------------------*/}
      <div className="flex flex-col items-center w-screen">
        <div
          className="flex flex-col items-center justify-center md:min-h-screen w-full px-4 py-20"
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
              className="text-[40px] md:text-4xl lg:text-[56px] text-center font-bold text-white leading-tight"
            >
              Be the Change You Wish to See
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-lg md:text-xl lg:text-3xl font-regular text-white text-center"
            >
              Your generosity fuels our mission of human solidarity and
              transforms lives across Cameroon and beyond. Whether through
              Mobile Money, PayPal, or other channels, every contribution no
              matter the size becomes a beacon of hope, empowering education,
              healthcare, cultural initiatives, and community development.
              Together, we turn compassion into action and dreams into reality
              for those who need it most.
            </motion.span>
          </div>
        </div>

        {/*-----------------------------------------------------------------------------------------------------
         | @blocktype DonationForm
         | @brief Enhanced donation form with validation and webhook integration
         | @param --
         | @return Form JSX
         -----------------------------------------------------------------------------------------------------*/}
        <div className="bg-[#F3F5F8] w-full p-2 lg:p-25">
          <form
            className="max-w-[1074px] mx-auto bg-white rounded-xl p-6 lg:p-10 space-y-6"
            onSubmit={handleDonation}
          >
            <div className="flex flex-col space-y-4">
              {/* Benefits section */}
              <div className="flex flex-col lg:flex-row lg:justify-between w-full mb-6 lg:mb-10 gap-4">
                <div className="flex gap-3 lg:gap-5 items-center">
                  <FaCheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                  <span className="text-base lg:text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.updates")}
                  </span>
                </div>
                <div className="flex gap-3 lg:gap-5 items-center">
                  <FaCheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                  <span className="text-base lg:text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.secure")}
                  </span>
                </div>
                <div className="flex gap-3 lg:gap-5 items-center">
                  <FaCheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                  <span className="text-base lg:text-[20px] font-semibold text-[#44546A]">
                    {t("benefits.transparent")}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <label className="text-main-500 text-2xl lg:text-3xl font-bold mb-3 lg:mb-5">
                {t("amount")}
              </label>
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 mb-4">
                {suggestedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-4 py-2 rounded-lg border text-sm lg:text-base ${
                      amount === amt
                        ? "bg-main-500 text-white"
                        : "border-blue-300 text-main-500"
                    }`}
                  >
                    {amt.toLocaleString()} XAF
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={t("amountPlaceholder")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full text-sm lg:text-base"
                  required
                />
              </div>

              {/* Personal Info */}
              <label className="text-main-500 text-2xl lg:text-3xl font-bold mt-3 mb-3 lg:mb-5">
                {t("personalInfo")}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstName")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full text-sm lg:text-base"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("lastName")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full text-sm lg:text-base"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full text-sm lg:text-base"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phone")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full text-sm lg:text-base"
                  required
                />
              </div>
              <div className="flex items-center">
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t("comments")}
                  className="border-3 border-blue-300 rounded p-2 lg:p-3 focus:outline-none focus:border-blue-500 w-full h-20 lg:h-24 text-sm lg:text-base"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-main-500 text-white rounded-lg p-3 lg:p-4 font-bold text-base lg:text-lg hover:bg-main-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={showPendingPopup}
              >
                {t("donateBtn")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ThankYouPopup
        show={showThankYouPopup}
        onClose={() => setShowThankYouPopup(false)}
      />
      <PendingPopup show={showPendingPopup} />
      <ErrorPopup
        show={showErrorPopup}
        message={errorMessage}
        onClose={() => setShowErrorPopup(false)}
      />
      <Footer />
    </div>
  );
}

export default Donate;
