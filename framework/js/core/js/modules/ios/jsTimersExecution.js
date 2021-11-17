/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

let performanceNow;

if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
  performanceNow = () => performance.now();
} else {
  performanceNow = () => Date.now();
}

const JSTimersExecution = {
  GUID: 1,
  immediates: [],
  timerIDs: [],
  types: [],
  callbacks: [],
  errors: [],
  identifiers: [],
  callImmediatesPass() {
    if (JSTimersExecution.immediates.length > 0) {
      const passImmediates = JSTimersExecution.immediates.slice();
      JSTimersExecution.immediates = [];

      passImmediates.forEach((immediate) => {
        JSTimersExecution.callTimer(immediate);
      });
    }

    return JSTimersExecution.immediates.length > 0;
  },
  callImmediates() {
    while (JSTimersExecution.callImmediatesPass()) {
      // repeat call callImmediatesPass, until return false
    }
  },
  callTimer(timerID) {
    const timerIndex = JSTimersExecution.timerIDs.indexOf(timerID);
    if (timerIndex === -1) {
      return;
    }

    const type = JSTimersExecution.types[timerIndex];
    const callback = JSTimersExecution.callbacks[timerIndex];
    if (!callback || !type) {
      console.error(`No callback found for timerID ${timerID}`); // eslint-disable-line
      return;
    }

    if (type === 'requestAnimationFrame') {
      JSTimersExecution._clearIndex(timerIndex);
    }

    try {
      if (type === 'requestAnimationFrame') {
        callback(performanceNow());
      } else {
        console.error(`Tried to call a callback with invalid type: ${type}`); // eslint-disable-line
      }
    } catch (e) {
      if (!JSTimersExecution.errors) {
        JSTimersExecution.errors = [e];
      } else {
        JSTimersExecution.errors.push(e);
      }
    }
  },
  _clearIndex(i) {
    JSTimersExecution.timerIDs[i] = null;
    JSTimersExecution.callbacks[i] = null;
    JSTimersExecution.types[i] = null;
    JSTimersExecution.identifiers[i] = null;
  },
};

exports.JSTimersExecution = JSTimersExecution;
