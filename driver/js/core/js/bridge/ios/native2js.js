/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const { JSTimersExecution } = require('../../modules/ios/jsTimersExecution.js');

global.__fbBatchedBridge = {};

__fbBatchedBridge.flushedQueue = () => {
  JSTimersExecution.callImmediates();
  const queue = __GLOBAL__._queue;
  __GLOBAL__._queue = [[], [], [], __GLOBAL__._callID];
  return queue[0].length ? queue : null;
};

__fbBatchedBridge.invokeCallbackAndReturnFlushedQueue = (cbID, args) => {
  __fbBatchedBridge.__invokeCallback(cbID, args);
  JSTimersExecution.callImmediates();
  return __fbBatchedBridge.flushedQueue();
};

__fbBatchedBridge.__invokeCallback = (cbID, args) => {
  const callback = __GLOBAL__._callbacks[cbID];
  if (!callback) return;
  if (!__GLOBAL__._notDeleteCallbackIds[cbID & ~1]
     && !__GLOBAL__._notDeleteCallbackIds[cbID | 1]) {
    delete __GLOBAL__._callbacks[cbID & ~1];
    delete __GLOBAL__._callbacks[cbID | 1];
  }
  if (args && args.length > 1 && (args[0] === null || args[0] === undefined)) {
    args.splice(0, 1);
  }
  callback(...args);
};

__fbBatchedBridge.callFunctionReturnFlushedQueue = (module, method, args) => {
  if (module === 'EventDispatcher' || module === 'Dimensions') {
    const targetModule = __GLOBAL__.jsModuleList[module];
    if (!targetModule || !targetModule[method] || typeof targetModule[method] !== 'function') {
    } else {
      targetModule[method].call(targetModule, args[1].params);
    }
  } else if (module === 'JSTimersExecution') {
    if (method === 'callTimers') {
      args[0].forEach((timerId) => {
        const timerCallFunc = JSTimersExecution.callbacks[
          JSTimersExecution.timerIDs.indexOf(timerId)
        ];
        if (typeof timerCallFunc === 'function') {
          try {
            timerCallFunc();
          } catch (e) {
            console.reportUncaughtException(e); // eslint-disable-line
          }
        }
      });
    }
  }
  JSTimersExecution.callImmediates();
  return __fbBatchedBridge.flushedQueue();
};
