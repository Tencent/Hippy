/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

function turboPromise(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const failCallbackId = __GLOBAL__._callbackID;
      __GLOBAL__._callbacks[failCallbackId] = (data) => {
        resolve(data);
      };
      __GLOBAL__._callbackID += 1;
      const successCallbackId = __GLOBAL__._callbackID;
      __GLOBAL__._callbacks[successCallbackId] = (errorData) => {
        reject(errorData);
      };
      __GLOBAL__._callbackID += 1;
      func.apply(this, [...args, failCallbackId, successCallbackId]);
    });
  };
}

Hippy.turboPromise = turboPromise;
