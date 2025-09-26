/*-----------------------------------------------------------------------------------------------------
 | @file     services/donationService.ts
 | @brief    Service layer for donation-related API calls and business logic
 | @param    --
 | @return   Donation service functions for frontend components
 -----------------------------------------------------------------------------------------------------*/

import {
  type DonationResponse,
  type DonationHistoryQuery,
  type DonationHistoryResponse,
  type DonationStatisticsResponse,
  type FormValidationErrors,
  type DonationFormData,
} from "../types/donationTypes";

/*-----------------------------------------------------------------------------------------------------
 | @class DonationService
 | @brief    Service class handling all donation-related API interactions
 -----------------------------------------------------------------------------------------------------*/
export class DonationService {
  private static baseUrl = "/api";

  /*-----------------------------------------------------------------------------------------------------
   | @function validateDonationForm
   | @brief    Client-side validation for donation form data
   | @param    data - Donation form data to validate
   | @return   Object containing validation result and errors
   -----------------------------------------------------------------------------------------------------*/
  static validateDonationForm(data: DonationFormData): {
    isValid: boolean;
    errors: FormValidationErrors;
  } {
    const errors: FormValidationErrors = {};

    // Amount validation
    if (!data.amount || data.amount < 100) {
      errors.amount = "Amount must be at least 100 XAF";
    }
    if (data.amount > 10000000) {
      errors.amount = "Amount cannot exceed 10,000,000 XAF";
    }

    // Phone validation (Cameroon mobile numbers: 6XXXXXXXX)
    const phoneRegex = /^6[\d]{8}$/;
    if (!data.phone) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(data.phone)) {
      errors.phone = "Please enter a valid Cameroon mobile number (6XXXXXXXX)";
    }

    // Donor name validation (optional)
    if (
      data.donorName &&
      (data.donorName.length < 2 || data.donorName.length > 100)
    ) {
      errors.donorName = "Donor name must be between 2 and 100 characters";
    }

