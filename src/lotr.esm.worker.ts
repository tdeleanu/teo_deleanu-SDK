import {WebPlatformFunctions} from './platform/WebPlatformFunctions.js';
import {createLotr} from './lotr.core.js';

export const Lotr = createLotr(new WebPlatformFunctions());
export default Lotr;
