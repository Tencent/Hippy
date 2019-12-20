/* eslint-disable */

(function (event_type, err) {
  try {
    if (global.__GLOBAL__ && global.__GLOBAL__.globalErrorHandle && global.__GLOBAL__.globalErrorHandle.uncaughtException) {
      global.__GLOBAL__.globalErrorHandle.uncaughtException(err);
    } else {
      console.error(event_type, err);
    }
  } catch(e) {
    console.error(e);
  }
});