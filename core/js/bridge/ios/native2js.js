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
  if (!callback) {
    return;
  }

  if (!__GLOBAL__._notDeleteCallbackIds[cbID & ~1]
     && !__GLOBAL__._notDeleteCallbackIds[cbID | 1]) {
    __GLOBAL__._callbacks[cbID & ~1] = null;
    __GLOBAL__._callbacks[cbID | 1] = null;
  }

  if (args && args.length > 1 && args[0] == null) {
    args.splice(0, 1);
  }

  callback(...args);
};

__fbBatchedBridge.callFunctionReturnFlushedQueue = (module, method, args) => {
  if (module === 'IOSBridgeModule' || module === 'AppRegistry') {
    if (method === 'loadInstance' || method === 'runApplication') {
      const callObj = {
        name: args[0],
        id: args[1].rootTag,
        params: args[1].initialProps,
      };

      if (__GLOBAL__.appRegister[callObj.name]) {
        Object.assign(callObj.params, {
          __instanceName__: callObj.name,
          __instanceId__: callObj.id,
        });

        Object.assign(__GLOBAL__.appRegister[callObj.name], {
          id: callObj.id,
          superProps: callObj.params,
        });

        const EventModule = __GLOBAL__.jsModuleList.EventDispatcher;
        if (EventModule && typeof EventModule.receiveNativeEvent === 'function') {
          const params = ['@hp:loadInstance', callObj.params];
          EventModule.receiveNativeEvent.call(EventModule, params);
        }

        __GLOBAL__.appRegister[callObj.name].run(callObj.params);
      } else {
        throw Error(`error: ${callObj.name} is not regist in js`);
      }
    } else if (method === 'unmountApplicationComponentAtRootTag') {
      global.Hippy.emit('destroyInstance', args[0]);
      const renderId = Date.now().toString();
      Hippy.bridge.callNative('UIManagerModule', 'startBatch', renderId);
      Hippy.bridge.callNative('UIManagerModule', 'removeRootView', args[0]);
      Hippy.bridge.callNative('UIManagerModule', 'endBatch', renderId);
      delete __GLOBAL__.nodeIdCache[args[0]];
      delete __GLOBAL__.nodeTreeCache[args[0]];
      delete __GLOBAL__.nodeParamCache[args[0]];
      __GLOBAL__.destroyInstanceList[args[0]] = true;
    }
  } else if (module === 'EventDispatcher' || module === 'Dimensions') {
    const targetModule = __GLOBAL__.jsModuleList[module];
    if (!targetModule || !targetModule[method] || typeof targetModule[method] !== 'function') {
      // console.error("no module or no function");
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
