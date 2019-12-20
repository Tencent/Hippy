global.requestAnimationFrame = (cb) => {
  if (cb) {
    if (__GLOBAL__.canRequestAnimationFrame) {
      __GLOBAL__.requestAnimationFrameId = __GLOBAL__.moduleCallId;
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId] = [];
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId].push(cb);

      __GLOBAL__.canRequestAnimationFrame = false;

      Hippy.bridge.callNativeWithCallbackId('AnimationFrameModule', 'requestAnimationFrame', true);
    } else if (__GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId]) {
      __GLOBAL__.requestAnimationFrameQueue[__GLOBAL__.requestAnimationFrameId].push(cb);
    }

    return '';
  }

  throw new TypeError('Invalid arguments');
};

global.cancelAnimationFrame = () => {};
