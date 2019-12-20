import './global';
import {
  HippyEventEmitter,
  HippyEventListener,
} from './events';
import {
  HippyRegister,
  Device,
  AsyncStorage,
  Bridge,
} from './native';
import { colorParse } from './color';
import Hippy from './hippy';
import AppRegistry from './adapters/app-registry';
import Animated from './adapters/animated';
import Easing from './adapters/easing';
import BackAndroid from './modules/back-android';
import Animation from './modules/animation';
import AnimationSet from './modules/animation-set';
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
import Focusable from './components/focusable';
import WebView from './components/web-view';
import * as Clipboard from './modules/clipboard';
import * as ImageLoaderModule from './modules/image-loader-module';
import * as NetInfo from './modules/net-info';
import * as NetworkModule from './modules/network-module';
import * as StyleSheet from './modules/stylesheet';
import * as UIManagerModule from './modules/ui-manager-module';

const { __GLOBAL__ } = global;

const GlobalEventEmitter = new HippyEventEmitter();

GlobalEventEmitter.addListener('startPerformanceMonitor', () => {
  __GLOBAL__.report_js_trace = true;
});

GlobalEventEmitter.addListener('endPerformanceMonitor', () => {
  __GLOBAL__.report_js_trace = false;
});

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

const {
  callNative,
  callNativeWithPromise,
  callNativeWithCallbackId,
  removeNativeCallback,
} = Bridge;
const TimerModule = null;
const ConsoleModule = console;
const Platform = Device.platform;
const RNfqb = Hippy;
const ImageBackground = Image;

// Forward compatibilities
const RNfqbRegister = HippyRegister;
const RNfqbEventEmitter = HippyEventEmitter;
const RNfqbEventListener = HippyEventListener;

export {
  colorParse,
  callNative,
  callNativeWithPromise,
  callNativeWithCallbackId,
  removeNativeCallback,
  RNfqbRegister,
  RNfqbEventEmitter,
  RNfqbEventListener,
  HippyRegister,
  HippyEventEmitter,
  HippyEventListener,
  AsyncStorage,
  AppRegistry,
  Animated,
  Easing,
  UIManagerModule,
  StyleSheet,
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
  View,
  Text,
  Image,
  ListView,
  RefreshWrapper,
  Navigator,
  ViewPager,
  TextInput,
  ScrollView,
  Modal,
  Focusable,
  WebView,
  ImageBackground,
};
