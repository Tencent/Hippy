import './global';
import {
  Device,
} from './native';
import Hippy from './hippy';
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
import StyleSheet from './modules/StyleSheet';
import * as NetInfo from './modules/net-info';
import * as NetworkModule from './modules/network-module';

const ConsoleModule = console;

const Platform = {
  OS: Device.platform,
};

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

const AsyncStorage = localStorage;
const ImageBackground = Image;

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
