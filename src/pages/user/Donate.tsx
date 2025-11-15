/*-----------------------------------------------------------------------------------------------------
| @file Donate.tsx
| @brief Enhanced donation page with instant and monthly subscription options
| @param --
| @return Responsive donation page with subscription management JSX element
-----------------------------------------------------------------------------------------------------*/

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaCheckCircle, FaCalendarAlt, FaBolt } from "react-icons/fa";
import ThankYouPopup from "../../components/ThankYouPopup";
import PendingPopup from "../../components/PendingPopup";
import ErrorPopup from "../../components/ErrorPopup";
import SubscriptionManagementModal from "../../components/SubscriptionManagementModal";
import axios from "axios";
import API_BASE_URL from "../../lib/api";
import { motion } from "framer-motion";
import BgImage from "../../assets/images/Donate.jpg";

/*-----------------------------------------------------------------------------------------------------
| @type DonationType
| @brief Defines the type of donation (instant or monthly subscription)
-----------------------------------------------------------------------------------------------------*/
type DonationType = "instant" | "monthly";

/*-----------------------------------------------------------------------------------------------------
| @function Donate
| @brief Enhanced donation component with instant and monthly subscription options
| @param --
| @return JSX element for donation page
-----------------------------------------------------------------------------------------------------*/
function Donate() {
  const { t } = useTranslation("donate");

  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationType, setDonationType] = useState<DonationType>("instant");
  const [amount, setAmount] = useState<number | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [phone, setPhone] = useState("");

  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const suggestedAmounts = [1000, 2500, 5000, 10000];

  /*-----------------------------------------------------------------------------------------------------
  | @function checkExistingSubscription
  | @brief Checks if user has an active subscription when email is entered
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  useEffect(() => {
    const checkSubscription = async () => {
      if (email && email.includes("@")) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/subscriptions/my-subscription?email=${email}`
          );
          if (response.data.success) {
            setHasActiveSubscription(true);
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            setHasActiveSubscription(false);
          }
        }
      }
    };

    const debounce = setTimeout(() => {
      checkSubscription();
    }, 500);

    return () => clearTimeout(debounce);
  }, [email]);

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
    if (donationType === "monthly" && amount < 500) {
      setErrorMessage("Minimum monthly subscription amount is 500 XAF.");
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

          const { status } = response.data;

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
  | @function handleInstantDonation
  | @brief Handles instant one-time donation submission
  | @param e - Form event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleInstantDonation = async (e: React.FormEvent) => {
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

      if (response.status === 200 || response.status === 201) {
        const newTransactionId = response.data.data.transactionId;
        setTransactionId(newTransactionId);
        console.log("Transaction ID:", transactionId);
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

  /*-----------------------------------------------------------------------------------------------------
  | @function handleMonthlySubscription
  | @brief Handles monthly subscription creation
  | @param e - Form event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleMonthlySubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (hasActiveSubscription) {
      setErrorMessage(
        "You already have an active subscription. Please manage your existing subscription."
      );
      setShowErrorPopup(true);
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/subscriptions/subscribe`,
        {
          donorName: `${firstName} ${lastName}`,
          donorEmail: email,
          phone: phone,
          amount: amount,
          message: comments,
          isAnonymous: false,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setShowPendingPopup(false);
      console.log(response.data);
      if (response.data.success) {
        setShowThankYouPopup(true);
        setHasActiveSubscription(true);
        resetForm();
      } else {
        setErrorMessage(
          response.data.message || "Failed to create subscription."
        );
        setShowErrorPopup(true);
      }
    } catch (error: any) {
      setShowPendingPopup(false);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to create subscription. Please try again."
      );
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleDonation
  | @brief Routes donation to appropriate handler based on donation type
  | @param e - Form event
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleDonation = async (e: React.FormEvent) => {
    if (donationType === "instant") {
      await handleInstantDonation(e);
    } else {
      await handleMonthlySubscription(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/*-----------------------------------------------------------------------------------------------------
       | @blocktype Header
       | @brief Page introduction with main call-to-action text
       | @param --
       | @return --
       -----------------------------------------------------------------------------------------------------*/}
      <div className="flex flex-col items-center w-full">
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
         | @brief Enhanced donation form with instant and monthly subscription options
         | @param --
         | @return Form JSX
         -----------------------------------------------------------------------------------------------------*/}
        <div className="bg-[#F3F5F8] w-full p-2 lg:p-25">
          <form
            className="max-w-[1074px] mx-auto bg-white rounded-xl p-6 lg:p-10 space-y-6"
            onSubmit={handleDonation}
          >
            <div className="flex flex-col space-y-4">
              {/* Donation Type Toggle */}
              <div className="flex flex-col gap-4 mb-6">
                <h2 className="text-main-500 text-2xl lg:text-3xl font-bold">
                  Choose Donation Type
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDonationType("instant")}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      donationType === "instant"
                        ? "border-main-500 bg-blue-50"
                        : "border-gray-300 hover:border-main-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FaBolt
                        className={`text-4xl ${
                          donationType === "instant"
                            ? "text-main-500"
                            : "text-gray-400"
                        }`}
                      />
                      <h3 className="text-xl font-bold text-gray-800">
                        Instant Donation
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        Make a one-time donation now
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDonationType("monthly")}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      donationType === "monthly"
                        ? "border-main-500 bg-blue-50"
                        : "border-gray-300 hover:border-main-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <FaCalendarAlt
                        className={`text-4xl ${
                          donationType === "monthly"
                            ? "text-main-500"
                            : "text-gray-400"
                        }`}
                      />
                      <h3 className="text-xl font-bold text-gray-800">
                        Monthly Subscription
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        Support us every month automatically
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Manage Subscription Button */}
              {hasActiveSubscription && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-xl" />
                      <span className="text-gray-700 font-medium">
                        You have an active monthly subscription
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowManagementModal(true)}
                      className="bg-main-500 text-white px-6 py-2 rounded-lg hover:bg-main-600 transition duration-300"
                    >
                      Manage Subscription
                    </button>
                  </div>
                </div>
              )}

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
                {donationType === "monthly" ? "Monthly Amount" : t("amount")}
              </label>
              {donationType === "monthly" && (
                <p className="text-sm text-gray-600 -mt-2 mb-2">
                  Minimum 500 XAF per month
                </p>
              )}
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
                    {donationType === "monthly" && (
                      <span className="text-xs block">/month</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={
                    donationType === "monthly"
                      ? "Enter monthly amount (min 500 XAF)"
                      : t("amountPlaceholder")
                  }
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
                className="bg-main-500 text-white flex items-center justify-center rounded-lg p-3 lg:p-4 font-bold text-base lg:text-lg hover:bg-main-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={showPendingPopup || loading}
              >
                {donationType === "instant" ? (
                  t("donateBtn")
                ) : loading ? (
                  <div className="animate-spin self-center rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                ) : (
                  "Donate Monthly"
                )}
              </button>

              {donationType === "monthly" && (
                <p className="text-xs text-gray-500 text-center">
                  You will receive an email before each monthly billing with a
                  payment link. You can cancel anytime.
                </p>
              )}
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
      <SubscriptionManagementModal
        show={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        email={email}
      />
      <Footer />
    </div>
  );
}

export default Donate;
