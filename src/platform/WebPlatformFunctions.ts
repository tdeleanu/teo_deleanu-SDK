import {HttpClient} from '../net/HttpClient.js';
import {PlatformFunctions} from './PlatformFunctions.js';
import {MultipartRequestData, RequestData, BufferedFile} from '../Types.js';
import {EventEmitter} from 'events';
/**
 * Specializes WebPlatformFunctions using APIs available in Web workers.
 */
export class WebPlatformFunctions extends PlatformFunctions {
  /** @override */
  getUname(): Promise<string | null> {
    return Promise.resolve(null);
  }

  /** @override */
  createEmitter(): EventEmitter {
    return new EventEmitter();
  }

  /** @override */
  tryBufferData(
    data: MultipartRequestData
  ): Promise<RequestData | BufferedFile> {
    if (data.file.data instanceof ReadableStream) {
      throw new Error(
        'Uploading a file as a stream is not supported in non-Node environments'
      );
    }
    return Promise.resolve(data);
  }

  /** @override */
  createNodeHttpClient(): HttpClient {
    throw new Error(
      'LOTR: `createNodeHttpClient()` is not available in non-Node environments. Please use `createFetchHttpClient()` instead.'
    );
  }

  /** @override */
  createDefaultHttpClient(): HttpClient {
    return super.createFetchHttpClient();
  }
}
