// @ts-nocheck

// NOTE: testUtils should be require'd before anything else in each spec file!

require('mocha');
// Ensure we are using the 'as promised' libs before any tests are run:
require('chai').use(require('chai-as-promised'));

const http = require('http');

const {
  NodePlatformFunctions,
} = require('../src/platform/NodePlatformFunctions.js');
const {RequestSender} = require('../src/RequestSender.js');
const {createLotr} = require('../src/lotr.core.js');
const lotr = require('../src/lotr.cjs.node.js');

const testingHttpAgent = new http.Agent({keepAlive: false});

const utils = (module.exports = {
  getTestServerLotr: (clientOptions, handler, callback) => {
    const server = http.createServer((req, res) => {
      const {shouldStayOpen} = handler(req, res) || {};
      if (!shouldStayOpen) {
        res.on('close', () => {
          server.close();
        });
      }
    });
    server.listen(0, () => {
      const {port} = server.address();
      const Lotr = require('../src/lotr.cjs.node.js')(
        module.exports.getUserLotrKey(),
        {
          host: 'localhost',
          port,
          protocol: 'http',
          httpAgent: testingHttpAgent,
          ...clientOptions,
        }
      );
      return callback(null, Lotr, () => {
        server.close();
      });
    });
  },

  getLotrMockClient: () => {
    const lotr = require('../src/lotr.cjs.node.js');

    return lotr('sk_test_123', {
      host: process.env.LOTR_MOCK_HOST || 'localhost',
      port: process.env.LOTR_MOCK_PORT || 12111,
      protocol: 'http',
    });
  },

  getUserLotrKey: () => {
    const key = process.env.THE_ONE_API_TOKEN;

    return key;
  },

  getMockPlatformFunctions: (cb) => {
    class MockPlatformFunctions extends NodePlatformFunctions {
      constructor(cb) {
        super();
        this._exec = cb;
      }
    }

    return new MockPlatformFunctions(cb);
  },

  getMockLotr: (config, request) => {
    class MockRequestSender extends RequestSender {
      _request(
        method,
        host,
        path,
        data,
        auth,
        options = {},
        callback,
        requestDataProcessor = null
      ) {
        return request(
          method,
          host,
          path,
          data,
          auth,
          options,
          callback,
          requestDataProcessor
        );
      }
    }

    // Provide a testable Lotr instance
    // That is, with mock-requests built in and hookable
    const lotrFactory = createLotr(
      new NodePlatformFunctions(),
      (LotrInstance) =>
        new MockRequestSender(
          LotrInstance,
          Lotr.LotrResource.MAX_BUFFERED_REQUEST_METRICS
        )
    );
    return lotrFactory('fakeAuthToken', config);
  },

  createMockClient: (requests) => {
    return utils.getMockLotr({}, (method, host, path, _4, _5, _6, callback) => {
      const request = requests.find(
        (r) => r.method == method && r.path == path
      );
      if (!request) {
        throw new Error(`Unable to find a mock request for ${method} ${path}`);
      }

      callback(null, Promise.resolve(JSON.parse(request.response)));
    });
  },

  getSpyableLotr: (config) => {
    class SpyableRequestSender extends RequestSender {
      _request(
        method,
        host,
        path,
        data,
        auth,
        options = {},
        callback,
        requestDataProcessor = null
      ) {
        const req = (LotrInstance.LAST_REQUEST = {
          method,
          url: path,
          data,
          headers: options.headers || {},
          settings: options.settings || {},
        });
        if (auth) {
          req.auth = auth;
        }
        if (host) {
          req.host = host;
        }

        const handleMockRequest = (err, req) => {
          LotrInstance.REQUESTS.push(req);
          callback.call(this, err, {});
        };

        if (requestDataProcessor) {
          requestDataProcessor(
            method,
            data,
            options.headers,
            handleMockRequest
          );
        } else {
          handleMockRequest(null, req);
        }

        return super._request(
          method,
          host,
          path,
          data,
          auth,
          options,
          callback,
          requestDataProcessor
        );
      }
    }

    // Provide a testable Lotr instance
    // That is, with mock-requests built in and hookable
    const lotr = require('../src/lotr.cjs.node.js');
    const LotrInstance = lotr('fakeAuthToken', config);

    LotrInstance.REQUESTS = [];

    LotrInstance._requestSender = new SpyableRequestSender(
      LotrInstance,
      lotr.LotrResource.MAX_BUFFERED_REQUEST_METRICS
    );

    return LotrInstance;
  },

  /**
   * A utility where cleanup functions can be registered to be called post-spec.
   * CleanupUtility will automatically register on the mocha afterEach hook,
   * ensuring its called after each descendent-describe block.
   */
  CleanupUtility: (() => {
    CleanupUtility.DEFAULT_TIMEOUT = 20000;
    CleanupUtility.completed = 0;
    function CleanupUtility(timeout) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      this._cleanupFns = [];
      this._Lotr = require('../src/lotr.cjs.node.js')(
        utils.getUserLotrKey(),
        'latest'
      );
      afterEach(function(done) {
        this.timeout(timeout || CleanupUtility.DEFAULT_TIMEOUT);
        return self.doCleanup(done);
      });
    }

    CleanupUtility.prototype = {
      doCleanup(done) {
        const cleanups = this._cleanupFns;
        const total = cleanups.length;

        let fn;
        while ((fn = cleanups.shift())) {
          const promise = fn.call(this);
          if (!promise || !promise.then) {
            throw new Error(
              'CleanupUtility expects cleanup functions to return promises!'
            );
          }
          promise.then(
            () => {
              // cleanup successful
              CleanupUtility.completed += 1;
              if (CleanupUtility.completed === total) {
                done();
              }
            },
            (err) => {
              // not successful
              throw err;
            }
          );
        }
        if (total === 0) {
          done();
        }
      },
      add(fn) {
        this._cleanupFns.push(fn);
      },
    };

    return CleanupUtility;
  })(),

  /**
   * Get a random string for test Object creation
   */
  getRandomString: () => {
    return Math.random()
      .toString(36)
      .slice(2);
  },
});

module.exports = utils;
