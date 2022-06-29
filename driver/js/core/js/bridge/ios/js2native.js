/* eslint-disable no-undef */
const UIManagerModule = internalBinding('UIManagerModule');

const getModuleName = (originModuleName) => {
  if (originModuleName === 'UIManagerModule') {
    return 'UIManager';
  }
  if (originModuleName === 'StorageModule') {
    return 'AsyncStorage';
  }
  return originModuleName;
};

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
    return UIManagerModule.callUIFunction(nodeId, nativeMethodName, [], callbackFunc);
  }

  const NativeModule = __GLOBAL__.NativeModules[getModuleName(nativeModuleName)];
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
  const NativeModule = __GLOBAL__.NativeModules[getModuleName(nativeModuleName)];

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
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(moduleName)];
    if (NativeModule && NativeModule[methodName]) {
      if (autoDelete === false) {
        return NativeModule[methodName]({
          notDelete: true,
        });
      }
      return NativeModule[methodName]();
    }
  } else {
    const NativeModule = __GLOBAL__.NativeModules[getModuleName(moduleName)];
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
