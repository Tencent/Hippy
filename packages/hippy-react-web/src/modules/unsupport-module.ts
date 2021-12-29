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
  public render(): React.ReactNode {
    return '';
  }
}

class HippyEventEmitter {
  public name: string;
  public constructor(name) {
    this.name = name;
  }
  public sharedListeners() {

  }
  public addListener() {

  }
  public removeAllListeners() {

  }
  public emit() {
    return true;
  }
  public listenerSize() {

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
