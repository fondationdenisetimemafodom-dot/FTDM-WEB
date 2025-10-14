"use client";

/*-----------------------------------------------------------------------------------------------------
 | @component Donate
 | @brief    Donation page with webhook verification, pending states, and enhanced error handling
 | @param    --
 | @return   Donation page JSX element
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

/*-----------------------------------------------------------------------------------------------------
 | @function Donate
 | @brief    Enhanced donation component with webhook verification and comprehensive state management
 | @param    --
 | @return   JSX element for donation page
 -----------------------------------------------------------------------------------------------------*/
function Donate() {
  const { t } = useTranslation("donate");

  // Popup states
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [amount, setAmount] = useState<number | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [phone, setPhone] = useState("");

  // Transaction tracking
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Suggested donation amounts
  const suggestedAmounts = [1000, 2500, 5000, 10000];

  /*-----------------------------------------------------------------------------------------------------
   | @function validateForm
   | @brief    Validates all required form fields before submission
   | @param    --
   | @return   Boolean indicating form validity
   -----------------------------------------------------------------------------------------------------*/
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
   | @brief    Polls the backend to check transaction status via webhook verification
   | @param    transactionId - ID of the transaction to monitor
   | @return   Promise resolving to transaction status
   -----------------------------------------------------------------------------------------------------*/
  const pollTransactionStatus = async (
    transactionId: string
  ): Promise<boolean> => {
    const maxAttempts = 30; // Poll for up to 5 minutes (30 * 10 seconds)
    let attempts = 0;
    console.log(transactionId);
    return new Promise((resolve) => {
      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/payments/webhook`,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const { status } = response.data;

          if (status === "completed") {
            clearInterval(pollInterval);
            resolve(true);
          } else if (status === "failed" || status === "expired") {
            clearInterval(pollInterval);
            resolve(false);
          } else if (attempts >= maxAttempts) {
            // Timeout after maximum attempts
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
   | @brief    Resets all form fields to initial state
   | @param    --
   | @return   --
   -----------------------------------------------------------------------------------------------------*/
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
   | @brief    Handles donation submission with webhook verification and comprehensive error handling
   | @param    e - Form event
   | @return   --
   -----------------------------------------------------------------------------------------------------*/
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
         | @brief    Enhanced donation form with validation and webhook integration
         | @param    --
         | @return   Form JSX
         -----------------------------------------------------------------------------------------------------*/}
        <div className="bg-[#F3F5F8] w-full p-25">
          <form
            className="max-w-[1074px] mx-auto bg-white rounded-xl p-10 space-y-6"
            onSubmit={handleDonation}
          >
            <div className="flex flex-col space-y-4">
              {/* Benefits section */}
              <div className="flex justify-between w-full mb-10 flex-wrap gap-4">
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
              <div className="flex flex-wrap gap-3 mb-4">
                {suggestedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-4 py-2 rounded-lg border ${
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
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full"
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstName")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full"
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
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full"
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
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full"
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
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full"
                  required
                />
              </div>
              <div className="flex items-center">
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t("comments")}
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 w-full h-24"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="bg-main-500 text-white rounded-lg p-3 font-bold hover:bg-main-600 transition duration-300"
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
