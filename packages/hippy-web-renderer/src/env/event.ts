export const dealloc = () => {
  if (Hippy) {
    Hippy.emit('dealloc');
  }
};


