export type ErrorFirstTuplePromise<T, E = Error> = Promise<[E, T]>
export type ErrorFirstTuple<T, E = Error | null> = [E, T]

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
