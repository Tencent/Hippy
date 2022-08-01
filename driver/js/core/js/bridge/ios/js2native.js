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

const needReject = (moduleName, methodName) => !(moduleName === 'StorageModule' || methodName === 'multiGet');

Hippy.bridge.callNative = (...callArguments) => {
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

  const NativeModule = __GLOBAL__.NativeModules[nativeModuleName];
  const callModuleMethod = NativeModule[nativeMethodName];
  if (NativeModule && typeof NativeModule[nativeMethodName] === 'function') {
    const paramList = [];
    for (let i = 2; i < callArguments.length; i += 1) {
      paramList.push(callArguments[i]);
    }
    callModuleMethod.apply(NativeModule, paramList.length ? paramList : undefined);
    return;
  }
  throw new ReferenceError(`callNative Native ${nativeModuleName}.${nativeMethodName}() not found`);
};

Hippy.bridge.callNativeWithPromise = (...callArguments) => {
  if (callArguments.length < 2) {
    return Promise.reject(new TypeError('callNativeWithPromise arguments length must be larger than 2'));
  }

  const [nativeModuleName, nativeMethodName] = callArguments;
  const NativeModule = __GLOBAL__.NativeModules[nativeModuleName];

  if (NativeModule && NativeModule[nativeMethodName]) {
    const callModuleMethod = NativeModule[nativeMethodName];
    const paramList = [];
    for (let i = 2; i < callArguments.length; i += 1) {
      paramList.push(callArguments[i]);
    }
    if (callModuleMethod.type === 'promise') {
      return callModuleMethod.apply(NativeModule, paramList);
    }
    return new Promise((resolve, reject) => {
      if (needReject(nativeModuleName, nativeMethodName)) {
        paramList.push(reject);
      }
      paramList.push(resolve);
      callModuleMethod.apply(NativeModule, paramList);
    });
  }
  return Promise.reject(new ReferenceError(`callNativeWithPromise Native ${nativeModuleName}.${nativeMethodName}() not found`));
};

Hippy.bridge.callNativeWithCallbackId = (...callArguments) => {
  if (callArguments.length < 3) {
    throw new TypeError('callNativeWithCallbackId arguments length must be larger than 3');
  }
  const [moduleName, methodName, autoDelete] = callArguments;
  if (callArguments.length === 3) {
    const NativeModule = __GLOBAL__.NativeModules[moduleName];
    if (NativeModule && NativeModule[methodName]) {
      if (autoDelete === false) {
        return NativeModule[methodName]({
          notDelete: true,
        });
      }
      return NativeModule[methodName]();
    }
  } else {
    const NativeModule = __GLOBAL__.NativeModules[moduleName];
    if (NativeModule && NativeModule[methodName]) {
      const callModuleMethod = NativeModule[methodName];
      const param = [];
      for (let i = 3; i < callArguments.length; i += 1) {
        param.push(callArguments[i]);
      }
      const currentCallId = __GLOBAL__.moduleCallId;
      __GLOBAL__.moduleCallId += 1;
      let nativeParam = [];
      if (autoDelete === false) {
        nativeParam.push({
          notDelete: true,
        });
      }
      nativeParam.push(currentCallId);
      nativeParam = nativeParam.concat(param);

      callModuleMethod.apply(
        NativeModule,
        nativeParam,
      );
      return currentCallId;
    }
  }
  throw new ReferenceError(`callNativeWithCallbackId Native ${moduleName}.${methodName}() not found`);
};

Hippy.bridge.removeNativeCallback = () => {};
