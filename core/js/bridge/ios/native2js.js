/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
      const rootViewId = args[0];
      global.Hippy.emit('destroyInstance', rootViewId);
      Hippy.bridge.callNative('UIManagerModule', 'startBatch');
      Hippy.bridge.callNative('UIManagerModule', 'removeRootView', rootViewId);
      Hippy.bridge.callNative('UIManagerModule', 'endBatch');
    }
  } else if (module === 'EventDispatcher' || module === 'Dimensions') {
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
