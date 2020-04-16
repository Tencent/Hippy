/* eslint-disable no-underscore-dangle */

global.__PLATFORM__ = null;
global.__HIPPYNATIVEGLOBAL__ = {};
global.__GLOBAL__ = {
  nodeId: 0,
  jsModuleList: {},
};
global.Hippy = {
  on() {},
  bridge: {
    callNative() {},
    callNativeWithPromise() { return Promise.resolve(); },
    callNativeWithCallbackId() { return 1; },
  },
  device: {
    platform: {
      OS: null,
    },
    screen: {
      scale: 2,
    },
    window: {
    },
  },
  document: {
    createNode() {},
    updateNode() {},
    deleteNode() {},
    startBatch() {},
    endBatch() {},
  },
  register: {
    regist() {},
  },
};
