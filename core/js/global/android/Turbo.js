/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

function turboPromise(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const callbackId = __GLOBAL__.moduleCallId;
      __GLOBAL__.moduleCallId += 1;
      __GLOBAL__.moduleCallList[callbackId] = {
        cb: result => resolve(result),
        reject,
        type: 0,
      };
      func.apply(this, [...args, `${callbackId}`]);
    });
  };
}

Hippy.turboPromise = turboPromise;
