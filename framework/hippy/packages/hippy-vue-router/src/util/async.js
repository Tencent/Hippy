function runQueue(queue, fn, cb) {
  const step = (index) => {
    if (index >= queue.length) {
      cb();
    } else if (queue[index]) {
      fn(queue[index], () => {
        step(index + 1);
      });
    } else {
      step(index + 1);
    }
  };
  step(0);
}

export default runQueue;
