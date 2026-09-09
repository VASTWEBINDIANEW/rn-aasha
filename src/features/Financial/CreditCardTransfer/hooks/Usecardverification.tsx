import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCcd } from '../../../../reduxUtils/store/userInfoSlice';

const HANDY_API_KEY = 'PUB-clhYIUTRQ8Ddl73wY2vmLsj';

export type CardDetails = {
  bank: string;
  scheme: string;
  type: string;
};

const DEFAULT_CARD_DETAILS: CardDetails = {
  bank: '-------',
  scheme: 'CARD',
  type: 'CREDIT',
};

// --------------------------------------------------
// Luhn Validation
// --------------------------------------------------

export const validateLuhn = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');

  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// --------------------------------------------------
// Offline Scheme Detection
// --------------------------------------------------

export const detectSchemeOffline = (number: string): string => {
  const clean = number.replace(/\D/g, '');

  if (/^4/.test(clean)) {
    return 'VISA';
  }

  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return 'MASTERCARD';
  }

  if (/^3[47]/.test(clean)) {
    return 'AMEX';
  }

  if (/^6(011|5|4[4-9])/.test(clean)) {
    return 'DISCOVER';
  }

  if (
    /^(508|60698|607|608|6521|6522|6523|6530|6531)/.test(clean)
  ) {
    return 'RUPAY';
  }

  return 'GENERIC';
};

// --------------------------------------------------
// Offline Card Type
// --------------------------------------------------

const detectTypeOffline = (scheme: string): string => {
  return scheme === 'AMEX' ? 'CHARGE CARD' : 'CREDIT';
};

// --------------------------------------------------
// Options
// --------------------------------------------------

interface UseCardVerificationOptions {
  apiUrl?: (bin: string) => string;
  debounceMs?: number;
  timeoutMs?: number;
}

// --------------------------------------------------
// Return Type
// --------------------------------------------------

interface UseCardVerificationResult {
  isValidCard: boolean | null;
  cardDetails: CardDetails;
  loading: boolean;
  error: string | null;
  checkCard: (rawNumber: string, targetLength?: number) => void;
  reset: () => void;
}

// --------------------------------------------------
// Hook
// --------------------------------------------------

