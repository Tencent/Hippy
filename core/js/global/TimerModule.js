const timer = internalBinding('TimerModule');

global.setTimeout = (cb, sleepTime, ...args) => timer.SetTimeout(() => cb(...args), sleepTime);

global.clearTimeout = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearTimeout(timerId);
  }
};

global.setInterval = (cb, intervalTime, ...args) => timer.SetInterval(() => cb(...args), intervalTime);

global.clearInterval = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearInterval(timerId);
  }
};
