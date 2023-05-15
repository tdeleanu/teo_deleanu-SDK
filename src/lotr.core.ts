import * as _Error from './Error.js';

import * as resources from './resources.js';
import {HttpClient, HttpClientResponse} from './net/HttpClient.js';
import {
  determineProcessUserAgentProperties,
  pascalToCamelCase,
  validateInteger,
} from './utils.js';
import {PlatformFunctions} from './platform/PlatformFunctions.js';
import {RequestSender} from './RequestSender.js';
import {LotrResource} from './LotrResource.js';

import {LotrObject, AppInfo, UserProvidedConfig} from './Types.js';

const DEFAULT_HOST = 'the-one-api.dev';
const DEFAULT_PORT = '443';
const DEFAULT_BASE_PATH = '/v2/';
const DEFAULT_API_VERSION = '2022-11-15';

const DEFAULT_TIMEOUT = 80000;

const MAX_NETWORK_RETRY_DELAY_SEC = 2;
const INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;

const APP_INFO_PROPERTIES = ['name', 'version', 'url', 'partner_id'];
const ALLOWED_CONFIG_PROPERTIES = [
  'apiVersion',
  'typescript',
  'maxNetworkRetries',
  'httpAgent',
  'httpClient',
  'timeout',
  'host',
  'port',
  'protocol',
  'telemetry',
  'appInfo',
];

type RequestSenderFactory = (lotr: LotrObject) => RequestSender;

const defaultRequestSenderFactory: RequestSenderFactory = (lotr) =>
  new RequestSender(lotr, LotrResource.MAX_BUFFERED_REQUEST_METRICS);

