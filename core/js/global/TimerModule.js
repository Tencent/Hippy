const timer = internalBinding('TimerModule');

global.setTimeout = (cb, sleepTime) => timer.SetTimeout(cb, sleepTime);

global.clearTimeout = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearTimeout(timerId);
  }
};

global.setInterval = (cb, intervalTime) => timer.SetInterval(cb, intervalTime);

global.clearInterval = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearInterval(timerId);
  }
};
