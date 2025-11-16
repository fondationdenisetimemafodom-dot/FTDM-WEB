"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next"; // Added i18n hook
import axiosInstance from "../../lib/axiosInstance";
import { Trash2 } from "lucide-react";
import { FiTrash2 } from "react-icons/fi";
import dummy from "../../assets/images/dummy.png";

interface Message {
  _id: string;
  message_type: "anonymous" | "identified";
  content: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  subject?: string;
  phone_number?: string;
  status: "new" | "read" | "archived";
  created_at: string;
  updatedAt: string;
}

interface Volunteer {
  _id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  motivation: string;
  createdAt: string;
  status: string;
}

interface Partnership {
  _id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  partnership_type: string;
  proposal: string;
  status: string;
  createdAt: string;
}

interface DeleteConfirmation {
  isOpen: boolean;
  type: "message" | "volunteer" | "partnership" | null;
  id: string | null;
  title: string;
  message: string;
}

function Forms() {
  const { t } = useTranslation("forms"); // Added translation hook
  const [messageToggle, setMessageToggle] = useState<
    "identified" | "anonymous"
  >("identified");
  const [identifiedMessages, setIdentifiedMessages] = useState<Message[]>([]);
  const [anonymousMessages, setAnonymousMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [formsLoading, setFormsLoading] = useState<boolean>(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedPartnership, setSelectedPartnership] =
    useState<Partnership | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      type: null,
      id: null,
      title: "",
      message: "",
    });

  const fetchIdentifiedMessages = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/messages/identified`);
      console.log("fetched identified messages", response.data.data.messages);
      setIdentifiedMessages(response.data.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch identified messages:", error);
    }
  };

  const fetchAnonymousMessages = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/messages/anonymous`);
      console.log("fetched anonymous messages", response.data.data.messages);
      setAnonymousMessages(response.data.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch anonymous messages:", error);
    }
  };

  const fetchMessages = async (): Promise<void> => {
    setMessagesLoading(true);
    try {
      await Promise.all([fetchIdentifiedMessages(), fetchAnonymousMessages()]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchVolunteers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/forms/volunteers`);
      console.log("fetched volunteers", response.data);
      setVolunteers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    }
  };

  const fetchPartnerships = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/forms/partnerships`);
      console.log("fetched partners", response.data);
      setPartnerships(response.data || []);
    } catch (error) {
      console.error("Failed to fetch partnerships:", error);
    }
  };

  const fetchForms = async (): Promise<void> => {
    setFormsLoading(true);
    try {
      await Promise.all([fetchVolunteers(), fetchPartnerships()]);
    } finally {
      setFormsLoading(false);
    }
  };

  const handleDeleteMessage = (id: string): void => {
    setDeleteConfirmation({
      isOpen: true,
      type: "message",
      id,
      title: t("delete_message"), // Using translation key
      message: t("delete_message_confirmation"), // Using translation key
    });
  };

  const handleDeleteVolunteer = (id: string): void => {
    setDeleteConfirmation({
      isOpen: true,
      type: "volunteer",
      id,
      title: t("delete_volunteer_application"), // Using translation key
      message: t("delete_volunteer_confirmation"), // Using translation key
    });
  };

  const handleDeletePartnership = (id: string): void => {
    setDeleteConfirmation({
      isOpen: true,
      type: "partnership",
      id,
      title: t("delete_partnership_application"), // Using translation key
      message: t("delete_partnership_confirmation"), // Using translation key
    });
  };

  const executeDelete = async (): Promise<void> => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return;

    try {
      const { type, id } = deleteConfirmation;

      let endpoint = "";
      if (type === "message") {
        endpoint = `/api/messages/${id}`;
      } else if (type === "volunteer") {
        endpoint = `/api/forms/volunteers/${id}`;
      } else if (type === "partnership") {
        endpoint = `/api/forms/partnerships/${id}`;
      }
      setLoading(true);
      const response = await axiosInstance.delete(endpoint);
      console.log(`${type} deleted:`, response.data);

      if (type === "message") {
        if (messageToggle === "identified") {
          setIdentifiedMessages((prev) => prev.filter((msg) => msg._id !== id));
        } else {
          setAnonymousMessages((prev) => prev.filter((msg) => msg._id !== id));
        }
      } else if (type === "volunteer") {
        setVolunteers((prev) => prev.filter((vol) => vol._id !== id));
      } else if (type === "partnership") {
        setPartnerships((prev) => prev.filter((part) => part._id !== id));
      }

      setDeleteConfirmation({
        isOpen: false,
        type: null,
        id: null,
        title: "",
        message: "",
      });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(
        `Failed to delete ${deleteConfirmation.type}:`,
        error?.response || error
      );
    }
  };

  const cancelDelete = (): void => {
    setDeleteConfirmation({
      isOpen: false,
      type: null,
      id: null,
      title: "",
      message: "",
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPartnershipsList = (): React.ReactElement => {
    if (formsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (partnerships.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          {t("no_partnerships_found")} {/* Using translation key */}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full ">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("organization")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("contact_person")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("phone_number")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("email")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("date")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("action")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("delete")} {/* Using translation key */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partnerships.map((partnership) => (
              <tr key={partnership._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {partnership.organizationName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {partnership.contactPerson}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {partnership.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {partnership.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(partnership.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedPartnership(partnership)}
                    className="text-cyan-500 cursor-pointer underline hover:text-cyan-600 transition-colors"
                  >
                    {t("view")} {/* Using translation key */}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeletePartnership(partnership._id)}
                    className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                    title="Delete partnership"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderVolunteersList = (): React.ReactElement => {
    if (formsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (volunteers.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          {t("no_volunteers_found")} {/* Using translation key */}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("full_name")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("phone_number")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("email_address")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("date")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("action")} {/* Using translation key */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("delete")} {/* Using translation key */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {volunteers.map((volunteer) => (
              <tr key={volunteer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {volunteer.firstname + " " + volunteer.lastname}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {volunteer.phone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {volunteer.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(volunteer.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedVolunteer(volunteer)}
                    className="text-cyan-500 cursor-pointer underline hover:text-cyan-600 transition-colors"
                  >
                    {t("view")} {/* Using translation key */}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeleteVolunteer(volunteer._id)}
                    className="text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                    title="Delete volunteer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMessagesList = (): React.ReactElement => {
    const messages =
      messageToggle === "identified" ? identifiedMessages : anonymousMessages;

    if (messagesLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          {t("no_messages_found")} {/* Using translation key */}
        </div>
      );
    }

    return (
      <div className="space-y-4 px-6">
        {messages.map((message) => (
          <div
            key={message._id}
            className="flex items-start gap-4 bg-blue-100 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <img
              src={dummy || "/placeholder.svg"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {messageToggle === "identified"
                    ? `${message.first_name || ""} ${message.last_name || ""}`
                    : "Anonymous"}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(message.created_at)}
                  </span>
                  <button
                    onClick={() => handleDeleteMessage(message._id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {messageToggle === "identified"
                  ? message.content
                  : message.content.substring(0, 100) + "..."}
              </p>
              {messageToggle === "identified" && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>
                    {t("email")}: {message.email || "N/A"}
                  </p>{" "}
                  {/* Using translation key */}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMessageDetail = (): React.ReactElement | null => {
    if (!selectedMessage) return null;

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {t("message_details")} {/* Using translation key */}
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {selectedMessage.message_type === "identified"
                      ? "👤"
                      : "🕵️"}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedMessage.message_type === "identified"
                      ? `${selectedMessage.first_name} ${selectedMessage.last_name}`
                      : "Anonymous"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
              </div>

              {selectedMessage.message_type === "identified" && (
                <>
                  {selectedMessage.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("email")} {/* Using translation key */}
                      </p>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                  )}
                  {selectedMessage.phone_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("phone")} {/* Using translation key */}
                      </p>
                      <p className="text-gray-900">
                        {selectedMessage.phone_number}
                      </p>
                    </div>
                  )}
                  {selectedMessage.subject && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("subject")} {/* Using translation key */}
                      </p>
                      <p className="text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {t("message")} {/* Using translation key */}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedMessage.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  {t("close")} {/* Using translation key */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVolunteerDetail = (): React.ReactElement | null => {
    if (!selectedVolunteer) return null;

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {t("volunteer_application_details")}{" "}
                {/* Using translation key */}
              </h3>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🙋</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedVolunteer.firstname} {selectedVolunteer.lastname}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedVolunteer.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("email")} {/* Using translation key */}
                </p>
                <p className="text-gray-900">{selectedVolunteer.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("phone_number")} {/* Using translation key */}
                </p>
                <p className="text-gray-900">{selectedVolunteer.phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("status")} {/* Using translation key */}
                </p>
                <p className="text-gray-900 capitalize">
                  {selectedVolunteer.status}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {t("motivation")} {/* Using translation key */}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedVolunteer.motivation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  {t("close")} {/* Using translation key */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPartnershipDetail = (): React.ReactElement | null => {
    if (!selectedPartnership) return null;

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {t("partnership_application_details")}{" "}
                {/* Using translation key */}
              </h3>
              <button
                onClick={() => setSelectedPartnership(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedPartnership.organizationName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedPartnership.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("contact_person")} {/* Using translation key */}
                </p>
                <p className="text-gray-900">
                  {selectedPartnership.contactPerson}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("email")} {/* Using translation key */}
                </p>
                <p className="text-gray-900">{selectedPartnership.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("phone_number")} {/* Using translation key */}
                </p>
                <p className="text-gray-900">{selectedPartnership.phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("partnership_type")} {/* Using translation key */}
                </p>
                <p className="text-gray-900 capitalize">
                  {selectedPartnership.partnership_type}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  {t("status")} {/* Using translation key */}
                </p>
                <p className="text-gray-900 capitalize">
                  {selectedPartnership.status}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {t("proposal")} {/* Using translation key */}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedPartnership.proposal}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setSelectedPartnership(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
                >
                  {t("close")} {/* Using translation key */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmationModal = (): React.ReactElement | null => {
    if (!deleteConfirmation.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {deleteConfirmation.title}
          </h3>
          <p className="text-gray-600 mb-6">{deleteConfirmation.message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium"
            >
              {t("cancel")} {/* Using translation key */}
            </button>
            <button
              onClick={executeDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
              ) : (
                <span>{t("delete")}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchMessages();
    fetchForms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Partnership Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-white">
            <h2 className="text-xl font-bold text-main-500">
              {t("partnership_request")} {/* Using translation key */}
            </h2>
          </div>
          <div>{renderPartnershipsList()}</div>
        </div>

        {/* Volunteer Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-white">
            <h2 className="text-xl font-bold text-main-500">
              {t("volunteer_request")} {/* Using translation key */}
            </h2>
          </div>
          <div>{renderVolunteersList()}</div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow pb-10">
          <div className="px-6 py-4">
            <div className="flex flex-col justify-between items-start">
              <h2 className="text-xl font-bold text-main-500 mb-4">
                {t("messages")} {/* Using translation key */}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMessageToggle("identified")}
                  className={`py-2 rounded-md font-semibold text-[18px] transition ${
                    messageToggle === "identified"
                      ? "underline underline-offset-6 text-main-500"
                      : "text-black hover:underline hover:underline-offset-6"
                  }`}
                >
                  {t("identified")} {/* Using translation key */}
                </button>
                <button
                  onClick={() => setMessageToggle("anonymous")}
                  className={`px-3 py-2 rounded-md font-semibold text-[18px] transition ${
                    messageToggle === "anonymous"
                      ? "underline underline-offset-6 text-main-500"
                      : "text-black hover:underline hover:underline-offset-6"
                  }`}
                >
                  {t("anonymous")} {/* Using translation key */}
                </button>
              </div>
            </div>
          </div>
          <div>{renderMessagesList()}</div>
        </div>
      </div>

      {/* Modal for message details */}
      {renderMessageDetail()}

      {/* Modal for volunteer details */}
      {renderVolunteerDetail()}

      {/* Modal for partnership details */}
      {renderPartnershipDetail()}

      {/* Modal for delete confirmation */}
      {renderDeleteConfirmationModal()}
    </div>
  );
}

export default Forms;
