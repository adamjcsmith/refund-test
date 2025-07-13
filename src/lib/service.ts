import { ErrorFirstTuple, ReversalRequest } from "@/types"

export const isNewTOS = (request: ReversalRequest): ErrorFirstTuple<boolean> => {
  // TODO: Implement actual logic to determine if the request is from the new TOS
  console.log('Checking if request is from the new TOS:', request.name);
  return [new Error("Not implemented"), true]
}

export const determineRefundEligibility = (request: ReversalRequest): boolean => {
  // TODO: Implement actual refund eligibility logic
  console.log('Checking eligibility for request:', request.name);
  return false
}
