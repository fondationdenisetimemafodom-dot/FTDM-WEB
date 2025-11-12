/*-----------------------------------------------------------------------------------------------------
| @file SubscriptionManagementModal.tsx
| @brief Modal component for managing monthly subscriptions (view, edit, pause, cancel)
| @param show - Boolean to control modal visibility
| @param onClose - Function to close the modal
| @param email - User email to fetch subscription
| @return Modal JSX element for subscription management
-----------------------------------------------------------------------------------------------------*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../lib/api";
import {
  FaTimes,
  FaEdit,
  FaPause,
  FaPlay,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

/*-----------------------------------------------------------------------------------------------------
| @interface SubscriptionManagementModalProps
| @brief Props interface for SubscriptionManagementModal component
-----------------------------------------------------------------------------------------------------*/
interface SubscriptionManagementModalProps {
  show: boolean;
  onClose: () => void;
  email: string;
}

/*-----------------------------------------------------------------------------------------------------
| @interface Subscription
| @brief Interface for subscription data structure
-----------------------------------------------------------------------------------------------------*/
interface Subscription {
  _id: string;
  donorName: string;
  donorEmail: string;
  phone: string;
  amount: number;
  status: string;
  nextBillingDate: string;
  totalPaid: number;
  successfulPayments: number;
  pausedUntil?: string;
}

/*-----------------------------------------------------------------------------------------------------
| @type ViewMode
| @brief Defines the current view mode in the modal
-----------------------------------------------------------------------------------------------------*/
type ViewMode = "view" | "edit" | "pause" | "cancel";

/*-----------------------------------------------------------------------------------------------------
| @function SubscriptionManagementModal
| @brief Modal component for managing user subscriptions
| @param props - Component props
| @return JSX element for subscription management modal
-----------------------------------------------------------------------------------------------------*/
const SubscriptionManagementModal: React.FC<
  SubscriptionManagementModalProps
