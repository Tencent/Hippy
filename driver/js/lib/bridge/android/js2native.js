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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

/**
 * moduleCallList/callback/type：
 *  0 : native call callback, delete cache from moduleCallList immediately
 *  1 : naive call callback, delete cache from moduleCallList by js
 *  2 : delete cache from moduleCallList whenever js want
 */

Hippy.bridge.callNative = (...callArguments) => {
  if (typeof global.hippyCallNatives === 'undefined') {
    throw new ReferenceError('hippyCallNatives not defined');
  }

  if (callArguments.length < 2) {
    throw new TypeError('callNative arguments length must be larger than 2');
  }

  const [nativeModuleName, nativeMethodName] = callArguments;

  // compatible for Hippy2.0
  if (nativeModuleName === 'UIManagerModule'
    && (nativeMethodName === 'measure' || nativeMethodName === 'measureInWindow' || nativeMethodName === 'measureInAppWindow')) {
    const nodeId = callArguments[2];
    const callbackFunc = callArguments[3];
    return global.Hippy.document.callUIFunction(nodeId, nativeMethodName, [], callbackFunc);
  }

  const currentCallId = __GLOBAL__.moduleCallId;
  __GLOBAL__.moduleCallId += 1;

  const paramList = [];
  let hasCallback = false;
  let moduleCallbackId = -1;

  for (let i = 2; i < callArguments.length; i += 1) {
    const args = callArguments[i];
    if (typeof args === 'function' && !hasCallback) {
      hasCallback = true;
      __GLOBAL__.moduleCallList[currentCallId] = {
        cb: args,
        type: 0,
      };
    } else {
      paramList.push(args);
    }
  }
  if (hasCallback) {
    moduleCallbackId = currentCallId;
  }

  global.hippyCallNatives(nativeModuleName, nativeMethodName, (moduleCallbackId.toString()), paramList);
};

Hippy.bridge.callNativeWithPromise = (...callArguments) => {
  if (typeof global.hippyCallNatives === 'undefined') {
    return Promise.reject(new ReferenceError('hippyCallNatives not defined'));
  }

  if (callArguments.length < 2) {
    return Promise.reject(new TypeError('callNativeWithPromise arguments length must be larger than 2'));
  }

  return new Promise((resolve, reject) => {
    const [nativeModuleName, nativeMethodName] = callArguments;

    const currentCallId = __GLOBAL__.moduleCallId;
    __GLOBAL__.moduleCallId += 1;

    const paramList = [];
    let hasCallback = false;

    for (let i = 2; i < callArguments.length; i += 1) {
      const args = callArguments[i];
      if (typeof args === 'function' && !hasCallback) {
        hasCallback = true;
        __GLOBAL__.moduleCallList[currentCallId] = {
          reject,
          cb: args,
          type: 0,
        };
      } else {
        paramList.push(args);
      }
    }

    if (!hasCallback) {
      __GLOBAL__.moduleCallList[currentCallId] = {
        reject,
        cb: resolve,
        type: 0,
      };
    }

    global.hippyCallNatives(nativeModuleName, nativeMethodName, (currentCallId.toString()), paramList);
  });
};

Hippy.bridge.callNativeWithCallbackId = (...callArguments) => {
  if (typeof global.hippyCallNatives === 'undefined') {
    throw new ReferenceError('hippyCallNatives not defined');
  }

  if (callArguments.length < 3) {
    throw new TypeError('callNativeWithCallbackId arguments length must be larger than 3');
  }

  const [nativeModuleName, nativeMethodName, autoDelete] = callArguments;

  if (typeof nativeModuleName !== 'string' || typeof nativeMethodName !== 'string' || typeof autoDelete !== 'boolean') {
    throw new TypeError('callNativeWithCallbackId invalid arguments');
  }

  const currentCallId = __GLOBAL__.moduleCallId;
  __GLOBAL__.moduleCallId += 1;
  const paramList = [];
  let hasCallback = false;

  for (let i = 3; i < callArguments.length; i += 1) {
    const args = callArguments[i];
    if (typeof args === 'function' && !hasCallback) {
      hasCallback = true;
      __GLOBAL__.moduleCallList[currentCallId] = {
        cb: args,
        type: autoDelete ? 1 : 2,
      };
    } else {
      paramList.push(args);
    }
  }

  global.hippyCallNatives(nativeModuleName, nativeMethodName, (currentCallId.toString()), paramList);
  return currentCallId;
};

Hippy.bridge.removeNativeCallback = (callId) => {
  if (typeof callId !== 'number' || callId < 0) {
    throw new TypeError('removeNativeCallback invalid arguments');
  }

  if (typeof __GLOBAL__ !== 'object' || typeof __GLOBAL__.moduleCallList !== 'object') {
    throw new ReferenceError('removeNativeCallback moduleCallList not defined');
  }

  const callbackObject = __GLOBAL__.moduleCallList[callId];
  // force delete
  if (callbackObject && (callbackObject.type === 1 || callbackObject.type === 2)) {
    delete __GLOBAL__.moduleCallList[callId];
  }
};
