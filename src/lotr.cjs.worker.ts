import {WebPlatformFunctions} from './platform/WebPlatformFunctions.js';
import {createLotr} from './lotr.core.js';

const Lotr = createLotr(new WebPlatformFunctions());

module.exports = Lotr;

// expose constructor as a named property to enable mocking with Sinon.JS
module.exports.Lotr = Lotr;

// Allow use with the TypeScript compiler without `esModuleInterop`.
// We may also want to add `Object.defineProperty(exports, "__esModule", {value: true});` in the future, so that Babel users will use the `default` version.
module.exports.default = Lotr;
