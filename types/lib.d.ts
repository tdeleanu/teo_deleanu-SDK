// /<reference lib="esnext.asynciterable" />
// /<reference types="node" />
import {Agent} from 'http';

declare module 'lotr' {
  namespace LotrSDK {
    type LotrResourceClass = typeof LotrResource;
    export type HttpAgent = Agent;
    export type HttpProtocol = 'http' | 'https';
    interface LotrResourceExtension<T extends Record<string, unknown>>
      extends LotrResourceClass {
      new (lotr: any): LotrResource & T;
    }

    export class LotrResource {
      static extend<T extends {[prop: string]: any}>(
        spec: T
      ): LotrResourceExtension<T>;

      static method<ResponseObject = Record<string, unknown>>(spec: {
        method: string;
        path?: string;
        fullPath?: string;
        methodType?: 'list';
      }): (...args: any[]) => Response<ResponseObject>; // eslint-disable-line @typescript-eslint/no-explicit-any

      static MAX_BUFFERED_REQUEST_METRICS: number;
    }

    export interface LotrConfig {
      apiKey: string;
      typescript?: true;
      maxNetworkRetries?: number;
      httpAgent?: HttpAgent;
      httpClient?: HttpClient;
      timeout?: number;
      host?: string;
      port?: string | number;
      protocol?: HttpProtocol;
      telemetry?: boolean;
      appInfo?: AppInfo;
      lotrAccount?: string;
    }

    export interface RequestOptions {
      apiKey?: string;
      lotrAccount?: string;
      apiVersion?: string;
      maxNetworkRetries?: number;
      timeout?: number;
      host?: string;
    }

    export type Response<T> = T & {
      lastResponse: {
        headers: {[key: string]: string};
        requestId: string;
        statusCode: number;
        apiVersion?: string;
        lotrAccount?: string;
      };
    };

    export interface ApiList<T> {
      object: 'list';
      data: Array<T>;
      has_more: boolean;
      url: string;
    }

    export interface ApiListPromise<T>
      extends Promise<Response<ApiList<T>>>,
        AsyncIterableIterator<T> {
      autoPagingEach(
        handler: (item: T) => boolean | void | Promise<boolean | void>,
        onDone?: (err: any) => void
      ): Promise<void>;

      autoPagingToArray(
        opts: {limit: number},
        onDone?: (err: any) => void
      ): Promise<Array<T>>;
    }

    export type LotrStreamResponse = NodeJS.ReadableStream;
    export type Emptyable<T> = null | '' | T;

    export interface RequestEvent {
      api_version: string;
      account?: string;
      method: string;
      path: string;
      request_start_time: number;
    }

    export interface ResponseEvent {
      api_version: string;
      account?: string;
      method: string;
      path: string;
      status: number;
      request_id: string;
      elapsed: number;
      request_start_time: number;
      request_end_time: number;
    }

    export interface AppInfo {
      name: string;
      partner_id?: string;
      url?: string;
      version?: string;
    }
  }
}