export function createLotr(
  platformFunctions: PlatformFunctions,
  requestSender: RequestSenderFactory = defaultRequestSenderFactory
): typeof Lotr {
  Lotr.PACKAGE_VERSION = '1.0.0';
  Lotr.USER_AGENT = {
    bindings_version: Lotr.PACKAGE_VERSION,
    lang: 'node',
    publisher: 'lotr',
    uname: null,
    typescript: false,
    ...determineProcessUserAgentProperties(),
  };
  Lotr.LotrResource = LotrResource;
  Lotr.resources = resources;
  Lotr.HttpClient = HttpClient;
  Lotr.HttpClientResponse = HttpClientResponse;

  function Lotr(
    this: LotrObject,
    key: string,
    config: Record<string, unknown> = {}
  ): void {
    if (!(this instanceof Lotr)) {
      return new (Lotr as any)(key, config);
    }

    const props = this._getPropsFromConfig(config);

    this._platformFunctions = platformFunctions;

    Object.defineProperty(this, '_emitter', {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false,
    });

    this.VERSION = Lotr.PACKAGE_VERSION;

    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);

    // if (
    //   props.protocol &&
    //   props.protocol !== 'https' &&
    //   (!props.host || /\.lotr\.com$/.test(props.host))
    // ) {
    //   throw new Error(
    //     'The `https` protocol must be used when sending requests to `*.lotr.com`'
    //   );
    // }

    const agent = props.httpAgent || null;

    this._api = {
      auth: null,
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || 'https',
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger('timeout', props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger(
        'maxNetworkRetries',
        props.maxNetworkRetries,
        0
      ),
      agent: agent,
      httpClient:
        props.httpClient ||
        (agent
          ? this._platformFunctions.createNodeHttpClient(agent)
          : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      lotrAccount: props.lotrAccount || null,
    };

    const typescript = props.typescript || false;
    if (typescript !== Lotr.USER_AGENT.typescript) {
      // The mutation here is uncomfortable, but likely fastest;
      // serializing the user agent involves shelling out to the system,
      // and given some users may instantiate the library many times without switching between TS and non-TS,
      // we only want to incur the performance hit when that actually happens.
      Lotr.USER_AGENT.typescript = typescript;
    }

    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }

    this._prepResources();
    this._setApiKey(key);

    this.errors = _Error;

    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;

    this._requestSender = requestSender(this);

    // Expose LotrResource on the instance too
    // @ts-ignore
    this.LotrResource = Lotr.LotrResource;
  }

  Lotr.errors = _Error;

  Lotr.createNodeHttpClient = platformFunctions.createNodeHttpClient;

  /**
   * Creates an HTTP client for issuing Lotr API requests which uses the Web
   * Fetch API.
   *
   * A fetch function can optionally be passed in as a parameter. If none is
   * passed, will default to the default `fetch` function in the global scope.
   */
  Lotr.createFetchHttpClient = platformFunctions.createFetchHttpClient;

  Lotr.prototype = {
    // Properties are set in the constructor above
    _appInfo: undefined!,
    on: null!,
    off: null!,
    once: null!,
    VERSION: null!,
    LotrResource: null!,
    webhooks: null!,
    errors: null!,
    _api: null!,
    _prevRequestMetrics: null!,
    _emitter: null!,
    _enableTelemetry: null!,
    _requestSender: null!,
    _platformFunctions: null!,

    /**
     * @private
     */
    _setApiKey(key: string): void {
      if (key) {
        this._setApiField('auth', `Bearer ${key}`);
      }
    },

    /**
     * @private
     * This may be removed in the future.
     */
    _setAppInfo(info: AppInfo): void {
      if (info && typeof info !== 'object') {
        throw new Error('AppInfo must be an object.');
      }

      if (info && !info.name) {
        throw new Error('AppInfo.name is required');
      }

      info = info || {};

      this._appInfo = APP_INFO_PROPERTIES.reduce<Record<string, any>>(
        (accum: Record<string, any>, prop) => {
          if (typeof info[prop] == 'string') {
            accum = accum || {};

            accum[prop] = info[prop];
          }

          return accum;
        },
        // @ts-ignore
        undefined
      );
    },

    /**
     * @private
     * This may be removed in the future.
     */
    _setApiField<K extends keyof LotrObject['_api']>(
      key: K,
      value: LotrObject['_api'][K]
    ): void {
      this._api[key] = value;
    },

    /**
     * @private
     * It may be deprecated and removed in the future.
     */
    getApiField<K extends keyof LotrObject['_api']>(
      key: K
    ): LotrObject['_api'][K] {
      return this._api[key];
    },

    setClientId(clientId: string): void {
      this._clientId = clientId;
    },

    getClientId(): string | undefined {
      return this._clientId;
    },

    /**
     * @private
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getConstant: (c: string): unknown => {
      switch (c) {
        case 'DEFAULT_HOST':
          return DEFAULT_HOST;
        case 'DEFAULT_PORT':
          return DEFAULT_PORT;
        case 'DEFAULT_BASE_PATH':
          return DEFAULT_BASE_PATH;
        case 'DEFAULT_API_VERSION':
          return DEFAULT_API_VERSION;
        case 'DEFAULT_TIMEOUT':
          return DEFAULT_TIMEOUT;
        case 'MAX_NETWORK_RETRY_DELAY_SEC':
          return MAX_NETWORK_RETRY_DELAY_SEC;
        case 'INITIAL_NETWORK_RETRY_DELAY_SEC':
          return INITIAL_NETWORK_RETRY_DELAY_SEC;
      }
      return ((Lotr as unknown) as Record<string, unknown>)[c];
    },

    getMaxNetworkRetries(): number {
      return this.getApiField('maxNetworkRetries');
    },

    /**
     * @private
     * This may be removed in the future.
     */
    _setApiNumberField(
      prop: keyof LotrObject['_api'],
      n: number,
      defaultVal?: number
    ): void {
      const val = validateInteger(prop, n, defaultVal);

      this._setApiField(prop, val);
    },

    getMaxNetworkRetryDelay(): number {
      return MAX_NETWORK_RETRY_DELAY_SEC;
    },

    getInitialNetworkRetryDelay(): number {
      return INITIAL_NETWORK_RETRY_DELAY_SEC;
    },

    /**
     * @private
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent and uses a cached version for a slight
     * speed advantage.
     */
    getClientUserAgent(cb: (userAgent: string) => void): void {
      return this.getClientUserAgentSeeded(Lotr.USER_AGENT, cb);
    },

    /**
     * @private
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent by encoding a seeded object and
     * fetching a uname from the system.
     */
    getClientUserAgentSeeded(
      seed: Record<string, string | boolean | null>,
      cb: (userAgent: string) => void
    ): void {
      this._platformFunctions.getUname().then((uname: string | null) => {
        const userAgent: Record<string, string> = {};
        for (const field in seed) {
          userAgent[field] = encodeURIComponent(seed[field] ?? 'null');
        }

        // URI-encode in case there are unusual characters in the system's uname.
        userAgent.uname = encodeURIComponent(uname || 'UNKNOWN');

        const client = this.getApiField('httpClient');
        if (client) {
          userAgent.httplib = encodeURIComponent(client.getClientName());
        }

        if (this._appInfo) {
          userAgent.application = this._appInfo;
        }

        cb(JSON.stringify(userAgent));
      });
    },

    /**
     * @private
     * It may be deprecated and removed in the future.
     */
    getAppInfoAsString(): string {
      if (!this._appInfo) {
        return '';
      }

      let formatted = this._appInfo.name;

      if (this._appInfo.version) {
        formatted += `/${this._appInfo.version}`;
      }

      if (this._appInfo.url) {
        formatted += ` (${this._appInfo.url})`;
      }

      return formatted;
    },

    getTelemetryEnabled(): boolean {
      return this._enableTelemetry;
    },

    /**
     * @private
     * This may be removed in the future.
     */
    _prepResources(): void {
      for (const name in resources) {
        // @ts-ignore
        this[pascalToCamelCase(name)] = new resources[name](this);
      }
    },

    /**
     * @private
     * This may be removed in the future.
     */
    _getPropsFromConfig(config: Record<string, unknown>): UserProvidedConfig {
      // If config is null or undefined, just bail early with no props
      if (!config) {
        return {};
      }

      // config can be an object or a string
      const isString = typeof config === 'string';
      const isObject = config === Object(config) && !Array.isArray(config);

      if (!isObject && !isString) {
        throw new Error('Config must either be an object or a string');
      }

      // If config is a string, we assume the old behavior of passing in a string representation of the api version
      if (isString) {
        return {
          apiVersion: config,
        };
      }

      // If config is an object, we assume the new behavior and make sure it doesn't contain any unexpected values
      const values = Object.keys(config).filter(
        (value) => !ALLOWED_CONFIG_PROPERTIES.includes(value)
      );

      if (values.length > 0) {
        throw new Error(
          `Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(
            ', '
          )}`
        );
      }

      return config;
    },
  } as LotrObject;

  return Lotr;
}
