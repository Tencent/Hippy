/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

export interface HippyJsBridge {
  callNative(moduleName: string, methodName: string, ...args: any[]): void;
  callNativeWithCallbackId(moduleName: string, methodName: string, ...args: any[]): number;
  callNativeWithPromise<T>(moduleName: string, methodName: string, ...args: any[]): Promise<T>;
  removeNativeCallback(callbackId: number): void;
}


const callNative = (...callArguments) => {
  if (typeof hippyCallNatives === 'undefined') {
    throw new ReferenceError('hippyCallNatives not defined');
  }

  if (callArguments.length < 2) {
    throw new TypeError('Arguments length must be larger than 2');
  }

  const currentCallId = __GLOBAL__.moduleCallId;
  __GLOBAL__.moduleCallId += 1;

  const param: any[] = [];
  let cbCount = 0;

  for (let i = 2; i < callArguments.length; i += 1) {
    if (typeof callArguments[i] === 'function' && cbCount === 0) {
      cbCount += 1;
      __GLOBAL__.moduleCallList[currentCallId] = {
        cb: callArguments[i],
        type: 0,
      };
    } else {
      param.push(callArguments[i]);
    }
  }

  let moduleCallbackId = -1;
  if (cbCount > 0) {
    moduleCallbackId = currentCallId;
  }

  hippyCallNatives(callArguments[0], callArguments[1], (moduleCallbackId.toString()), param);
};

const callNativeWithPromise = <T>(...callArguments): Promise<T> => {
  if (typeof hippyCallNatives === 'undefined') {
    return Promise.reject(new ReferenceError('hippyCallNatives not defined'));
  }

  if (callArguments.length < 2) {
    return Promise.reject(new TypeError('Arguments length must be larger than 2'));
  }

  return new Promise((resolve, rj) => {
    const currentCallId = __GLOBAL__.moduleCallId;
    __GLOBAL__.moduleCallId += 1;

    const param: any[] = [];
    let cbCount = 0;

    for (let i = 2; i < callArguments.length; i += 1) {
      if (typeof callArguments[i] === 'function' && cbCount === 0) {
        cbCount += 1;
        __GLOBAL__.moduleCallList[currentCallId] = {
          cb: callArguments[i],
          reject: rj,
          type: 0,
        };
      } else {
        param.push(callArguments[i]);
      }
    }

    if (cbCount === 0) {
      __GLOBAL__.moduleCallList[currentCallId] = {
        cb: resolve,
        reject: rj,
        type: 0,
      };
    }

    hippyCallNatives(callArguments[0], callArguments[1], (currentCallId.toString()), param);
  });
};

const callNativeWithCallbackId = (...callArguments) => {
  if (typeof hippyCallNatives === 'undefined') {
    throw new ReferenceError('hippyCallNatives not defined');
  }

  if (callArguments.length < 3) {
    throw new TypeError('Arguments length must be larger than 3');
  }

  const callModuleName = callArguments[0];
  const callFuncName = callArguments[1];
  const autoDelete = callArguments[2];

  if (typeof callModuleName !== 'string' || typeof callFuncName !== 'string' || typeof autoDelete !== 'boolean') {
    throw new TypeError('Invalid arguments');
  }

  const currentCallId = __GLOBAL__.moduleCallId;
  __GLOBAL__.moduleCallId += 1;
  const param: any[] = [];

  if (callModuleName === 'AnimationModule' && (callFuncName === 'createAnimation' || callFuncName === 'createAnimationSet')) {
    param.push(currentCallId);
  }

  let cbCount = 0;
  for (let i = 3; i < callArguments.length; i += 1) {
    if (typeof callArguments[i] === 'function' && cbCount === 0) {
      cbCount += 1;
      __GLOBAL__.moduleCallList[currentCallId] = {
        cb: callArguments[i],
        type: autoDelete ? 1 : 2,
      };
    } else {
      param.push(callArguments[i]);
    }
  }

  if (callModuleName === 'TimerModule' || callModuleName === 'AnimationFrameModule') {
    param.push((currentCallId.toString()));
  }

  hippyCallNatives(callModuleName, callFuncName, (currentCallId.toString()), param);

  return currentCallId;
};

const removeNativeCallback = (callId) => {
  if (typeof callId !== 'number' || callId < 0) {
    throw new TypeError('Invalid arguments');
  }

  if (typeof __GLOBAL__ !== 'object' || typeof __GLOBAL__.moduleCallList !== 'object') {
    throw new ReferenceError('moduleCallList not defined');
  }

  const callbackObject = __GLOBAL__.moduleCallList[callId];
  if (callbackObject && (callbackObject.type === 1 || callbackObject.type === 2)) {
    delete __GLOBAL__.moduleCallList[callId];
  }
};

export const bridge: HippyJsBridge = {
  callNative,
  callNativeWithCallbackId,
  callNativeWithPromise,
  removeNativeCallback,
};
