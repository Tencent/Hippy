__GLOBAL__.appRegister = {};
__GLOBAL__.nodeIdCache = {};
__GLOBAL__.nodeTreeCache = {};
__GLOBAL__.IosNodeTree = {};
__GLOBAL__.nodeParamCache = {};
__GLOBAL__.moduleCallId = 0;
__GLOBAL__.moduleCallList = {};
__GLOBAL__.DimensionsStore = {}; // TODO: Able to delete
__GLOBAL__.canRequestAnimationFrame = true;
__GLOBAL__.requestAnimationFrameId = 0;
__GLOBAL__.requestAnimationFrameQueue = {};
__GLOBAL__.const = {}; // TODO: Able to delete
__GLOBAL__.destroyInstanceList = {};
__GLOBAL__._callID = 0;
__GLOBAL__._callbackID = 0;
__GLOBAL__._callbacks = [];
__GLOBAL__._notDeleteCallbackIds = {};
__GLOBAL__._queue = [[], [], [], __GLOBAL__._callID];

__GLOBAL__.arrayContains = (array, value) => array.indexOf(value) !== -1;

__GLOBAL__.defineLazyObjectProperty = (object, name, descriptor) => {
  const { get } = descriptor;
  const enumerable = descriptor.enumerable !== false;
  const writable = descriptor.writable !== false;

  let value;
  let valueSet = false;

  const setValue = (newValue) => {
    value = newValue;
    valueSet = true;
    Object.defineProperty(object, name, {
      value: newValue,
      configurable: true,
      enumerable,
      writable,
    });
  };

  const getValue = () => {
    if (!valueSet) {
      setValue(get());
    }
    return value;
  };

  Object.defineProperty(object, name, {
    get: getValue,
    set: setValue,
    configurable: true,
    enumerable,
  });
};

__GLOBAL__.enqueueNativeCall = (moduleID, methodID, params, onFail, onSucc) => {
  if (onFail || onSucc) {
    if (typeof params === 'object' && params.length > 0 && typeof params[0] === 'object' && params[0].notDelete) {
      params.shift();

      __GLOBAL__._notDeleteCallbackIds[__GLOBAL__._callbackID] = true;
    }

    if (onFail) {
      params.push(__GLOBAL__._callbackID);
    }
    __GLOBAL__._callbacks[__GLOBAL__._callbackID] = onFail;
    __GLOBAL__._callbackID += 1;

    if (onSucc) {
      params.push(__GLOBAL__._callbackID);
    }
    __GLOBAL__._callbacks[__GLOBAL__._callbackID] = onSucc;
    __GLOBAL__._callbackID += 1;
  }

  __GLOBAL__._callID += 1;

  __GLOBAL__._queue[0].push(moduleID);
  __GLOBAL__._queue[1].push(methodID);
  __GLOBAL__._queue[2].push(params);

  if (typeof nativeFlushQueueImmediate !== 'undefined') {
    nativeFlushQueueImmediate(__GLOBAL__._queue);
    __GLOBAL__._queue = [[], [], [], __GLOBAL__._callID];
  }
};

__GLOBAL__.genModule = (config, moduleID) => {
  if (!config) {
    return null;
  }

  const [moduleName, constants, methods, promiseMethods, syncMethods] = config;

  if (!constants && !methods) {
    return { name: moduleName };
  }

  const module = {};
  if (methods) {
    methods.forEach((methodName, methodID) => {
      const isPromise = promiseMethods && __GLOBAL__.arrayContains(promiseMethods, methodID);
      const isSync = syncMethods && __GLOBAL__.arrayContains(syncMethods, methodID);
      let methodType = 'async';
      if (isPromise) {
        methodType = 'promise';
      } else if (isSync) {
        methodType = 'sync';
      }
      module[methodName] = __GLOBAL__.genMethod(moduleID, methodID, methodType);
    });
  }
  Object.assign(module, constants);

  return { name: moduleName, module };
};

global.__fbGenNativeModule = __GLOBAL__.genModule;

__GLOBAL__.loadModule = (name, moduleID) => {
  if (typeof nativeRequireModuleConfig !== 'undefined') {
    const config = nativeRequireModuleConfig(name);
    const info = __GLOBAL__.genModule(config, moduleID);
    return info && info.module;
  }

  return null;
};

__GLOBAL__.genMethod = (moduleID, methodID, type) => {
  let fn = null;
  if (type === 'promise') {
    fn = (...args) => new Promise((resolve, reject) => {
      __GLOBAL__.enqueueNativeCall(moduleID, methodID, args,
        (data) => { resolve(data); },
        (errorData) => { reject(errorData); });
    });
  } else if (type === 'sync') {
    fn = (...args) => nativeCallSyncHook(moduleID, methodID, args);
  } else {
    fn = (...args) => {
      const lastArg = args.length > 0 ? args[args.length - 1] : null;
      const secondLastArg = args.length > 1 ? args[args.length - 2] : null;
      const hasSuccessCallback = typeof lastArg === 'function';
      const hasErrorCallback = typeof secondLastArg === 'function';

      const onSuccess = hasSuccessCallback ? lastArg : null;
      const onFail = hasErrorCallback ? secondLastArg : null;
      const callbackCount = hasSuccessCallback + hasErrorCallback;
      const argv = args.slice(0, args.length - callbackCount);

      __GLOBAL__.enqueueNativeCall(moduleID, methodID, argv, onFail, onSuccess);
    };
  }
  fn.type = type;
  return fn;
};

__GLOBAL__.NativeModules = {
  UIManager: {
    Dimensions: {
      window: {
      },
    },
  },
};

if (typeof nativeModuleProxy !== 'undefined') {
  __GLOBAL__.NativeModules = nativeModuleProxy;
} else {
  const bridgeConfig = __fbBatchedBridgeConfig;

  ((bridgeConfig && bridgeConfig.remoteModuleConfig) || []).forEach((config, moduleID) => {
    const info = __GLOBAL__.genModule(config, moduleID);
    if (!info) {
      return;
    }

    if (info.module) {
      __GLOBAL__.NativeModules[info.name] = info.module;
    } else {
      __GLOBAL__.defineLazyObjectProperty(__GLOBAL__.NativeModules, info.name, {
        get: () => __GLOBAL__.loadModule(info.name, moduleID),
      });
    }
  });
}
