/* eslint-disable camelcase */
import {EventEmitter} from 'events';
import {
  HttpClientInterface,
  HttpClientResponseInterface,
} from '../src/net/HttpClient.js';

export type AppInfo = {name?: string} & Record<string, unknown>;
export type BufferedFile = {
  name: string;
  type: string;
  file: {data: Uint8Array};
};
export type MethodSpec = {
  method: string;
  methodType?: string;
  urlParams?: Array<string>;
  path?: string;
  fullPath?: string;
  encode?: (data: RequestData) => RequestData;
  validator?: (data: RequestData, options: {headers: RequestHeaders}) => void;
  headers?: Record<string, string>;
  streaming?: boolean;
  host?: string;
  transformResponseData?: (response: HttpClientResponseInterface) => any;
};
export type MultipartRequestData = RequestData | StreamingFile | BufferedFile;
export type RawErrorType =
  | 'invalid_request_error'
  | 'api_error'
  | 'rate_limit_error'
  | 'authentication_error';
export type RequestArgs = Array<any>;
export type RequestCallback = (
  this: void,
  error: Error | null,
  response?: any
) => RequestCallbackReturn;
export type RequestCallbackReturn = any;
export type RequestData = Record<string, any>;
export type RequestEvent = {
  api_version?: string;
  account?: string;
  method?: string;
  path?: string;
  request_start_time: number;
};
export type RequestHeaders = Record<string, string | number | string[]>;
export type RequestOptions = {
  settings?: RequestSettings;
  streaming?: boolean;
  headers?: RequestHeaders;
};
export type RequestOpts = {
  requestMethod: string;
  requestPath: string;
  bodyData: RequestData;
  queryData: RequestData;
  auth: string | null;
  headers: RequestHeaders;
  host: string | null;
  streaming: boolean;
  settings: RequestSettings;
};
export type RequestSettings = {timeout?: number; maxNetworkRetries?: number};
export type ResponseEvent = {
  api_version?: string;
  account?: string;
  method?: string;
  path?: string;
  status?: number;
  request_id?: string;
  elapsed: number;
  request_start_time?: number;
  request_end_time?: number;
};
export type ResponseHeaderValue = string | string[];
export type ResponseHeaders = Record<string, ResponseHeaderValue>;
export type StreamingFile = {
  name: string;
  type: string;
  file: {data: EventEmitter};
};
export type LotrConstructor = {
  new (key: string, config: Record<string, unknown>): LotrObject;
};
declare const Lotr: LotrConstructor;
export type LotrObject = {
  getClientUserAgentSeeded: (
    seed: Record<string, string | boolean | null>,
    callback: (userAgent: string) => void
  ) => void;
  getClientUserAgent: (callback: (clientUserAgent: string) => void) => void;
  getTelemetryEnabled: () => boolean;
  getAppInfoAsString: () => string;
  getInitialNetworkRetryDelay: () => number;
  getMaxNetworkRetryDelay: () => number;
  getMaxNetworkRetries: () => number;
  getConstant: <T = string>(name: string) => T;
  _setApiField: <K extends keyof LotrObject['_api']>(
    name: K,
    value: LotrObject['_api'][K]
  ) => void;
  getApiField: <K extends keyof LotrObject['_api']>(
    key: K
  ) => LotrObject['_api'][K];
  _setApiNumberField: (name: string, value: number) => unknown;
  _appInfo: any;
  on: any;
  off: any;
  once: any;
  VERSION: string;
  LotrResource: LotrResourceConstructor;
  errors: any;
  webhooks: any;
  _prepResources: () => void;
  _setAppInfo: (appInfo: AppInfo) => void;
  _setApiKey: (apiKey: string) => void;
  _prevRequestMetrics: Array<{
    request_id: string;
    request_duration_ms: number;
  }>;
  _api: {
    auth: string | null;
    host: string;
    port: string | number;
    protocol: string;
    basePath: string;
    version: string;
    timeout: number;
    maxNetworkRetries: number;
    agent: string;
    httpClient: any;
    dev: boolean;
    lotrAccount: string | null;
  };
  _emitter: EventEmitter;
  _enableTelemetry: boolean;
  _requestSender: RequestSender;
  _getPropsFromConfig: (config: Record<string, unknown>) => UserProvidedConfig;
  _clientId?: string;
};
export type RequestSender = {
  _request(
    method: string,
    host: string | null,
    path: string,
    data: RequestData,
    auth: string | null,
    options: RequestOptions,
    callback: RequestCallback,
    requestDataProcessor: RequestDataProcessor | undefined
  ): void;
};
export type LotrRawError = {
  message?: string;
  type?: RawErrorType;
  headers?: {[header: string]: string};
  statusCode?: number;
  requestId?: string;
  code?: string;
  doc_url?: string;
  decline_code?: string;
  param?: string;
  detail?: string | Error;
  source?: any;
  exception?: any;
};
export type LotrResourceConstructor = {
  new (lotr: LotrObject, deprecatedUrlData?: never): LotrResourceObject;
};
export type LotrResourceObject = {
  _lotr: LotrObject;
  basePath: UrlInterpolator;
  path: UrlInterpolator;
  resourcePath: string;
  createResourcePathWithSymbols: (path: string | null | undefined) => string;
  createFullPath: (
    interpolator: UrlInterpolator,
    urlData: RequestData
  ) => string;
  initialize: (...args: Array<any>) => void;
  _joinUrlParts: (urlParts: string[]) => string;
  requestDataProcessor: null | RequestDataProcessor;
  _makeRequest(
    requestArgs: RequestArgs,
    spec: MethodSpec,
    overrideData: RequestData
  ): Promise<any>;
  _getRequestOpts(
    requestArgs: RequestArgs,
    spec: MethodSpec,
    overrideData: RequestData
  ): RequestOpts;
};
export type RequestDataProcessor = (
  method: string,
  data: RequestData,
  headers: RequestHeaders | undefined,
  prepareAndMakeRequest: (error: Error | null, data: string) => void
) => void;
export type UrlInterpolator = (params: Record<string, unknown>) => string;
export type UserProvidedConfig = {
  apiVersion?: string;
  protocol?: string;
  host?: string;
  httpAgent?: any;
  timeout?: number;
  port?: number;
  maxNetworkRetries?: number;
  httpClient?: HttpClientInterface;
  lotrAccount?: string;
  typescript?: boolean;
  telemetry?: boolean;
  appInfo?: AppInfo;
};