export function useCardVerification(
  options: UseCardVerificationOptions = {},
): UseCardVerificationResult {
  const {
    apiUrl = (bin) => `https://data.handyapi.com/bin/${bin}`,
    debounceMs = 300,
    timeoutMs = 8000,
  } = options;

  const dispatch = useDispatch();

  const [isValidCard, setIsValidCard] = useState<boolean | null>(null);

  const [cardDetails, setCardDetails] =
    useState<CardDetails>(DEFAULT_CARD_DETAILS);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestIdRef = useRef(0);

  // --------------------------------------------------
  // Update Local State + Redux
  // --------------------------------------------------

  const updateCardDetails = useCallback(
    (details: CardDetails) => {
      console.log('CARD DETAILS:', details);

      // Local state
      setCardDetails(details);

      // Redux
      dispatch(setCcd(details));
    },
    [dispatch],
  );

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const reset = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Invalidate old API requests
    requestIdRef.current += 1;

    setIsValidCard(null);

    setCardDetails(DEFAULT_CARD_DETAILS);

    setError(null);

    setLoading(false);

    // Redux reset
    dispatch(setCcd(DEFAULT_CARD_DETAILS));
  }, [dispatch]);

  // --------------------------------------------------
  // API Verification
  // --------------------------------------------------

  const verifyWithAPI = useCallback(
    async (rawNumber: string) => {
      const isLuhnValid = validateLuhn(rawNumber);

      setIsValidCard(isLuhnValid);

      // ----------------------------------------------
      // Offline fallback
      // ----------------------------------------------

      const offlineScheme = detectSchemeOffline(rawNumber);

      const offlineFallback: CardDetails = {
        bank: 'BANK CARD',
        scheme: offlineScheme,
        type: detectTypeOffline(offlineScheme),
      };

      // ----------------------------------------------
      // Request ID
      // ----------------------------------------------

      const bin = rawNumber.substring(0, 6);

      const currentRequestId = ++requestIdRef.current;

      // ----------------------------------------------
      // Timeout
      // ----------------------------------------------

      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        setLoading(true);

        setError(null);

        console.log('BIN API CALL:', bin);

        // --------------------------------------------
        // API Call
        // --------------------------------------------

        const response = await fetch(apiUrl(bin), {
          method: 'GET',

          headers: {
            Accept: 'application/json',
            'x-api-key': HANDY_API_KEY,
          },

          signal: controller.signal,
        });

        // --------------------------------------------
        // Stale Request Check
        // --------------------------------------------

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // --------------------------------------------
        // HTTP Error
        // --------------------------------------------

        if (!response.ok) {
          console.log(
            'BIN API HTTP ERROR:',
            response.status,
          );

          setError(
            'Card lookup service returned an error; showing offline card details.',
          );

          // Local + Redux
          updateCardDetails(offlineFallback);

          return;
        }

        // --------------------------------------------
        // Parse Response
        // --------------------------------------------

        const data = await response.json();

        console.log('BIN API RESPONSE:', data);

        // --------------------------------------------
        // Stale Request Check Again
        // --------------------------------------------

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // --------------------------------------------
        // API SUCCESS
        // --------------------------------------------

        if (data?.Status === 'SUCCESS') {
          const apiCardDetails: CardDetails = {
            bank: data?.Issuer || 'VERIFIED BANK',

            scheme:
              data?.Scheme || offlineScheme,

            type:
              data?.Type ||
              detectTypeOffline(offlineScheme),
          };

          // Local + Redux
          updateCardDetails(apiCardDetails);

          console.log(
            'API CARD DETAILS SAVED:',
            apiCardDetails,
          );
        }

        // --------------------------------------------
        // API Response But Not SUCCESS
        // --------------------------------------------

        else {
          console.log(
            'BIN API did not return SUCCESS. Using offline.',
          );

          setError(
            'Card details could not be verified; showing offline card details.',
          );

          // Local + Redux
          updateCardDetails(offlineFallback);
        }
      } catch (err: any) {
        // --------------------------------------------
        // Stale Request
        // --------------------------------------------

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const isTimeout =
          err?.name === 'AbortError';

        console.log(
          'BIN API ERROR:',
          err,
        );

        // --------------------------------------------
        // Error Message
        // --------------------------------------------

        setError(
          isTimeout
            ? 'Card lookup timed out; showing offline card details.'
            : 'Could not connect to the server; offline card details are being displayed.',
        );

        // --------------------------------------------
        // Network / Timeout
        // Local + Redux
        // --------------------------------------------

        updateCardDetails(offlineFallback);
      } finally {
        clearTimeout(timeoutId);

        if (
          currentRequestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [
      apiUrl,
      timeoutMs,
      updateCardDetails,
    ],
  );

  // --------------------------------------------------
  // Check Card
  // --------------------------------------------------

  const checkCard = useCallback(
    (
      rawNumber: string,
      targetLength?: number,
    ) => {
      const cleanNumber =
        rawNumber.replace(/\D/g, '');

      const isAmex =
        /^3[47]/.test(cleanNumber);

      const minLength =
        targetLength ??
        (isAmex ? 15 : 16);

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      // ----------------------------------------------
      // Card Length Reached
      // ----------------------------------------------

      if (cleanNumber.length >= minLength) {
        debounceRef.current = setTimeout(() => {
          verifyWithAPI(cleanNumber);
        }, debounceMs);
      }

      // ----------------------------------------------
      // Card Length Not Reached
      // ----------------------------------------------

      else {
        reset();
      }
    },
    [
      verifyWithAPI,
      reset,
      debounceMs,
    ],
  );

  // --------------------------------------------------
  // Return
  // --------------------------------------------------

  return {
    isValidCard,
    cardDetails,
    loading,
    error,
    checkCard,
    reset,
  };
}