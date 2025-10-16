/*-----------------------------------------------------------------------------------------------------
| @file Forms.tsx
| @brief Admin panel page for managing forms (volunteers, partnerships) and messages (anonymous, identified)
| @param --
| @return JSX element displaying partnerships, volunteers, and messages with toggle
-----------------------------------------------------------------------------------------------------*/

import { useState, useEffect } from "react";

import axiosInstance from "../../lib/axiosInstance";

/*-----------------------------------------------------------------------------------------------------
| TypeScript Interfaces
-----------------------------------------------------------------------------------------------------*/

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

/*-----------------------------------------------------------------------------------------------------
| @component Forms
| @brief Main component for managing forms and messages in admin panel
| @param --
| @return Admin forms and messages page JSX
-----------------------------------------------------------------------------------------------------*/
function Forms() {
  const [messageToggle, setMessageToggle] = useState<
    "identified" | "anonymous"
  >("identified");

  // Messages state
  const [identifiedMessages, setIdentifiedMessages] = useState<Message[]>([]);
  const [anonymousMessages, setAnonymousMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);

  // Forms state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [formsLoading, setFormsLoading] = useState<boolean>(true);

  // Selected items for detail view
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(
    null
  );
  const [selectedPartnership, setSelectedPartnership] =
    useState<Partnership | null>(null);

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchIdentifiedMessages
  | @brief Fetches all identified messages from the API
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchIdentifiedMessages = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/messages/identified`);
      console.log("fetched identified messages", response.data.data.messages);
      setIdentifiedMessages(response.data.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch identified messages:", error);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchAnonymousMessages
  | @brief Fetches all anonymous messages from the API
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchAnonymousMessages = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/messages/anonymous`);
      console.log("fetched anonymous messages", response.data.data.messages);

      setAnonymousMessages(response.data.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch anonymous messages:", error);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchMessages
  | @brief Fetches both identified and anonymous messages
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchMessages = async (): Promise<void> => {
    setMessagesLoading(true);
    try {
      await Promise.all([fetchIdentifiedMessages(), fetchAnonymousMessages()]);
    } finally {
      setMessagesLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchVolunteers
  | @brief Fetches all volunteer applications from the API
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchVolunteers = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/forms/volunteers`);
      console.log("fetched volunteers", response.data);
      setVolunteers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchPartnerships
  | @brief Fetches all partnership applications from the API
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchPartnerships = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(`/api/forms/partnerships`);
      console.log("fetched partners", response.data);
      setPartnerships(response.data || []);
    } catch (error) {
      console.error("Failed to fetch partnerships:", error);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function fetchForms
  | @brief Fetches both volunteer and partnership forms
  | @param --
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const fetchForms = async (): Promise<void> => {
    setFormsLoading(true);
    try {
      await Promise.all([fetchVolunteers(), fetchPartnerships()]);
    } finally {
      setFormsLoading(false);
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function handleViewMessage
  | @brief Handles viewing a specific message and updating its status to read
  | @param message - message object to view
  | @return --
  ------------------------------------------------------------------------------------------------------*/
  const handleViewMessage = async (message: Message): Promise<void> => {
    setSelectedMessage(message);

    if (message.status === "new") {
      try {
        await axiosInstance.patch(`/api/messages/${message._id}/status`, {
          status: "read",
        });
        fetchMessages();
      } catch (error) {
        console.error("Failed to update message status:", error);
      }
    }
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function formatDate
  | @brief Formats ISO date string to readable format
  | @param dateString - ISO date string
  | @return formatted date string
  ------------------------------------------------------------------------------------------------------*/
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

  // Fetch all data on component mount
  useEffect(() => {
    fetchMessages();
    fetchForms();
  }, []);

  /*-----------------------------------------------------------------------------------------------------
  | @function renderPartnershipsList
  | @brief Renders list of partnership applications
  | @param --
  | @return JSX element with partnerships table
  ------------------------------------------------------------------------------------------------------*/
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
          No partnership applications found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full ">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function renderVolunteersList
  | @brief Renders list of volunteer applications
  | @param --
  | @return JSX element with volunteers table
  ------------------------------------------------------------------------------------------------------*/
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
          No volunteer applications found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function renderMessagesList
  | @brief Renders list of messages based on current toggle (identified or anonymous)
  | @param --
  | @return JSX element with messages table
  ------------------------------------------------------------------------------------------------------*/
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
        <div className="text-center py-12 text-gray-500">No messages found</div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {messageToggle === "identified" ? "Full Name" : "Type"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {messageToggle === "identified" ? "Phone Number" : "Preview"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {messageToggle === "identified" ? "Email Address" : ""}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.map((message) => (
              <tr key={message._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {messageToggle === "identified"
                    ? `${message.first_name || ""} ${message.last_name || ""}`
                    : "Anonymous"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {messageToggle === "identified"
                    ? message.phone_number || "N/A"
                    : message.content.substring(0, 50) + "..."}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {messageToggle === "identified" ? message.email || "N/A" : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(message.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleViewMessage(message)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /*-----------------------------------------------------------------------------------------------------
  | @function renderMessageDetail
  | @brief Renders detailed view of selected message
  | @param --
  | @return JSX element with message details
  ------------------------------------------------------------------------------------------------------*/
  const renderMessageDetail = (): React.ReactElement | null => {
    if (!selectedMessage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Message Details
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
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                  )}
                  {selectedMessage.phone_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">
                        {selectedMessage.phone_number}
                      </p>
                    </div>
                  )}
                  {selectedMessage.subject && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Subject
                      </p>
                      <p className="text-gray-900">{selectedMessage.subject}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Message
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Partnership Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-white">
            <h2 className="text-xl font-bold text-main-500">
              Partnership request
            </h2>
          </div>
          <div>{renderPartnershipsList()}</div>
        </div>

        {/* Volunteer Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4  bg-white">
            <h2 className="text-xl font-bold text-main-500">
              Volunteer request
            </h2>
          </div>
          <div>{renderVolunteersList()}</div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4">
            <div className="flex flex-col justify-between items-start">
              <h2 className="text-xl font-bold text-main-500 mb-4">Messages</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMessageToggle("identified")}
                  className={` py-2 rounded-md font-semibold text-[18px] transition ${
                    messageToggle === "identified"
                      ? "underline underline-offset-6 text-main-500"
                      : "text-black  hover:underline hover:underline-offset-6"
                  }`}
                >
                  Identified
                </button>
                <button
                  onClick={() => setMessageToggle("anonymous")}
                  className={`px-3 py-2 rounded-md font-semibold text-[18px] transition ${
                    messageToggle === "anonymous"
                      ? "underline underline-offset-6 text-main-500"
                      : "text-black  hover:underline hover:underline-offset-6"
                  }`}
                >
                  Anonymous
                </button>
              </div>
            </div>
          </div>
          <div>{renderMessagesList()}</div>
        </div>
      </div>

      {/* Modal for message details */}
      {renderMessageDetail()}
    </div>
  );
}

export default Forms;
