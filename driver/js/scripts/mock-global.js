/* eslint-disable no-underscore-dangle */

global.__PLATFORM__ = null;
global.__HIPPYNATIVEGLOBAL__ = {};
global.__GLOBAL__ = {
  nodeId: 0,
  jsModuleList: {},
};
global.Hippy = {
  on() {
    // do nothing.
  },
  bridge: {
    callNative() {
      // do nothing.
    },
    callNativeWithPromise() {
      return Promise.resolve();
    },
    callNativeWithCallbackId() {
      return 1;
    },
  },
  turbo: {
    turboPromise() {
      // do nothing.
    },
    getTurboModule() {
      // do nothing.
    },
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
    createNode() {
      // do nothing.
    },
    updateNode() {
      // do nothing.
    },
    deleteNode() {
      // do nothing.
    },
    startBatch() {
      // do nothing.
    },
    endBatch() {
      // do nothing.
    },
  },
  register: {
    regist() {
      // do nothing.
    },
  },
};