> = ({ show, onClose, email }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("view");

  // Edit form states
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editPhone, setEditPhone] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Pause form state
  const [pauseDuration, setPauseDuration] = useState<number>(1);

  // Cancel form state
  const [cancelReason, setCancelReason] = useState("");

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchSubscription
  | @brief Fetches subscription details from the backend
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchSubscription = async () => {
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/subscriptions/my-subscription?email=${email}`
      );

      if (response.data.success) {
        setSubscription(response.data.data);
        setEditAmount(response.data.data.amount);
        setEditPhone(response.data.data.phone);
        setEditMessage(response.data.data.message || "");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch subscription details"
      );
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleUpdateSubscription
  | @brief Updates subscription details
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleUpdateSubscription = async () => {
    if (!subscription) return;

    if (editAmount < 500) {
      setError("Minimum subscription amount is 500 XAF");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/subscriptions/${subscription._id}`,
        {
          donorEmail: email,
          amount: editAmount,
          phone: editPhone,
          message: editMessage,
        }
      );

      if (response.data.success) {
        setSuccess("Subscription updated successfully!");
        await fetchSubscription();
        setTimeout(() => {
          setViewMode("view");
          setSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handlePauseSubscription
  | @brief Pauses subscription for specified duration
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handlePauseSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/subscriptions/${subscription._id}/pause`,
        {
          donorEmail: email,
          pauseDuration: pauseDuration,
        }
      );

      if (response.data.success) {
        setSuccess(`Subscription paused for ${pauseDuration} month(s)!`);
        await fetchSubscription();
        setTimeout(() => {
          setViewMode("view");
          setSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to pause subscription");
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleResumeSubscription
  | @brief Resumes a paused subscription
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleResumeSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/subscriptions/${subscription._id}/resume`,
        {
          donorEmail: email,
        }
      );

      if (response.data.success) {
        setSuccess("Subscription resumed successfully!");
        await fetchSubscription();
        setTimeout(() => {
          setSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resume subscription");
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleCancelSubscription
  | @brief Cancels the subscription permanently
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/subscriptions/${subscription._id}`,
        {
          data: {
            donorEmail: email,
            cancelReason: cancelReason,
          },
        }
      );

      if (response.data.success) {
        setSuccess(
          "Subscription cancelled successfully. Thank you for your support!"
        );
        setTimeout(() => {
          onClose();
        }, 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief Formats ISO date string to readable format
  | @param dateString - ISO date string
  | @return Formatted date string
  ------------------------------------------------------------------------------------------------------*/
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function getStatusBadge
  | @brief Returns styled status badge based on subscription status
  | @param status - Subscription status
  | @return JSX element for status badge
  ------------------------------------------------------------------------------------------------------*/
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      active: { color: "bg-green-100 text-green-800", text: "Active" },
      pending_payment: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending Payment",
      },
      paused: { color: "bg-gray-100 text-gray-800", text: "Paused" },
      overdue: { color: "bg-red-100 text-red-800", text: "Overdue" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    if (show && email) {
      fetchSubscription();
      setViewMode("view");
    }
  }, [show, email]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/*-----------------------------------------------------------------------------------------------------
         | @blocktype ModalHeader
         | @brief Modal header with title and close button
         | @param --
         | @return --
         -----------------------------------------------------------------------------------------------------*/}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            Manage Subscription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="p-6">
          {loading && !subscription ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscription...</p>
            </div>
          ) : error && !subscription ? (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : subscription ? (
            <>
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="text-green-800">{success}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {/*-----------------------------------------------------------------------------------------------------
               | @blocktype ViewMode
               | @brief Displays subscription details and action buttons
               | @param --
               | @return --
               -----------------------------------------------------------------------------------------------------*/}
              {viewMode === "view" && (
                <div className="space-y-6">
                  {/* Subscription Info */}
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Subscription Details
                      </h3>
                      {getStatusBadge(subscription.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Donor Name</p>
                        <p className="font-semibold text-gray-800">
                          {subscription.donorName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">
                          {subscription.donorEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">
                          {subscription.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Amount</p>
                        <p className="font-semibold text-gray-800">
                          {subscription.amount.toLocaleString()} XAF
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Next Billing Date
                        </p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(subscription.nextBillingDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Contributed
                        </p>
                        <p className="font-semibold text-gray-800">
                          {subscription.totalPaid.toLocaleString()} XAF
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Successful Payments
                        </p>
                        <p className="font-semibold text-gray-800">
                          {subscription.successfulPayments} month(s)
                        </p>
                      </div>
                      {subscription.pausedUntil && (
                        <div>
                          <p className="text-sm text-gray-600">Paused Until</p>
                          <p className="font-semibold text-gray-800">
                            {formatDate(subscription.pausedUntil)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setViewMode("edit")}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                      disabled={subscription.status === "cancelled"}
                    >
                      <FaEdit /> Edit Details
                    </button>

                    {subscription.status === "paused" ? (
                      <button
                        onClick={handleResumeSubscription}
                        className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
                        disabled={loading}
                      >
                        <FaPlay /> Resume Subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewMode("pause")}
                        className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
                        disabled={subscription.status === "cancelled"}
                      >
                        <FaPause /> Pause Subscription
                      </button>
                    )}

                    <button
                      onClick={() => setViewMode("cancel")}
                      className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300 md:col-span-2"
                      disabled={subscription.status === "cancelled"}
                    >
                      <FaTrash /> Cancel Subscription
                    </button>
                  </div>
                </div>
              )}

              {/*-----------------------------------------------------------------------------------------------------
               | @blocktype EditMode
               | @brief Form for editing subscription details
               | @param --
               | @return --
               -----------------------------------------------------------------------------------------------------*/}
              {viewMode === "edit" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Edit Subscription Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Amount (XAF)
                    </label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(Number(e.target.value))}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-main-500"
                      min="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: 500 XAF
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-main-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-main-500 h-24"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleUpdateSubscription}
                      className="flex-1 bg-main-500 text-white py-3 rounded-lg hover:bg-main-600 transition duration-300"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setViewMode("view")}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/*-----------------------------------------------------------------------------------------------------
               | @blocktype PauseMode
               | @brief Form for pausing subscription
               | @param --
               | @return --
               -----------------------------------------------------------------------------------------------------*/}
              {viewMode === "pause" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Pause Subscription
                  </h3>

                  <p className="text-gray-600">
                    Your subscription will be paused for the selected duration.
                    No payments will be charged during this period.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pause Duration (months)
                    </label>
                    <select
                      value={pauseDuration}
                      onChange={(e) => setPauseDuration(Number(e.target.value))}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-main-500"
                    >
                      <option value={1}>1 month</option>
                      <option value={2}>2 months</option>
                      <option value={3}>3 months</option>
                      <option value={6}>6 months</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handlePauseSubscription}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition duration-300"
                      disabled={loading}
                    >
                      {loading ? "Pausing..." : "Pause Subscription"}
                    </button>
                    <button
                      onClick={() => setViewMode("view")}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/*-----------------------------------------------------------------------------------------------------
               | @blocktype CancelMode
               | @brief Form for cancelling subscription
               | @param --
               | @return --
               -----------------------------------------------------------------------------------------------------*/}
              {viewMode === "cancel" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Cancel Subscription
                  </h3>

                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-semibold">
                      Warning: This action cannot be undone.
                    </p>
                    <p className="text-red-700 text-sm mt-2">
                      Your subscription will be cancelled permanently. You can
                      always create a new subscription later.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for cancellation (Optional)
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Help us improve by sharing why you're cancelling..."
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-main-500 h-24"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleCancelSubscription}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300"
                      disabled={loading}
                    >
                      {loading ? "Cancelling..." : "Confirm Cancellation"}
                    </button>
                    <button
                      onClick={() => setViewMode("view")}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                      disabled={loading}
                    >
                      Keep Subscription
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagementModal;
