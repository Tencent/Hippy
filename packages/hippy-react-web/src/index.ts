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
import {
  Device,
} from './native';
import HippyReact from './hippy';
import View from './components/view';
import Text from './components/text';
import Image from './components/image';
import ListView from './components/list-view';
import RefreshWrapper from './components/refresh-wrapper';
import Navigator from './components/navigator';
import ViewPager from './components/view-pager';
import TextInput from './components/text-input';
import ScrollView from './components/scroll-view';
import Modal from './components/modal';
import WebView from './components/web-view';
import VideoPlayer from './components/video-player';
import Animation from './modules/animation';
import AnimationSet from './modules/animation-set';
import StyleSheet from './modules/stylesheet';
import * as NetInfo from './modules/net-info';
import * as NetworkModule from './modules/network-module';

const Hippy = HippyReact;
const ConsoleModule = console;

const Platform = {
  OS: Device.platform,
};

const Dimensions = {
  get(name: 'window' | 'screen') {
    return Device[name];
  },
  set(dimensions: { window?: typeof Device['window']; screen?: typeof Device['screen'] }) {
    if (typeof window === 'object') {
      /* eslint-disable-next-line no-console */
      console.error('Dimensions cannot be set in the browser');
      return;
    }
    if (dimensions.window) {
      Device.window = dimensions.window;
    }
    if (dimensions.screen) {
      Device.screen = dimensions.screen;
    }
  },
};

const PixelRatio = {
  get() {
    return Device.screen.scale;
  },
};

const AsyncStorage = typeof window === 'object' ? localStorage : null;
const ImageBackground = Image;

export default HippyReact;
export {
  Hippy,
  View,
  Text,
  Image,
  ImageBackground,
  ListView,
  RefreshWrapper,
  Navigator,
  ViewPager,
  TextInput,
  ScrollView,
  Modal,
  WebView,
  VideoPlayer,
  Animation,
  AnimationSet,
  StyleSheet,
  NetworkModule,
  ConsoleModule,
  Platform,
  Dimensions,
  PixelRatio,
  AsyncStorage,
  NetInfo,
};
