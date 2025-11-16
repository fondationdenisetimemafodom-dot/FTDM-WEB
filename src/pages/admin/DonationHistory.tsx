"use client";
import { useState, useEffect } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";

import axiosInstance from "../../lib/axiosInstance";
import API_BASE_URL from "../../lib/api";

interface Donation {
  _id: string;
  status: "pending" | "successful" | "failed" | "expired";
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  message?: string;
  transactionId: string;
  externalId: string;
  paymentMethod: "mobile_money" | "orange_money";
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

const DonationHistoryPage: React.FC = () => {
  const { t } = useTranslation("withdrawals");
  const [activeTab, setActiveTab] = useState<"donations" | "withdrawals">(
    "donations"
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center px-6 py-4">
          <div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("donations")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "donations"
                    ? "text-cyan-500 border-b-2 border-cyan-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("donations").toUpperCase()}
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`pb-2 text-sm font-semibold ${
                  activeTab === "withdrawals"
                    ? "text-cyan-500 border-b-2 border-cyan-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("withdrawals").toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "donations" ? <DonationsView /> : <WithdrawalsView />}
    </div>
  );
};

const DonationsView: React.FC = () => {
  const { t } = useTranslation("withdrawals");
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalDonations, setTotalDonations] = useState(0);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/donations/history`
      );
      const donationsData = response.data.data.donations;
      setDonations(donationsData);

      const successfulDonations = donationsData.filter(
        (d: Donation) => d.status === "successful"
      );
      const total = successfulDonations.reduce(
        (sum: number, d: Donation) => sum + d.amount,
        0
      );
      setTotalDonations(total);
    } catch (err: any) {
      console.error("Failed to fetch donations:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load donations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + " CFA";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "successful":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "expired":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <div className="mx-8 my-8 p-6 bg-white shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {t("allDonations")}
          </h1>
          {donations.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {donations.length}{" "}
              {donations.length !== 1 ? t("donations_plural") : t("donation")}
            </span>
          )}
        </div>
        <button
          onClick={fetchDonations}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors disabled:opacity-50"
          title={t("refresh")}
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchDonations}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {t("tryAgain")}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("donorName").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("email").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("phone").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("amount").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("status").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("paymentMethod").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("date").toUpperCase()}
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {t("message").toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                      <p className="text-gray-500">{t("loadingDonations")}</p>
                    </div>
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">{t("noDonations")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr
                    key={donation._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-cyan-600 text-xs font-medium">
                            {donation.donorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {donation.donorName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {donation.donorEmail || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {donation.donorPhone}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatAmount(donation.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={getStatusBadge(donation.status)}>
                        {donation.status.charAt(0).toUpperCase() +
                          donation.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {donation.paymentMethod === "mobile_money"
                        ? t("mobileMoneyLabel")
                        : t("orangeMoneyLabel")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatDate(donation.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {donation.message || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && donations.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-900">
                {t("totalSuccessfulDonations")}{" "}
                <span className="text-cyan-600">
                  {formatAmount(totalDonations)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WithdrawalsView: React.FC = () => {
  const { t } = useTranslation("withdrawals");
  const [error, setError] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      setError(t("validWithdrawalAmount"));
      return;
    }

    if (!phoneNumber.trim()) {
      setError(t("enterPhoneNumberError"));
      return;
    }

    if (!pin.trim()) {
      setError(t("enterPinError"));
      return;
    }

    try {
      setWithdrawing(true);
      setError("");

      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/withdrawals/payout`,
        {
          amount: Number(withdrawAmount),
          phone: phoneNumber.trim(),
          pin: pin.trim(),
        }
      );

      if (response.data.success) {
        setShowSuccessPopup(true);
        setWithdrawAmount("");
        setPhoneNumber("");
        setPin("");
      } else {
        setError(t("withdrawalFailed") + response.data.message);
      }
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      setError(err.response?.data?.message || t("withdrawalError"));
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <>
      <div className="mx-8 my-8 p-6 bg-white shadow-sm rounded-2xl">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("processNewWithdrawal")}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                {t("dismiss")}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("withdrawalAmount")}
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={t("enterAmount")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("phoneNumber")}
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("enterPhoneNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("pin")}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={t("enterPin")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {withdrawing ? t("processing") : t("processWithdrawal")}
            </button>
          </div>
        </div>
      </div>

      {withdrawing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600">{t("processingWithdrawal")}</p>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("success")}
            </h3>
            <p className="text-gray-600 mb-6">{t("withdrawalSuccess")}</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationHistoryPage;