    // Email validation (optional)
    if (
      data.donorEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.donorEmail)
    ) {
      errors.donorEmail = "Please enter a valid email address";
    }

    // Message validation (optional)
    if (data.message && data.message.length > 500) {
      errors.message = "Message cannot exceed 500 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function makeDonation
   | @brief    Submit donation request to backend API
   | @param    donationData - Validated donation form data
   | @return   Promise<DonationResponse> - API response with transaction details
   -----------------------------------------------------------------------------------------------------*/
  static async makeDonation(
    donationData: DonationFormData
  ): Promise<DonationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/donations/direct-pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          amount: donationData.amount,
          phone: donationData.phone,
          donorName: donationData.donorName || undefined,
          donorEmail: donationData.donorEmail || undefined,
          message: donationData.message || undefined,
          isAnonymous: donationData.isAnonymous || false,
        }),
      });

      const result: DonationResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      console.error("Donation submission error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to process donation. Please try again."
      );
    }
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function getDonationHistory
   | @brief    Fetch donation history with filtering and pagination (Admin only)
   | @param    query - Query parameters for filtering and pagination
   | @param    authToken - Admin authentication token
   | @return   Promise<DonationHistoryResponse> - Paginated donation history
   -----------------------------------------------------------------------------------------------------*/
  static async getDonationHistory(
    query: DonationHistoryQuery = {},
    authToken: string
  ): Promise<DonationHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(
        `${this.baseUrl}/donations/history?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result: DonationHistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      console.error("Get donation history error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch donation history"
      );
    }
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function getDonationStatistics
   | @brief    Fetch donation statistics for admin dashboard
   | @param    startDate - Optional start date for statistics (YYYY-MM-DD)
   | @param    endDate - Optional end date for statistics (YYYY-MM-DD)
   | @param    authToken - Admin authentication token
   | @return   Promise<DonationStatisticsResponse> - Donation statistics data
   -----------------------------------------------------------------------------------------------------*/
  static async getDonationStatistics(
    startDate?: string,
    endDate?: string,
    authToken?: string
  ): Promise<DonationStatisticsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${this.baseUrl}/donations/statistics?${queryParams.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      const result: DonationStatisticsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      console.error("Get donation statistics error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch donation statistics"
      );
    }
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function updateDonationStatus
   | @brief    Update donation status by checking with payment provider (Admin only)
   | @param    transactionId - Transaction identifier to update
   | @param    authToken - Admin authentication token
   | @return   Promise<DonationResponse> - Updated donation status
   -----------------------------------------------------------------------------------------------------*/
  static async updateDonationStatus(
    transactionId: string,
    authToken: string
  ): Promise<DonationResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/donations/status/${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const result: DonationResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      return result;
    } catch (error) {
      console.error("Update donation status error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to update donation status"
      );
    }
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function formatCurrency
   | @brief    Format amount as XAF currency string
   | @param    amount - Amount to format
   | @return   Formatted currency string
   -----------------------------------------------------------------------------------------------------*/
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function formatPhoneNumber
   | @brief    Format Cameroon phone number for display
   | @param    phone - Raw phone number (6XXXXXXXX)
   | @return   Formatted phone number string
   -----------------------------------------------------------------------------------------------------*/
  static formatPhoneNumber(phone: string): string {
    if (phone.length === 9 && phone.startsWith("6")) {
      return `6 ${phone.slice(1, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)}`;
    }
    return phone;
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function getStatusColor
   | @brief    Get appropriate color class for donation status
   | @param    status - Donation status
   | @return   Tailwind CSS color class string
   -----------------------------------------------------------------------------------------------------*/
  static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "successful":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function validateDateRange
   | @brief    Validate date range for queries
   | @param    startDate - Start date string (YYYY-MM-DD)
   | @param    endDate - End date string (YYYY-MM-DD)
   | @return   Object containing validation result and error message
   -----------------------------------------------------------------------------------------------------*/
  static validateDateRange(
    startDate?: string,
    endDate?: string
  ): { isValid: boolean; error?: string } {
    if (!startDate && !endDate) {
      return { isValid: true };
    }

    if (startDate && !endDate) {
      return {
        isValid: false,
        error: "End date is required when start date is provided",
      };
    }

    if (!startDate && endDate) {
      return {
        isValid: false,
        error: "Start date is required when end date is provided",
      };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        return { isValid: false, error: "Start date must be before end date" };
      }

      // Check if dates are not too far in the future
      const today = new Date();
      if (start > today || end > today) {
        return { isValid: false, error: "Dates cannot be in the future" };
      }
    }

    return { isValid: true };
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function debounce
   | @brief    Debounce function for search inputs and API calls
   | @param    func - Function to debounce
   | @param    wait - Milliseconds to wait
   | @return   Debounced function
   -----------------------------------------------------------------------------------------------------*/
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function generateReceiptId
   | @brief    Generate a simple receipt ID for successful donations
   | @param    transactionId - Original transaction ID
   | @return   Formatted receipt ID
   -----------------------------------------------------------------------------------------------------*/
  static generateReceiptId(transactionId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const shortId = transactionId.slice(-4).toUpperCase();
    return `REC-${shortId}-${timestamp}`;
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function isValidTransactionId
   | @brief    Validate transaction ID format
   | @param    transactionId - Transaction ID to validate
   | @return   Boolean indicating if transaction ID is valid
   -----------------------------------------------------------------------------------------------------*/
  static isValidTransactionId(transactionId: string): boolean {
    return /^[a-zA-Z0-9]{8,10}$/.test(transactionId);
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function calculateSuccessRate
   | @brief    Calculate success rate from donation statistics
   | @param    successful - Number of successful donations
   | @param    total - Total number of donations
   | @return   Success rate percentage
   -----------------------------------------------------------------------------------------------------*/
  static calculateSuccessRate(successful: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
  }

  /*-----------------------------------------------------------------------------------------------------
   | @function getRetryDelay
   | @brief    Calculate exponential backoff delay for API retries
   | @param    attempt - Current attempt number (starting from 1)
   | @param    baseDelay - Base delay in milliseconds
   | @return   Delay in milliseconds
   -----------------------------------------------------------------------------------------------------*/
  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return baseDelay * Math.pow(2, attempt - 1);
  }
}
