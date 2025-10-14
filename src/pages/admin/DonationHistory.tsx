/*-----------------------------------------------------------------------------------------------------
 | @component DonationHistory
 | @brief    Admin panel page for viewing donation history, calculating totals, and managing withdrawals
 | @param    --
 | @return   Donation history admin page JSX element
 -----------------------------------------------------------------------------------------------------*/

"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../lib/api";
import axiosInstance from "../../lib/axiosInstance";

interface Transaction {
  id: string;
  status: "pending" | "completed" | "failed" | "expired";
  amount: number;
  donorName: string;
  donorEmail: string;
  phone: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

function DonationHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDonations, setTotalDonations] = useState(0);
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/donations/history`
      );
      setTransactions(response.data.transactions);

      // Calculate total from successful donations
      const successfulDonations = response.data.transactions.filter(
        (t: Transaction) => t.status === "completed"
      );
      const total = successfulDonations.reduce(
        (sum: number, t: Transaction) => sum + t.amount,
        0
      );
      setTotalDonations(total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/api/payments/balance`
      );
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }

    setWithdrawing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/withdraw`, {
        amount: Number(withdrawAmount),
      });

      if (response.data.success) {
        alert("Withdrawal request submitted successfully");
        setWithdrawAmount("");
        fetchBalance(); // Refresh balance
      } else {
        alert("Withdrawal failed: " + response.data.message);
      }
    } catch (error: any) {
      alert(
        "Withdrawal error: " +
          (error.response?.data?.message || "Network error")
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString() + " CFA";
  };

  if (loading) {
    return (
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            DONATION HISTORY
          </h1>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      All
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaigns
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Contributed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Donated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {transaction.donorName.charAt(0)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.donorName.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 font-mono">
                          {transaction.id}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/*Balance */}
            <div>
              <span>{balance}</span>
            </div>
            {/* Total and Withdrawal Section */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    Total Donations:{" "}
                    <span className="text-blue-600">
                      {formatAmount(totalDonations)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Withdraw Donations</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Enter recipient account number
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {withdrawing ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationHistory;
