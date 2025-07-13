import { fromZonedTime } from "date-fns-tz"
import { ErrorFirstTuple, ReversalRequest } from "@/types"
import { addDays, addHours, getDay, getHours, isBefore, isWithinInterval, parse, setHours } from "date-fns";

const NEW_TOS_EPOCH_DATE = new Date('2020-01-03');

// Using a LUT here to map the customerTZ to the correct timezone
// Better approach is to use IANA timezone names, as below:
const TZ_LOOKUP = {
  'US (PST)': { IANA: 'America/Los_Angeles', format: 'MM/dd/yyyy' },
  'US (EST)': { IANA: 'America/New_York', format: 'MM/dd/yyyy' },
  'Europe (CET)': { IANA: 'Europe/Paris', format: 'dd/MM/yyyy' },
  'Europe (GMT)': { IANA: 'Europe/London', format: 'dd/MM/yyyy' },
}

/**
 * Determines if the user is on the new TOS based on their signup date.
 * @param request - The reversal request to check.
 * @returns A tuple containing an error (if any) and a boolean indicating if the user is on the new TOS.
 */
export const isNewTOS = (request: ReversalRequest): ErrorFirstTuple<boolean> => {
  const lookup = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!lookup?.IANA) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), undefined];
  }

  // Zone from the customer's tz to the system tz, ensuring consistency in date comparisons:
  const signupDate = parse(request.signupDate, lookup.format, new Date());
  const signupDateZoned = fromZonedTime(signupDate, lookup.IANA);

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
 * Returns the next business day's 9am date.
 * @param date - The date to check.
 * @returns A tuple containing an error (if any) and the next business day's 9am date.
 */
export const getNextBusinessDay9am = (date: Date): ErrorFirstTuple<Date> => {
  const dayOfWeek = getDay(date);
  const hour = getHours(date);

  if (dayOfWeek === 0) {
    return [undefined, setHours(addDays(date, 1), 9)] // Sunday -> Monday
  } else if (dayOfWeek === 5) {
    if (hour < 9) {
      return [undefined, setHours(date, 9)] // Friday before 9am -> Friday 9am
    } else {
      return [undefined, setHours(addDays(date, 3), 9)] // Friday after 5pm -> Monday
    }
  } else if (dayOfWeek === 6) {
    return [undefined, setHours(addDays(date, 2), 9)] // Saturday -> Monday
  } else if (hour < 9) {
    return [undefined, setHours(date, 9)] // before 9am -> 9am
  } else {
    return [undefined, setHours(addDays(date, 1), 9)] // after 5pm -> next day 9am
  }
}

/**
 * Returns the effective request time (UK time) depending on the source.
 * @param request - The reversal request to check.
 * @returns A tuple containing an error (if any) and the effective request time.
 */
export const getEffectiveRequestTime = (request: ReversalRequest): ErrorFirstTuple<Date> => {
  const { IANA, format } = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!IANA) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), undefined];
  }

  const requestDate = parse(`${request.requestDate} ${request.requestTime}`, `${format} HH:mm`, new Date());
  const requestDateZoned = fromZonedTime(requestDate, IANA);

  if (request.source === 'web app') {
    return [undefined, requestDateZoned] // passing on the request date as-is
  } else if (request.source === 'phone') {
    const [outOfHoursError, outOfHours] = isOutOfHours(requestDateZoned);

    if (outOfHoursError) {
      return [outOfHoursError, undefined]
    }

    if (!outOfHours) {
      return [undefined, requestDateZoned] // pass on as is as it's not out of hours
    }

    return getNextBusinessDay9am(requestDateZoned)
  }

  return [new Error(`Unknown source: ${request.source}`), undefined];
}

/**
 * Determines if the user is eligible for a refund based on their request.
 * @param request - The reversal request to check.
 * @returns A boolean indicating if the user is eligible for a refund.
 */
export const determineRefundEligibility = (request: ReversalRequest): ErrorFirstTuple<boolean> => {
  const { IANA, format } = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!IANA) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), undefined];
  }

  const investmentDate = parse(`${request.investmentDate} ${request.investmentTime}`, `${format} HH:mm`, new Date());
  const investmentDateZoned = fromZonedTime(investmentDate, IANA);

  const [requestError, requestDate] = getEffectiveRequestTime(request);
  if (requestError) {
    return [requestError, undefined]
  }

  const [newTOSError, usingNewTOS] = isNewTOS(request);
  if (newTOSError) {
    return [newTOSError, undefined]
  }

  let hoursToAdd: number;

  if (request.source === 'web app') {
    if (usingNewTOS) {
      hoursToAdd = 16 // 16 hours after investment
    } else {
      hoursToAdd = 8 // 8 hours after investment
    }
  } else if (request.source === 'phone') {
    if (usingNewTOS) {
      hoursToAdd = 24 // 24 hours after investment
    } else {
      hoursToAdd = 4 // 4 hours after investment
    }
  } else {
    return [new Error(`Unknown source: ${request.source}`), undefined]
  }

  return [undefined, isWithinInterval(requestDate, { start: investmentDateZoned, end: addHours(investmentDateZoned, hoursToAdd) })]
}
