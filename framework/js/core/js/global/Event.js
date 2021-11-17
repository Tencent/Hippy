global.HippyDealloc = () => {
  if (global.Hippy) {
    global.Hippy.emit('dealloc');
  }
};
