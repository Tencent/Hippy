export function throttle(func, wait) {
  let args;
  let result;
  let thisArg;
  let timeoutId;
  let lastCalled = 0;

  function trailingCall() {
    lastCalled = Date.now();
    timeoutId = null;
    result = func.apply(thisArg, args);
  }

  return function () {
    const now = Date.now();
    const remain = wait - (now - lastCalled);

    args = arguments;
    thisArg = this;

    if (remain <= 0) {
      lastCalled = now;
      result = func.apply(thisArg, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(trailingCall, remain);
    }
    return result;
  };
}

export function debounce(func, wait, immediate) {
  let args;
  let result;
  let thisArg;
  let timeoutId;

  function delayed() {
    timeoutId = null;
    if (!immediate) {
      result = func.apply(thisArg, args);
    }
  }

  return function () {
    const isImmediate = immediate && !timeoutId;
    args = arguments;
    thisArg = this;

    clearTimeout(timeoutId);
    timeoutId = setTimeout(delayed, wait);

    if (isImmediate) {
      result = func.apply(thisArg, args);
    }
    return result;
  };
}
