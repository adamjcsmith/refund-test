import { ErrorFirstTuple, ReversalRequest } from "@/types"

// Using a LUT here to map the customerTZ to the correct timezone.
// This is a simple lookup table and will need to be updated if we add more timezones,
// or better yet use an IANA timezone name, like below:
const TZ_LOOKUP = {
  'US (PST)': 'America/Los_Angeles',
  'US (EST)': 'America/New_York',
  'Europe (CET)': 'Europe/Paris',
  'Europe (GMT)': 'Europe/London',
}

export const isNewTOS = (request: ReversalRequest): ErrorFirstTuple<boolean> => {
  // If the user has signed up before 2/1/2020 (UK) or 1/2/2020 (US) then they are on the old TOS
  // Otherwise, they are on the new TOS. We can use the customerTZ to determine the correct date.

  const IANA_TZ = TZ_LOOKUP[request.customerTZ as keyof typeof TZ_LOOKUP];
  if (!IANA_TZ) {
    return [new Error(`Unknown timezone: ${request.customerTZ}`), false];
  }

  return [new Error("Not implemented"), true]
}

export const determineRefundEligibility = (request: ReversalRequest): boolean => {
  console.log('Checking eligibility for request:', request.name);
  return false
}
