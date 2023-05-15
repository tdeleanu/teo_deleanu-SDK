import {NodePlatformFunctions} from './platform/NodePlatformFunctions.js';
import {createLotr} from './lotr.core.js';

export const Lotr = createLotr(new NodePlatformFunctions());
export default Lotr;
