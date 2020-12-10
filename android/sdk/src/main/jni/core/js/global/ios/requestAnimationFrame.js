const { JSTimersExecution } = require('../../modules/ios/jsTimersExecution.js');

const RCTTiming = __GLOBAL__.NativeModules.Timing;

global.requestAnimationFrame = (func) => {
  const id = JSTimersExecution.GUID;
  JSTimersExecution.GUID += 1;
  let freeIndex = JSTimersExecution.timerIDs.indexOf(null);

  if (freeIndex === -1) {
    freeIndex = JSTimersExecution.timerIDs.length;
  }

  JSTimersExecution.timerIDs[freeIndex] = id;
  JSTimersExecution.callbacks[freeIndex] = func;
  JSTimersExecution.types[freeIndex] = 'requestAnimationFrame';
  RCTTiming.createTimer(id, 1, Date.now(), /* recurring */ false);

  return id;
};

global.cancelAnimationFrame = (timerID) => {
  if (timerID == null) {
    return;
  }

  const index = JSTimersExecution.timerIDs.indexOf(timerID);
  if (index !== -1) {
    JSTimersExecution._clearIndex(index);
    RCTTiming.deleteTimer(timerID);
  }
};
