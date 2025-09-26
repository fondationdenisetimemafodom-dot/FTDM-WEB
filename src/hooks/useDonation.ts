/*-----------------------------------------------------------------------------------------------------
 | @file     hooks/useDonation.ts
 | @brief    Custom React hook for managing donation state and operations
 | @param    --
 | @return   Donation management hook with state and operations
 -----------------------------------------------------------------------------------------------------*/

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  type DonationFormData,
  type DonationResponse,
  type FormValidationErrors,
  type DonationStatus,
} from "../types/donationTypes";
import { DonationService } from "../services/donationService";

/*-----------------------------------------------------------------------------------------------------
 | @interface UseDonationState
 | @brief    Interface defining the state structure for donation hook
 -----------------------------------------------------------------------------------------------------*/
interface UseDonationState {
  formData: DonationFormData;
  errors: FormValidationErrors;
  isLoading: boolean;
  isSubmitted: boolean;
  lastTransactionId: string | null;
  submitCount: number;
}

/*-----------------------------------------------------------------------------------------------------
 | @interface UseDonationReturn
 | @brief    Interface defining the return structure for donation hook
 -----------------------------------------------------------------------------------------------------*/
interface UseDonationReturn {
  // State
  formData: DonationFormData;
  errors: FormValidationErrors;
  isLoading: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  lastTransactionId: string | null;

  // Actions
  updateField: (field: keyof DonationFormData, value: any) => void;
  updateFormData: (data: Partial<DonationFormData>) => void;
  validateForm: () => boolean;
  submitDonation: () => Promise<DonationResponse | null>;
  resetForm: () => void;
  clearErrors: () => void;
  clearFieldError: (field: keyof FormValidationErrors) => void;

  // Utilities
  formatCurrency: (amount: number) => string;
  formatPhoneNumber: (phone: string) => string;
  canSubmit: boolean;
}

/*-----------------------------------------------------------------------------------------------------
 | @hook useDonation
 | @brief    Custom hook providing donation form management and submission logic
 | @param    initialData - Optional initial form data
 | @return   UseDonationReturn - Hook state and operations
 -----------------------------------------------------------------------------------------------------*/
