declare module 'lotr' {
  namespace LotrSDK {
    export type RawErrorType =
      | 'invalid_request_error'
      | 'api_error'
      | 'rate_limit_error'
      | 'authentication_error';

    export type LotrRawError = {
      message?: string;

      type: RawErrorType;

      headers?: {[header: string]: string};
      statusCode?: number;
      requestId?: string;
      code?: string;
      doc_code?: string;
      decline_code?: string;
      param?: string;
      detail?: string;
    };

    namespace errors {
      function generate(
        rawError: LotrRawError & {type: 'invalid_request_error'}
      ): LotrInvalidRequestError;
      function generate(
        rawError: LotrRawError & {type: 'api_error'}
      ): LotrAPIError;
      function generate(
        rawError: LotrRawError & {type: 'authentication_error'}
      ): LotrAuthenticationError;
      function generate(
        rawError: LotrRawError & {type: 'rate_limit_error'}
      ): LotrRateLimitError;
      function generate(
        rawError: LotrRawError & {type: RawErrorType}
      ): LotrError;

      class LotrError extends Error {
        constructor(rawError: LotrRawError);
        static generate(
          rawError: LotrRawError & {type: 'invalid_request_error'}
        ): LotrInvalidRequestError;
        static generate(
          rawError: LotrRawError & {type: 'api_error'}
        ): LotrAPIError;
        static generate(
          rawError: LotrRawError & {type: 'authentication_error'}
        ): LotrAuthenticationError;
        static generate(
          rawError: LotrRawError & {type: 'rate_limit_error'}
        ): LotrRateLimitError;
        static generate(
          rawError: LotrRawError & {type: RawErrorType}
        ): LotrError;

        /**
         * A human-readable message giving more details about the error. For card errors, these messages can
         * be shown to your users.
         */
        readonly message: string;

        readonly type:
          | 'LotrError'
          | 'LotrInvalidRequestError'
          | 'LotrAPIError'
          | 'LotrAuthenticationError'
          | 'LotrRateLimitError'
          | 'LotrConnectionError';

        /**
         * See the "error types" section of our docs for a list of types:
         */
        readonly rawType: RawErrorType;

        /**
         * For card errors, a short string describing the kind of card error that occurred.
         *
         */
        readonly code?: string;

        /**
         * A URL to more information about the error code reported.
         *
         */
        readonly doc_url?: string;

        /**
         * Typically a 4xx or 5xx.
         */
        readonly statusCode?: number;

        readonly raw: unknown;

        readonly headers: {
          [key: string]: string;
        };

        readonly requestId: string;

        /**
         * The parameter the error relates to if the error is parameter-specific. You can use this to display a
         * message near the correct form field, for example.
         */
        readonly param?: string;

        readonly source?: string;
      }

      /**
       * Invalid request errors arise when your request has invalid parameters.
       */
      class LotrInvalidRequestError extends LotrError {
        readonly type: 'LotrInvalidRequestError';
        readonly rawType: 'invalid_request_error';
      }

      /**
       * API errors cover any other type of problem (e.g., a temporary problem with Lotr's servers),
       * and are extremely uncommon.
       *
       * It could also be raised in the case that a new error has been introduced in the API,
       * but this version of the library doesn't know how to handle it.
       */
      class LotrAPIError extends LotrError {
        readonly type: 'LotrAPIError';
        readonly rawType: 'api_error';
      }

      /**
       * Failure to properly authenticate yourself in the request.
       */
      class LotrAuthenticationError extends LotrError {
        readonly type: 'LotrAuthenticationError';
        readonly rawType: 'authentication_error';
      }

      /**
       * Access was attempted on a resource that wasn't allowed.
       */
      class LotrPermissionError extends LotrError {
        readonly type: 'LotrPermissionError';
      }

      /**
       * Too many requests hit the API too quickly.
       * @docs https://Lotr.com/docs/rate-limits
       */
      class LotrRateLimitError extends LotrError {
        readonly type: 'LotrRateLimitError';
        readonly rawType: 'rate_limit_error';
      }

      /**
       * The library cannot connect to Lotr.
       * This can happen for a variety of reasons,
       * such as loss of network connectivity or a bad TLS certificate.
       */
      class LotrConnectionError extends LotrError {
        readonly type: 'LotrConnectionError';
      }
    }
  }
}
