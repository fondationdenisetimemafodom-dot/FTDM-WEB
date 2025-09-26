/*-----------------------------------------------------------------------------------------------------
 | @file     types/donationTypes.ts
 | @brief    TypeScript interface definitions for donation system components
 | @param    --
 | @return   Type definitions for donation-related data structures
 -----------------------------------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationFormData
 | @brief    Interface for donation form input data structure
 | @param    amount - Donation amount in XAF (minimum 100)
 | @param    phone - Cameroon mobile money phone number (6xxxxxxxx format)
 | @param    donorName - Optional donor full name (2-100 characters)
 | @param    donorEmail - Optional donor email address
 | @param    message - Optional donation message (max 500 characters)
 | @param    isAnonymous - Boolean flag for anonymous donation
 -----------------------------------------------------------------------------------------------------*/
export interface DonationFormData {
  amount: number;
  phone: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  isAnonymous?: boolean;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationResponse
 | @brief    Interface for donation API response structure
 | @param    success - Boolean indicating if donation request was successful
 | @param    message - Human-readable response message
 | @param    transactionId - Unique identifier for the transaction
 | @param    paymentUrl - Mobile money payment URL for user redirection
 | @param    data - Additional response data from payment provider
 | @param    errors - Array of validation or processing errors
 -----------------------------------------------------------------------------------------------------*/
export interface DonationResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  paymentUrl?: string;
  data?: {
    amount: number;
    currency: string;
    status: DonationStatus;
    createdAt: string;
    expiresAt?: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/*-----------------------------------------------------------------------------------------------------
 | @enum DonationStatus
 | @brief    Enumeration of possible donation status values
 | @param    PENDING - Payment initiated, awaiting confirmation
 | @param    SUCCESSFUL - Payment completed successfully
 | @param    FAILED - Payment failed or was declined
 | @param    EXPIRED - Payment session expired without completion
 -----------------------------------------------------------------------------------------------------*/
export enum DonationStatus {
  PENDING = "pending",
  SUCCESSFUL = "successful",
  FAILED = "failed",
  EXPIRED = "expired",
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationRecord
 | @brief    Interface for complete donation record from database
 | @param    id - Unique database identifier
 | @param    transactionId - External payment provider transaction ID
 | @param    amount - Donation amount in XAF
 | @param    phone - Donor's mobile money phone number
 | @param    donorName - Donor's name (null if anonymous)
 | @param    donorEmail - Donor's email address
 | @param    message - Donation message from donor
 | @param    isAnonymous - Whether donation is anonymous
 | @param    status - Current status of the donation
 | @param    createdAt - Timestamp when donation was created
 | @param    updatedAt - Timestamp when donation was last updated
 | @param    completedAt - Timestamp when donation was completed (if applicable)
 -----------------------------------------------------------------------------------------------------*/
export interface DonationRecord {
  id: string;
  transactionId: string;
  amount: number;
  phone: string;
  donorName: string | null;
  donorEmail: string | null;
  message: string | null;
  isAnonymous: boolean;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationHistoryQuery
 | @brief    Interface for donation history API query parameters
 | @param    page - Page number for pagination (default: 1)
 | @param    limit - Number of records per page (1-100, default: 20)
 | @param    status - Filter by donation status
 | @param    startDate - Filter donations from this date (YYYY-MM-DD)
 | @param    endDate - Filter donations until this date (YYYY-MM-DD)
 | @param    minAmount - Filter donations above this amount
 | @param    maxAmount - Filter donations below this amount
 | @param    search - Search in donor names and messages
 -----------------------------------------------------------------------------------------------------*/
export interface DonationHistoryQuery {
  page?: number;
  limit?: number;
  status?: DonationStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationHistoryResponse
 | @brief    Interface for donation history API response
 | @param    success - Boolean indicating if request was successful
 | @param    data - Array of donation records
 | @param    pagination - Pagination metadata
 | @param    message - Response message
 -----------------------------------------------------------------------------------------------------*/
export interface DonationHistoryResponse {
  success: boolean;
  data: DonationRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationStatistics
 | @brief    Interface for donation statistics data structure
 | @param    totalAmount - Total amount donated in the period
 | @param    totalDonations - Total number of donations
 | @param    successfulDonations - Number of successful donations
 | @param    pendingDonations - Number of pending donations
 | @param    failedDonations - Number of failed donations
 | @param    averageAmount - Average donation amount
 | @param    topDonation - Highest single donation amount
 | @param    dailyStats - Array of daily donation statistics
 -----------------------------------------------------------------------------------------------------*/
export interface DonationStatistics {
  totalAmount: number;
  totalDonations: number;
  successfulDonations: number;
  pendingDonations: number;
  failedDonations: number;
  expiredDonations: number;
  averageAmount: number;
  topDonation: number;
  dailyStats?: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface DonationStatisticsResponse
 | @brief    Interface for donation statistics API response
 | @param    success - Boolean indicating if request was successful
 | @param    data - Statistics data object
 | @param    period - Time period for the statistics
 | @param    message - Response message
 -----------------------------------------------------------------------------------------------------*/
export interface DonationStatisticsResponse {
  success: boolean;
  data: DonationStatistics;
  period: {
    startDate: string;
    endDate: string;
  };
  message: string;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface FormValidationErrors
 | @brief    Interface for form validation error structure
 | @param    Dynamic keys mapping field names to error messages
 -----------------------------------------------------------------------------------------------------*/
export interface FormValidationErrors {
  [key: string]: string | undefined;
  amount?: string;
  phone?: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
  general?: string;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface PaymentProviderConfig
 | @brief    Interface for payment provider configuration
 | @param    apiUrl - Base URL for payment provider API
 | @param    apiKey - API key for authentication
 | @param    webhookSecret - Secret key for webhook signature validation
 | @param    timeout - Request timeout in milliseconds
 -----------------------------------------------------------------------------------------------------*/
export interface PaymentProviderConfig {
  apiUrl: string;
  apiKey: string;
  webhookSecret?: string;
  timeout: number;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface WebhookPayload
 | @brief    Interface for webhook notification payload from Fapshi
 | @param    transactionId - Transaction identifier
 | @param    status - Updated transaction status
 | @param    amount - Transaction amount
 | @param    currency - Transaction currency
 | @param    timestamp - When the status change occurred
 | @param    signature - Webhook signature for verification
 -----------------------------------------------------------------------------------------------------*/
export interface WebhookPayload {
  transactionId: string;
  status: DonationStatus;
  amount: number;
  currency: string;
  timestamp: string;
  signature?: string;
  metadata?: {
    phone: string;
    provider: string;
    reference: string;
  };
}
