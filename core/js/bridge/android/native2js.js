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

global.hippyBridge = (_action, _callObj) => {
  let resp = 'success';

  let action = _action;
  let callObj = _callObj;

  if (action === 'pauseInstance') {
    action = 'callJsModule';
    callObj = {
      methodName: 'receiveNativeEvent',
      moduleName: 'EventDispatcher',
      params: ['@hippy:pauseInstance', null],
    };
  }

  if (action === 'resumeInstance') {
    action = 'callJsModule';
    callObj = {
      methodName: 'receiveNativeEvent',
      moduleName: 'EventDispatcher',
      params: ['@hippy:resumeInstance', null],
    };
  }

  switch (action) {
    case 'loadInstance': {
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
          EventModule.receiveNativeEvent(params);
        }

        __GLOBAL__.appRegister[callObj.name].run(callObj.params);
      } else {
        resp = `native2js error: ${callObj.name} is not registered in js`;
        throw Error(resp);
      }
      break;
    }
    case 'callBack': {
      if (callObj.moduleName === 'AnimationFrameModule' && callObj.moduleFunc === 'requestAnimationFrame') {
        if (callObj.result !== 0) {
          resp = 'native2js error: native failed to call AnimationFrameModule requestAnimationFrame()';
          break;
        }
        __GLOBAL__.canRequestAnimationFrame = true;
        if (__GLOBAL__.requestAnimationFrameQueue[callObj.callId]) {
          __GLOBAL__.requestAnimationFrameQueue[callObj.callId].forEach((cb) => {
            if (typeof cb === 'function') {
              cb(callObj.params);
            }
          });
          delete __GLOBAL__.requestAnimationFrameQueue[callObj.callId];
        }
      } else if (__GLOBAL__.moduleCallList[callObj.callId]) {
        const callbackObj = __GLOBAL__.moduleCallList[callObj.callId];
        if (callObj.result !== 0 && typeof callbackObj.reject === 'function') {
          callbackObj.reject(callObj.params);
        } else {
          typeof callbackObj.cb === 'function' && callbackObj.cb(callObj.params);
        }
        if (callbackObj.type === 0 || callbackObj.type === 1) {
          delete __GLOBAL__.moduleCallList[callObj.callId];
        }
      } else {
        resp = 'native2js error: native callback id is not registered in js';
      }
      break;
    }
    case 'callJsModule': {
      if (!callObj || !callObj.moduleName || !callObj.methodName) {
        resp = 'native2js error: callJsModule param is invalid';
      } else {
        const targetModule = __GLOBAL__.jsModuleList[callObj.moduleName];
        if (!targetModule || typeof targetModule[callObj.methodName] !== 'function') {
          resp = 'native2js error: callJsModule is targeting an undefined module or method';
        } else {
          targetModule[callObj.methodName](callObj.params);
        }
      }
      break;
    }
    case 'destroyInstance': {
      const rootViewId = callObj;
      global.Hippy.emit('destroyInstance', rootViewId);
      Hippy.bridge.callNative('UIManagerModule', 'startBatch');
      Hippy.bridge.callNative('UIManagerModule', 'deleteNode', rootViewId, [{ id: rootViewId }]);
      Hippy.bridge.callNative('UIManagerModule', 'endBatch');
      // compatible for hippy1.x
      delete __GLOBAL__.nodeIdCache[rootViewId];
      delete __GLOBAL__.nodeTreeCache[rootViewId];
      __GLOBAL__.destroyInstanceList[rootViewId] = true;
      break;
    }
    default: {
      resp = 'native2js error: native2js action is not defined';
      break;
    }
  }
  return resp;
};
