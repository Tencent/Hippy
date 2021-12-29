import React from 'react';

const BackAndroid = (() => ({
  exitApp() { },
  addListener() {
    return {
      remove() { },
    };
  },
  removeListener() { },
  initEventListener() { },
}))();

class Focusable extends React.Component {
  render(): React.ReactNode {
    return '';
  }
}

class HippyEventEmitter {
  name: string;
  constructor(name) {
    this.name = name;
  }
  sharedListeners() {

  }
  addListener() {

  }
  removeAllListeners() {

  }
  emit() {
    return true;
  }
  listenerSize() {

  }
}

const callNative = () => { };
const callNativeWithPromise = () => { };

export {
  BackAndroid,
  Focusable,
  callNative,
  callNativeWithPromise,
  HippyEventEmitter,
};
