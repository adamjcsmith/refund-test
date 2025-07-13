import { fromZonedTime } from "date-fns-tz"
import { ErrorFirstTuple, ReversalRequest } from "@/types"
import { getDay, getHours, isBefore } from "date-fns";

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
    return [new Error(`Unknown timezone: ${request.customerTZ}`), undefined];
  }

  // Zone from the customer's tz to the system tz, ensuring consistency in date comparisons:
  const signupDate = new Date(request.signupDate);
  const signupDateZoned = fromZonedTime(signupDate, IANA_TZ);

  const isOldTOS = isBefore(signupDateZoned, NEW_TOS_EPOCH_DATE);

  return [undefined, !isOldTOS]
}

/**
 * Determines if the date is out of hours, e.g. before 9am or after 5pm on a weekday, or any weekend day.
 * @param date - The date to check.
 * @returns A tuple containing an error (if any) and a boolean indicating if the date is out of hours.
 */
export const isOutOfHours = (date: Date): ErrorFirstTuple<boolean> => {
  const dayOfWeek = getDay(date);
  const hour = getHours(date);

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [undefined, true]
  }

  if (hour < 9 || hour >= 17) {
    return [undefined, true]
  }

  return [undefined, false]
}

/**
 * Returns the effective request time (UK time) depending on the source.
 * @param request - The reversal request to check.
 * @returns A tuple containing an error (if any) and the effective request time.
 */
export const getEffectiveRequestTime = (request: ReversalRequest): ErrorFirstTuple<Date> => {
  const IANA_TZ = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!IANA_TZ) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), undefined];
  }

  const requestDate = new Date(`${request.requestDate} ${request.requestTime}`);
  const requestDateZoned = fromZonedTime(requestDate, IANA_TZ);

  if (request.source === 'web app') {
    return [undefined, requestDateZoned]
  } else if (request.source === 'phone') {
    return [undefined, requestDateZoned] // TODO: implement
  }

  return [new Error(`Unknown source: ${request.source}`), undefined];
}


/**
 * Determines if the user is eligible for a refund based on their request.
 * @param request - The reversal request to check.
 * @returns A boolean indicating if the user is eligible for a refund.
 */
export const determineRefundEligibility = (request: ReversalRequest): boolean => {
  console.log('Checking eligibility for request:', request.name);
  return false
}
