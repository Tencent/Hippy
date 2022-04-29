/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { warn } from '../utils';

const BackAndroid = (() => ({
  exitApp() {
    warn('BackAndroid.exitApp is not supported in the web');
  },
  addListener() {
    warn('BackAndroid.addListener is not supported in the web');
    return {
      remove() { },
    };
  },
  removeListener() {
    warn('BackAndroid.removeListener is not supported in the web');
  },
  initEventListener() {
    warn('BackAndroid.initEventListener is not supported in the web');
  },
}))();

class Focusable extends React.Component {
  public componentDidMount() {
    warn('Focusable is not supported in the web');
  }
  public render(): React.ReactNode {
    return '';
  }
}

class HippyEventEmitter {
  public name: string;
  public constructor(name) {
    warn('HippyEventEmitter is not supported in the web');
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

const callNativeWithPromise = () => {
  warn('callNativeWithPromise is not supported in the web');
  return Promise.resolve('{}');
};

export {
  BackAndroid,
  Focusable,
  callNativeWithPromise,
  HippyEventEmitter,
};
