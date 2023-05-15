// @ts-nocheck
/* eslint-disable new-cap */

'use strict';

import {createLotr} from '../src/lotr.core.js';
import {getMockPlatformFunctions} from './testUtils.js';
import {ApiVersion} from '../src/apiVersion.js';

const testUtils = require('./testUtils.js');

const Lotr = require('../src/lotr.cjs.node.js');
const lotr = require('../src/lotr.cjs.node.js')(
  testUtils.getUserLotrKey(),
  'latest'
);
const crypto = require('crypto');

const expect = require('chai').expect;

const CUSTOMER_DETAILS = {
  description: 'Some customer',
  card: 'tok_visa',
};

describe('Lotr Module', function() {
  const cleanup = new testUtils.CleanupUtility();
  this.timeout(20000);

  describe('config object', () => {
    it('should only accept either an object or a string', () => {
      expect(() => {
        Lotr(testUtils.getUserLotrKey(), 123);
      }).to.throw(/Config must either be an object or a string/);

      expect(() => {
        Lotr(testUtils.getUserLotrKey(), ['2019-12-12']);
      }).to.throw(/Config must either be an object or a string/);

      expect(() => {
        Lotr(testUtils.getUserLotrKey(), '2019-12-12');
      }).to.not.throw();

      expect(() => {
        Lotr(testUtils.getUserLotrKey(), {
          apiVersion: 'latest',
        });
      }).to.not.throw();
    });

    it('should only contain allowed properties', () => {
      expect(() => {
        Lotr(testUtils.getUserLotrKey(), {
          foo: 'bar',
          apiVersion: 'latest',
        });
      }).to.throw(/Config object may only contain the following:/);

      expect(() => {
        Lotr(testUtils.getUserLotrKey(), {
          apiVersion: '2019-12-12',
          maxNetworkRetries: 2,
          httpAgent: 'agent',
          timeout: 123,
          host: 'foo.Lotr.com',
          port: 321,
        });
      }).to.not.throw();
    });
    it('should perform a no-op if null, undefined or empty values are passed', () => {
      const cases = [null, undefined, '', {}];

      cases.forEach((item) => {
        expect(() => {
          Lotr(testUtils.getUserLotrKey(), item);
        }).to.not.throw();
      });

      cases.forEach((item) => {
        const newLotr = Lotr(testUtils.getUserLotrKey(), item);
        expect(newLotr.getApiField('version')).to.equal(ApiVersion);
      });
    });

    it('should enable telemetry if not explicitly set', () => {
      const newLotr = Lotr(testUtils.getUserLotrKey());

      expect(newLotr.getTelemetryEnabled()).to.equal(true);
    });

    it('should enable telemetry if anything but "false" is set', () => {
      const vals = ['foo', null, undefined];
      let newLotr;

      vals.forEach((val) => {
        newLotr = Lotr(testUtils.getUserLotrKey(), {
          telemetry: val,
        });

        expect(newLotr.getTelemetryEnabled()).to.equal(true);
      });

      newLotr = Lotr(testUtils.getUserLotrKey(), {
        telemetry: false,
      });

      expect(newLotr.getTelemetryEnabled()).to.equal(false);
    });
  });

  describe('setApiKey', () => {
    it('uses Bearer auth', () => {
      expect(lotr.getApiField('auth')).to.equal(
        `Bearer ${testUtils.getUserLotrKey()}`
      );
    });
  });

  describe('GetClientUserAgent', () => {
    it('Should return a user-agent serialized JSON object', () =>
      expect(
        new Promise((resolve, reject) => {
          lotr.getClientUserAgent((c) => {
            resolve(JSON.parse(c));
          });
        })
      ).to.eventually.have.property('lang', 'node'));

    it('Should return platform and version in the serialized user agent JSON object', async () => {
      // Check that the testing environment actually has a process global.
      const userAgent = await new Promise((resolve, reject) => {
        lotr.getClientUserAgent((c) => {
          resolve(JSON.parse(c));
        });
      });

      expect(userAgent).to.have.property('lang_version', process.version);
      expect(userAgent).to.have.property('platform', process.platform);
    });

    it('Should include whether typescript: true was passed, respecting reinstantiations', () => {
      return new Promise((resolve) => resolve(null))
        .then(() => {
          const newLotr = new Lotr('sk_test_123', {
            typescript: true,
          });
          return expect(
            new Promise((resolve, reject) => {
              newLotr.getClientUserAgent((c) => {
                resolve(JSON.parse(c));
              });
            })
          ).to.eventually.have.property('typescript', 'true');
        })
        .then(() => {
          const newLotr = new Lotr('sk_test_123', {});
          return expect(
            new Promise((resolve, reject) => {
              newLotr.getClientUserAgent((c) => {
                resolve(JSON.parse(c));
              });
            })
          ).to.eventually.have.property('typescript', 'false');
        });
    });
  });

  describe('GetClientUserAgentSeeded', () => {
    it('Should return a user-agent serialized JSON object', () => {
      const userAgent = {lang: 'node'};
      return expect(
        new Promise((resolve, reject) => {
          lotr.getClientUserAgentSeeded(userAgent, (c) => {
            resolve(JSON.parse(c));
          });
        })
      ).to.eventually.have.property('lang', 'node');
    });

    it('Should URI-encode user-agent fields', () => {
      const userAgent = {lang: 'ï'};
      return expect(
        new Promise((resolve, reject) => {
          lotr.getClientUserAgentSeeded(userAgent, (c) => {
            resolve(JSON.parse(c));
          });
        })
      ).to.eventually.have.property('lang', '%C3%AF');
    });

    describe('uname', () => {
      it('gets added to the user-agent', () => {
        const Lotr = createLotr(
          getMockPlatformFunctions((cmd: string, cb: any): void => {
            cb(null, 'foøname');
          })
        )(testUtils.getUserLotrKey(), 'latest');
        return expect(
          new Promise((resolve, reject) => {
            Lotr.getClientUserAgentSeeded({lang: 'node'}, (c) => {
              resolve(JSON.parse(c));
            });
          })
        ).to.eventually.have.property('uname', 'fo%C3%B8name');
      });

      it('sets uname to UNKOWN in case of an error', () => {
        const Lotr = createLotr(
          getMockPlatformFunctions((cmd: string, cb: any): void => {
            cb(new Error('security'), null);
          })
        )(testUtils.getUserLotrKey(), 'latest');
        return expect(
          new Promise((resolve, reject) => {
            Lotr.getClientUserAgentSeeded({lang: 'node'}, (c) => {
              resolve(JSON.parse(c));
            });
          })
        ).to.eventually.have.property('uname', 'UNKNOWN');
      });
    });
  });

  describe('timeout config', () => {
    const defaultTimeout = 80000;
    it('Should define a default of 80000', () => {
      expect(lotr.getApiField('timeout')).to.equal(defaultTimeout);
    });
    it('Should allow me to set a custom timeout', () => {
      const newLotr = Lotr('sk_test', {
        timeout: 900,
      });
      expect(newLotr.getApiField('timeout')).to.equal(900);
    });
    it('Should allow me to set null, to reset to the default', () => {
      const newLotr = Lotr('sk_test', {
        timeout: null,
      });
      expect(newLotr.getApiField('timeout')).to.equal(defaultTimeout);
    });
  });

  describe('appInfo config', () => {
    describe('when not set', () => {
      it('should return empty string', () => {
        expect(lotr.getAppInfoAsString()).to.equal('');
      });
    });

    describe('when given a non-object variable', () => {
      it('should throw an error', () => {
        expect(() => {
          Lotr('sk_test', {
            appInfo: 'foo',
          });
        }).to.throw(/AppInfo must be an object./);
      });
    });

    describe('when given an object with no `name`', () => {
      it('should throw an error', () => {
        expect(() => {
          Lotr('sk_test', {
            appInfo: {},
          });
        }).to.throw(/AppInfo.name is required/);

        expect(() => {
          Lotr('sk_test', {
            appInfo: {
              version: '1.2.3',
            },
          });
        }).to.throw(/AppInfo.name is required/);

        expect(() => {
          Lotr('sk_test', {
            appInfo: {
              cats: '42',
            },
          });
        }).to.throw(/AppInfo.name is required/);
      });
    });

    describe('when given at least a `name`', () => {
      it('should set name, partner ID, url, and version of Lotr._appInfo', () => {
        let newLotr = Lotr('sk_test', {
          appInfo: {
            name: 'MyAwesomeApp',
          },
        });
        expect(newLotr._appInfo).to.eql({
          name: 'MyAwesomeApp',
        });

        newLotr = Lotr('sk_test', {
          appInfo: {
            name: 'MyAwesomeApp',
            version: '1.2.345',
          },
        });
        expect(newLotr._appInfo).to.eql({
          name: 'MyAwesomeApp',
          version: '1.2.345',
        });

        newLotr = Lotr('sk_test', {
          appInfo: {
            name: 'MyAwesomeApp',
            url: 'https://myawesomeapp.info',
          },
        });
        expect(newLotr._appInfo).to.eql({
          name: 'MyAwesomeApp',
          url: 'https://myawesomeapp.info',
        });

        newLotr = Lotr('sk_test', {
          appInfo: {
            name: 'MyAwesomeApp',
            partner_id: 'partner_1234',
          },
        });
        expect(newLotr._appInfo).to.eql({
          name: 'MyAwesomeApp',
          partner_id: 'partner_1234',
        });
      });

      it('should ignore any invalid properties', () => {
        const newLotr = Lotr('sk_test', {
          appInfo: {
            name: 'MyAwesomeApp',
            partner_id: 'partner_1234',
            version: '1.2.345',
            url: 'https://myawesomeapp.info',
            countOfRadishes: 512,
          },
        });
        expect(newLotr._appInfo).to.eql({
          name: 'MyAwesomeApp',
          partner_id: 'partner_1234',
          version: '1.2.345',
          url: 'https://myawesomeapp.info',
        });
      });
    });

    it('should be included in the ClientUserAgent and be added to the UserAgent String', (done) => {
      const appInfo = {
        name: testUtils.getRandomString(),
        version: '1.2.345',
        url: 'https://myawesomeapp.info',
      };

      const newLotr = Lotr('sk_test', {
        appInfo,
      });

      newLotr.getClientUserAgent((uaString) => {
        expect(JSON.parse(uaString).application).to.eql(appInfo);

        expect(newLotr.getAppInfoAsString()).to.eql(
          `${appInfo.name}/${appInfo.version} (${appInfo.url})`
        );

        done();
      });
    });
  });

  describe('setMaxNetworkRetries', () => {
    describe('when given an empty or non-number variable', () => {
      it('should error', () => {
        expect(() => {
          lotr._setApiNumberField('maxNetworkRetries', 'foo');
        }).to.throw(/maxNetworkRetries must be an integer/);

        expect(() => {
          lotr._setApiNumberField('maxNetworkRetries');
        }).to.throw(/maxNetworkRetries must be an integer/);
      });
    });

    describe('when passed in via the config object', () => {
      it('should default to 0 if a non-integer is passed', () => {
        const newLotr = Lotr(testUtils.getUserLotrKey(), {
          maxNetworkRetries: 'foo',
        });

        expect(newLotr.getMaxNetworkRetries()).to.equal(0);

        expect(() => {
          Lotr(testUtils.getUserLotrKey(), {
            maxNetworkRetries: 2,
          });
        }).to.not.throw();
      });

      it('should correctly set the amount of network retries', () => {
        const newLotr = Lotr(testUtils.getUserLotrKey(), {
          maxNetworkRetries: 5,
        });

        expect(newLotr.getMaxNetworkRetries()).to.equal(5);
      });
    });

    describe('when not set', () => {
      it('should use the default', () => {
        const newLotr = Lotr(testUtils.getUserLotrKey());

        expect(newLotr.getMaxNetworkRetries()).to.equal(0);
      });
    });
  });

  describe('VERSION', () => {
    it('should return the current package version', () => {
      const newLotr = Lotr(testUtils.getUserLotrKey());

      expect(newLotr.VERSION).to.equal(Lotr.PACKAGE_VERSION);
    });
  });
});
