/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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
    case 'callBack': {
      if (callObj.moduleName === 'AnimationFrameModule' && callObj.moduleFunc === 'requestAnimationFrame') {
        if (callObj.result !== 0) {
          resp = 'native2js error: native failed to call AnimationFrameModule requestAnimationFrame()';
          break;
        }
        __GLOBAL__.canRequestAnimationFrame = true;
        if (__GLOBAL__.requestAnimationFrameQueue[callObj.frameId]) {
          __GLOBAL__.requestAnimationFrameQueue[callObj.frameId].forEach((cb) => {
            if (typeof cb === 'function') {
              cb(callObj.params);
            }
          });
          delete __GLOBAL__.requestAnimationFrameQueue[callObj.frameId];
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
      }  else {
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
    default: {
      resp = 'native2js error: native2js action is not defined';
      break;
    }
  }
  return resp;
};
