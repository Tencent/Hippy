(function exceptionHandler(eventName, err) {
  if (global.Hippy) {
    global.Hippy.emit('uncaughtException', err);
  } else {
    /* eslint-disable-next-line no-console */
    console.error(eventName, err);
  }
});
