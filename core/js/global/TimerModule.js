/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */

const timer = internalBinding('TimerModule');

global.setTimeout = function (cb, sleepTime) {
  const args = Array.prototype.slice.call(arguments, 2);
  return timer.SetTimeout(() => cb.apply(null, args), sleepTime);
};

global.clearTimeout = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearTimeout(timerId);
  }
};

global.setInterval = function (cb, intervalTime) {
  const args = Array.prototype.slice.call(arguments, 2);
  return timer.SetInterval(() => cb.apply(null, args), intervalTime);
};

global.clearInterval = (timerId) => {
  if (Number.isInteger(timerId) && timerId > 0) {
    timer.ClearInterval(timerId);
  }
};
