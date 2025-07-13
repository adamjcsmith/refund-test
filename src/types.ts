export type ErrorFirstTuple<T> = [Error, undefined] | [undefined, T]

export interface ReversalRequest {
  name: string
  customerTZ: string
  signupDate: string
  source: string
  investmentDate: string
  investmentTime: string
  requestDate: string
  requestTime: string
}
