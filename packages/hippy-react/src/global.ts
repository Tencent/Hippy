/* eslint-disable no-underscore-dangle */

import '@localTypes/global';
// @ts-ignore
if (!global.__GLOBAL__) {
  // @ts-ignore
  global.__GLOBAL__ = {};
}

// @ts-ignore
const { __GLOBAL__ } = global;

__GLOBAL__.nodeId = 0;
__GLOBAL__.animationId = 0;
__GLOBAL__.renderCount = 0;

const {
  asyncStorage: AsyncStorage,
  bridge: Bridge,
  device: Device,
  document: UIManager,
  register: HippyRegister,
  on: addEventListener,
  off: removeEventListener,
  emit: dispatchEvent,
  // @ts-ignore
} = global.Hippy;

export {
  addEventListener,
  removeEventListener,
  dispatchEvent,
  AsyncStorage,
  Bridge,
  Device,
  HippyRegister,
  UIManager,
};
