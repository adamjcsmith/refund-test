import { ReversalRequest } from "@/types"

const determineRefundEligibility = (request: ReversalRequest): boolean => {
  // TODO: Implement actual refund eligibility logic
  console.log('Checking eligibility for request:', request.name);
  return false
}

export { determineRefundEligibility }
