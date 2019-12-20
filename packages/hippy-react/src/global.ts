/* eslint-disable no-underscore-dangle */

import '@localTypes/global';

if (!global.__GLOBAL__) {
  global.__GLOBAL__ = {};
}

const { __GLOBAL__ } = global;

__GLOBAL__.nodeId = 0;
__GLOBAL__.animationId = 0;
__GLOBAL__.renderCount = 0;
