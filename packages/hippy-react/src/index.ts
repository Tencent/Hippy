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

import './global';
import { colorParse } from './color';
import HippyReact from './hippy';
import AppRegistry from './adapters/app-registry';
import Animated from './adapters/animated';
import Easing from './adapters/easing';
import Animation from './modules/animation';
import AnimationSet from './modules/animation-set';
import WebSocket from './modules/websocket';
import * as Native from './native';
export * from './modules/stylesheet';
export * from './event';
export * from './components';
export * from './dom';
export * from './types';

global.WebSocket = WebSocket as HippyTypes.WebSocket;

const {
  AsyncStorage,
  BackAndroid,
  Bridge,
  Clipboard,
  Cookie: NetworkModule,
  Device,
  HippyRegister,
  ImageLoader: ImageLoaderModule,
  NetworkInfo: NetInfo,
  UIManager: UIManagerModule,
  flushSync,
} = Native;

const {
  callNative,
  callNativeWithPromise,
  callNativeWithCallbackId,
  removeNativeCallback,
} = Bridge;

const TimerModule = null;
// @ts-ignore
const ConsoleModule = global.ConsoleModule || global.console;
const Platform = Device.platform;
const Hippy = HippyReact;
const RNfqb = HippyReact;

// Forward compatibilities
const RNfqbRegister = HippyRegister;

const Dimensions = {
  get(name: 'window' | 'screen') {
    return Device[name];
  },
};

const PixelRatio = {
  get() {
    return Device.screen.scale;
  },
};

export {
  flushSync,
  colorParse,
  callNative,
  callNativeWithPromise,
  callNativeWithCallbackId,
  removeNativeCallback,
  RNfqbRegister,
  HippyRegister,
  AsyncStorage,
  AppRegistry,
  Animated,
  Easing,
  UIManagerModule,
  Dimensions,
  PixelRatio,
  TimerModule,
  NetworkModule,
  NetInfo,
  Clipboard,
  ConsoleModule,
  ImageLoaderModule,
  Platform,
  BackAndroid,
  Animation,
  AnimationSet,
  Hippy,
  RNfqb,
  WebSocket,
};
type Style = HippyTypes.Style;
type HippyTypes = typeof HippyTypes;
export type { Style, HippyTypes };
export default HippyReact;
