// mock global Hippy
global.Hippy = {
  bridge: {
    callNative: () => {},
    callNativeWithPromise: () => {},
    callNativeWithCallbackId: () => {},
  },
  device: {
    platform: { OS: 'android' },
    screen: {
      width: 375,
      height: 667,
      scale: 1,
      fontScale: 1,
      statusBarHeight: 20,
      navigatorBarHeight: 20,
    },
    window: {
      width: 375,
      height: 667,
      scale: 1,
      fontScale: 1,
      statusBarHeight: 20,
      navigatorBarHeight: 20,
    },
  },
  document: {
    // 终端的注入
    createNode: () => {},
    updateNode: () => {},
    deleteNode: () => {},
    flushBatch: () => {},
    setNodeTree: () => {},
    setNodeId: () => {},
    getNodeById: () => {},
    getNodeIdByRef: () => {},
    callUIFunction: () => {},
    measureInWindow: () => {},
    startBatch: () => {},
    endBatch: () => {},
    sendRenderError: () => {},
  },
  register: {},
};

// mock global variable
global.__GLOBAL__ = {
  jsModuleList: {},
};

global.__HIPPYNATIVEGLOBAL__ = {
  OSVersion: '1.0.0.0',
  SDKVersion: '1.0.0.0',
  Platform: {
    APILevel: '1.0.0.0',
  },
  Device: 'iPhone 12',
};
