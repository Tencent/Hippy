/* eslint-disable no-console */

Hippy.device = {};
Hippy.bridge = {};
global.__ISHIPPY__ = true;
global.__GLOBAL__ = {
  globalErrorHandle: {
    uncaughtException: null,
    unhandlePromiseRejection: null,
  },
};

Hippy.register = {
  regist(appName, entryFunc) {
    if (__HIPPYNATIVEGLOBAL__.OS === 'ios') {
      Hippy.bridge.callNative('JSCExecutor', 'setContextName', `HippyContext: ${appName}`);
    }
    __GLOBAL__.appRegister[appName] = {
      run: entryFunc,
    };
  },
};

Hippy.on = (eventType, callback) => {
  if (typeof eventType !== 'string') {
    console.error('eventType must be a string');
    return;
  }

  if (typeof callback !== 'function') {
    console.error('callback must be a function');
    return;
  }

  if (typeof __GLOBAL__.globalErrorHandle[eventType] !== 'undefined') {
    __GLOBAL__.globalErrorHandle[eventType] = callback;
  } else {
    console.error('no such eventType');
  }
};
