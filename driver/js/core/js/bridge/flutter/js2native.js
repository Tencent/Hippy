/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

/**
 * moduleCallList/callback/type：
 *  0 : native call callback, delete cache from moduleCallList immediately
 *  1 : naive call callback, delete cache from moduleCallList by js
 *  2 : delete cache from moduleCallList whenever js want
 */

const deepFindFunction = (arr) => {
  for (let j = 0; j < arr.length; j += 1) {
    if (typeof arr[j] === 'function') {
      return arr.splice(j, 1)[0];
    } if (Array.isArray(arr[j])) {
      return deepFindFunction(arr[j]);
    }
  }
  return undefined;
};

Hippy.bridge.callNative = (...callArguments) => {
  if (typeof hippyCallNatives === 'undefined') {
    throw new ReferenceError('hippyCallNatives not defined');
  }

  if (callArguments.length < 2) {
    throw new TypeError('Arguments length must be larger than 2');
  }

  const currentCallId = __GLOBAL__.moduleCallId;
  __GLOBAL__.moduleCallId += 1;

  const param = [];
  let cbCount = 0;

  for (let i = 2; i < callArguments.length; i += 1) {
    if (cbCount === 0) {
      if (typeof callArguments[i] === 'function') {
        cbCount += 1;
        __GLOBAL__.moduleCallList[currentCallId] = {
          cb: callArguments[i],
          type: 0,
        };
      } else if (Array.isArray(callArguments[i])) {
        // for ios
        const func = deepFindFunction(callArguments[i]);
        if (func) {
          cbCount += 1;
          __GLOBAL__.moduleCallList[currentCallId] = {
            cb: func,
            type: 0,
          };
        }
        param.push(callArguments[i]);
      } else {
        param.push(callArguments[i]);
      }
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

Hippy.bridge.callNativeWithPromise = (...callArguments) => {
  if (typeof hippyCallNatives === 'undefined') {
    return Promise.reject(new ReferenceError('hippyCallNatives not defined'));
  }

  if (callArguments.length < 2) {
    return Promise.reject(new TypeError('Arguments length must be larger than 2'));
  }

  return new Promise((resolve, rj) => {
    const currentCallId = __GLOBAL__.moduleCallId;
    __GLOBAL__.moduleCallId += 1;

    const param = [];
    let cbCount = 0;

    for (let i = 2; i < callArguments.length; i += 1) {
      if (cbCount === 0) {
        if (typeof callArguments[i] === 'function') {
          cbCount += 1;
          __GLOBAL__.moduleCallList[currentCallId] = {
            cb: callArguments[i],
            type: 0,
          };
        } else if (Array.isArray(callArguments[i])) {
          // for ios
          const func = deepFindFunction(callArguments[i]);
          if (func) {
            cbCount += 1;
            __GLOBAL__.moduleCallList[currentCallId] = {
              cb: func,
              type: 0,
            };
          }
          param.push(callArguments[i]);
        } else {
          param.push(callArguments[i]);
        }
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

Hippy.bridge.callNativeWithCallbackId = (...callArguments) => {
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
  const param = [];

  if (callModuleName === 'AnimationModule' && (callFuncName === 'createAnimation' || callFuncName === 'createAnimationSet')) {
    param.push(currentCallId);
  }

  let cbCount = 0;
  for (let i = 2; i < callArguments.length; i += 1) {
    if (cbCount === 0) {
      if (typeof callArguments[i] === 'function') {
        cbCount += 1;
        __GLOBAL__.moduleCallList[currentCallId] = {
          cb: callArguments[i],
          type: 0,
        };
      } else if (Array.isArray(callArguments[i])) {
        // for ios
        const func = deepFindFunction(callArguments[i]);
        if (func) {
          cbCount += 1;
          __GLOBAL__.moduleCallList[currentCallId] = {
            cb: func,
            type: 0,
          };
        }
        param.push(callArguments[i]);
      } else {
        param.push(callArguments[i]);
      }
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

Hippy.bridge.removeNativeCallback = (callId) => {
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
