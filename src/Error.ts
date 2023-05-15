/* eslint-disable camelcase */

import {RawErrorType, LotrRawError} from './Types.js';

export const generate = (rawLotrError: LotrRawError): LotrError => {
  switch (rawLotrError.type) {
    case 'invalid_request_error':
      return new LotrInvalidRequestError(rawLotrError);
    case 'api_error':
      return new LotrAPIError(rawLotrError);
    case 'authentication_error':
      return new LotrAuthenticationError(rawLotrError);
    case 'rate_limit_error':
      return new LotrRateLimitError(rawLotrError);
    default:
      return new LotrUnknownError(rawLotrError);
  }
};

/**
 * LotrError is the base error from which all other more specific Lotr errors derive.
 * Specifically for errors returned from Lotr's REST API.
 */
export class LotrError extends Error {
  readonly message: string;
  readonly type: string;
  readonly raw: unknown;
  readonly rawType?: RawErrorType;
  readonly headers?: {[header: string]: string};
  readonly requestId?: string;

  readonly code?: string;
  readonly doc_url?: string;
  readonly param?: string;
  readonly detail?: string | Error;
  readonly statusCode?: number;
  readonly source?: string;

  constructor(raw: LotrRawError = {}) {
    super(raw.message);
    this.type = this.constructor.name;

    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    // @ts-ignore
    this.message = raw.message;

    this.source = raw.source;
  }

  /**
   * Helper factory which takes raw Lotr errors and outputs wrapping instances
   */
  static generate = generate;
}

// Specific Lotr Error types:

/**
 * CardError is raised when a user enters a card that can't be charged for
 * some reason.
 */
export class LotrCardError extends LotrError {}

/**
 * InvalidRequestError is raised when a request is initiated with invalid
 * parameters.
 */
export class LotrInvalidRequestError extends LotrError {}

/**
 * APIError is a generic error that may be raised in cases where none of the
 * other named errors cover the problem. It could also be raised in the case
 * that a new error has been introduced in the API, but this version of the
 * Node.JS SDK doesn't know how to handle it.
 */
export class LotrAPIError extends LotrError {}

/**
 * AuthenticationError is raised when invalid credentials are used to connect
 * to Lotr's servers.
 */
export class LotrAuthenticationError extends LotrError {}

/**
 * PermissionError is raised in cases where access was attempted on a resource
 * that wasn't allowed.
 */
export class LotrPermissionError extends LotrError {}

/**
 * RateLimitError is raised in cases where an account is putting too much load
 * on Lotr's API servers (usually by performing too many requests). Please
 * back off on request rate.
 */
export class LotrRateLimitError extends LotrError {}

/**
 * LotrConnectionError is raised in the event that the SDK can't connect to
 * Lotr's servers. That can be for a variety of different reasons from a
 * downed network to a bad TLS certificate.
 */
export class LotrConnectionError extends LotrError {}

/**
 * SignatureVerificationError is raised when the signature verification for a
 * webhook fails
 */
export class LotrSignatureVerificationError extends LotrError {
  header: string | Uint8Array;
  payload: string | Uint8Array;

  constructor(
    header: string | Uint8Array,
    payload: string | Uint8Array,
    raw: LotrRawError = {}
  ) {
    super(raw);
    this.header = header;
    this.payload = payload;
  }
}

/**
 * Any other error from Lotr not specifically captured above
 */
export class LotrUnknownError extends LotrError {}
