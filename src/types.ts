export type ErrorFirstTuplePromise<T, E = Error> = Promise<[E, undefined]> | Promise<[undefined, T]>
export type ErrorFirstTuple<T, E = Error | null> = [E, undefined] | [undefined, T]

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
