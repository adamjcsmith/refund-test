import { fromZonedTime } from "date-fns-tz"
import { ErrorFirstTuple, ReversalRequest } from "@/types"
import { isBefore } from "date-fns";

const NEW_TOS_EPOCH_DATE = new Date('2020-01-03');

// Using a LUT here to map the customerTZ to the correct timezone
// Better approach is to use IANA timezone names, as below:
const TZ_LOOKUP = {
  'US (PST)': 'America/Los_Angeles',
  'US (EST)': 'America/New_York',
  'Europe (CET)': 'Europe/Paris',
  'Europe (GMT)': 'Europe/London',
}

/**
 * Determines if the user is on the new TOS based on their signup date.
 * @param request - The reversal request to check.
 * @returns A tuple containing an error (if any) and a boolean indicating if the user is on the new TOS.
 */
export const isNewTOS = (request: ReversalRequest): ErrorFirstTuple<boolean> => {
  const IANA_TZ = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!IANA_TZ) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), false];
  }

  // Zone from the customer's tz to the system tz, ensuring consistency in date comparisons:
  const signupDate = new Date(request.signupDate);
  const signupDateZoned = fromZonedTime(signupDate, IANA_TZ);

  const isOldTOS = isBefore(signupDateZoned, NEW_TOS_EPOCH_DATE);

  return [null, !isOldTOS]
}

export const determineRefundEligibility = (request: ReversalRequest): boolean => {
  console.log('Checking eligibility for request:', request.name);
  return false
}
