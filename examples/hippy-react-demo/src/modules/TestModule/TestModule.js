import { callNative, callNativeWithPromise } from 'hippy-react';

/*
 自定义module
 */
const TestModule = {
  log(msg) {
    callNative('TestModule', 'log', msg);
  },
  helloNative(msg) {
    callNative('TestModule', 'helloNative', msg);
  },
  // 这个是需要终端回调的
  helloNativeWithPromise(msg) {
    return callNativeWithPromise('TestModule', 'helloNativeWithPromise', msg);
  },
};

export default TestModule;
