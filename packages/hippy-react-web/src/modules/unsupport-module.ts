import React from 'react';
import { warn } from '../utils';

const BackAndroid = (() => ({
  exitApp() {
    warn('BackAndroid.exitApp is not suported in the web');
  },
  addListener() {
    warn('BackAndroid.addListener is not suported in the web');
    return {
      remove() { },
    };
  },
  removeListener() {
    warn('BackAndroid.removeListener is not suported in the web');
  },
  initEventListener() {
    warn('BackAndroid.initEventListener is not suported in the web');
  },
}))();

class Focusable extends React.Component {
  public componentDidMount() {
    warn('Focusable is not suported in the web');
  }
  public render(): React.ReactNode {
    return '';
  }
}

class HippyEventEmitter {
  public name: string;
  public constructor(name) {
    warn('HippyEventEmitter is not suported in the web');
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

const callNative = () => {
  warn('callNative is not suported in the web');
};
const callNativeWithPromise = () => {
  warn('callNativeWithPromise is not suported in the web');
};

export {
  BackAndroid,
  Focusable,
  callNative,
  callNativeWithPromise,
  HippyEventEmitter,
};
