/* eslint-disable no-console */

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[hippy-vue-router] ${message}`);
  }
}

function warn(condition, message) {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    if (typeof console !== 'undefined') {
      console.warn(`[hippy-vue-router] ${message}`);
    }
  }
}

function isError(err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1;
}

export {
  assert,
  warn,
  isError,
};
