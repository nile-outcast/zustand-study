export interface ApiCallSuccessResponse<D> {
  isError: false
  data: D
  isCancelled?: never
}

export interface ApiCallErrorResponse<E extends Error> {
  isError: true
  data?: E
  isCancelled?: never
  rawError?: unknown
}

export interface ApiCallCancelledResponse {
  isError: true
  isCancelled: true
  rawError?: unknown
}

export type ApiCallResponse<D, E extends Error = Error> =
  ApiCallSuccessResponse<D> | ApiCallErrorResponse<E> | ApiCallCancelledResponse
