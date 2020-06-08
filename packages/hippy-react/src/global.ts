/* eslint-disable no-underscore-dangle */

import '@localTypes/global';

if (!global.__GLOBAL__) {
  global.__GLOBAL__ = {};
}

const { __GLOBAL__ } = global;

__GLOBAL__.nodeId = 0;
__GLOBAL__.animationId = 0;
__GLOBAL__.renderCount = 0;

const  {
  asyncStorage: AsyncStorage,
  bridge: Bridge,
  device: Device,
  document: UIManager,
  register: HippyRegister,
  on: addEventListener,
  off: removeEventListener,
  emit: dispatchEvent,
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