export const useDonation = (
  initialData?: Partial<DonationFormData>
): UseDonationReturn => {
  const { t } = useTranslation("donate");
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /*-----------------------------------------------------------------------------------------------------
   | @stateblock Hook State Management
   | @brief    State variables for donation form management
   -----------------------------------------------------------------------------------------------------*/
  const [state, setState] = useState<UseDonationState>({
    formData: {
      amount: initialData?.amount || 0,
      phone: initialData?.phone || "",
      donorName: initialData?.donorName || "",
      donorEmail: initialData?.donorEmail || "",
      message: initialData?.message || "",
      isAnonymous: initialData?.isAnonymous || false,
    },
    errors: {},
    isLoading: false,
    isSubmitted: false,
    lastTransactionId: null,
    submitCount: 0,
  });

  /*-----------------------------------------------------------------------------------------------------
   | @function updateField
   | @brief    Update a specific form field and clear its error
   | @param    field - Field name to update
   | @param    value - New value for the field
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const updateField = useCallback(
    (field: keyof DonationFormData, value: any) => {
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: field === "amount" ? parseFloat(value) || 0 : value,
        },
        errors: {
          ...prev.errors,
          [field]: undefined, // Clear error for this field
        },
        isSubmitted: false, // Reset submitted state when form changes
      }));
    },
    []
  );

  /*-----------------------------------------------------------------------------------------------------
   | @function updateFormData
   | @brief    Update multiple form fields at once
   | @param    data - Partial form data to merge
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const updateFormData = useCallback((data: Partial<DonationFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
      isSubmitted: false,
    }));
  }, []);

  /*-----------------------------------------------------------------------------------------------------
   | @function validateForm
   | @brief    Validate current form data and update error state
   | @return   Boolean indicating if form is valid
   -----------------------------------------------------------------------------------------------------*/
  const validateForm = useCallback((): boolean => {
    const validation = DonationService.validateDonationForm(state.formData);

    // Add custom translation-aware error messages
    const translatedErrors: FormValidationErrors = {};
    Object.entries(validation.errors).forEach(([field, error]) => {
      switch (field) {
        case "amount":
          translatedErrors[field] = t("validation.amountMin") || error;
          break;
        case "phone":
          translatedErrors[field] = t("validation.phoneInvalid") || error;
          break;
        case "donorEmail":
          translatedErrors[field] = t("validation.emailInvalid") || error;
          break;
        default:
          translatedErrors[field] = error;
      }
    });

    setState((prev) => ({
      ...prev,
      errors: translatedErrors,
    }));

    return validation.isValid;
  }, [state.formData, t]);

  /*-----------------------------------------------------------------------------------------------------
   | @function submitDonation
   | @brief    Submit donation with validation, loading states, and error handling
   | @return   Promise<DonationResponse | null> - API response or null if validation failed
   -----------------------------------------------------------------------------------------------------*/
  const submitDonation =
    useCallback(async (): Promise<DonationResponse | null> => {
      // Clear any existing timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      // Validate form before submission
      if (!validateForm()) {
        return null;
      }

      // Prevent double submissions
      if (state.isLoading) {
        return null;
      }

      // Rate limiting - prevent too many submissions
      if (state.submitCount >= 3) {
        setState((prev) => ({
          ...prev,
          errors: {
            general:
              t("errors.tooManyAttempts") ||
              "Too many attempts. Please wait before trying again.",
          },
        }));
        return null;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        errors: {},
        submitCount: prev.submitCount + 1,
      }));

      try {
        // Set a timeout for the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          submitTimeoutRef.current = setTimeout(() => {
            reject(
              new Error(
                "Request timed out. Please check your connection and try again."
              )
            );
          }, 30000); // 30 second timeout
        });

        const response = await Promise.race([
          DonationService.makeDonation(state.formData),
          timeoutPromise,
        ]);

        // Clear timeout on successful response
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
          submitTimeoutRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSubmitted: true,
          lastTransactionId: response.transactionId || null,
        }));

        return response;
      } catch (error) {
        console.error("Donation submission error:", error);

        // Clear timeout
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
          submitTimeoutRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          errors: {
            general:
              error instanceof Error ? error.message : t("errors.networkError"),
          },
        }));

        return null;
      }
    }, [state.formData, state.isLoading, state.submitCount, validateForm, t]);

  /*-----------------------------------------------------------------------------------------------------
   | @function resetForm
   | @brief    Reset form to initial state
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const resetForm = useCallback(() => {
    setState({
      formData: {
        amount: initialData?.amount || 0,
        phone: initialData?.phone || "",
        donorName: initialData?.donorName || "",
        donorEmail: initialData?.donorEmail || "",
        message: initialData?.message || "",
        isAnonymous: initialData?.isAnonymous || false,
      },
      errors: {},
      isLoading: false,
      isSubmitted: false,
      lastTransactionId: null,
      submitCount: 0,
    });
  }, [initialData]);

  /*-----------------------------------------------------------------------------------------------------
   | @function clearErrors
   | @brief    Clear all form errors
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  /*-----------------------------------------------------------------------------------------------------
   | @function clearFieldError
   | @brief    Clear error for a specific field
   | @param    field - Field name to clear error for
   | @return   void
   -----------------------------------------------------------------------------------------------------*/
  const clearFieldError = useCallback((field: keyof FormValidationErrors) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  }, []);

  /*-----------------------------------------------------------------------------------------------------
   | @computed isValid
   | @brief    Computed property indicating if current form data is valid
   -----------------------------------------------------------------------------------------------------*/
  const isValid = DonationService.validateDonationForm(state.formData).isValid;

  /*-----------------------------------------------------------------------------------------------------
   | @computed canSubmit
   | @brief    Computed property indicating if form can be submitted
   -----------------------------------------------------------------------------------------------------*/
  const canSubmit = isValid && !state.isLoading && state.submitCount < 3;

  /*-----------------------------------------------------------------------------------------------------
   | @cleanup Effect cleanup
   | @brief    Cleanup timeout on unmount
   -----------------------------------------------------------------------------------------------------*/
  // Note: In a real component, you would use useEffect for cleanup
  // useEffect(() => {
  //   return () => {
  //     if (submitTimeoutRef.current) {
  //       clearTimeout(submitTimeoutRef.current);
  //     }
  //   };
  // }, []);

  return {
    // State
    formData: state.formData,
    errors: state.errors,
    isLoading: state.isLoading,
    isSubmitted: state.isSubmitted,
    isValid,
    lastTransactionId: state.lastTransactionId,

    // Actions
    updateField,
    updateFormData,
    validateForm,
    submitDonation,
    resetForm,
    clearErrors,
    clearFieldError,

    // Utilities
    formatCurrency: DonationService.formatCurrency,
    formatPhoneNumber: DonationService.formatPhoneNumber,
    canSubmit,
  };
};
