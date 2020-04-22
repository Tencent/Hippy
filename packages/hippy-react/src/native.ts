import * as HippyGlobal from './global';
import * as Clipboard from './modules/clipboard';
import * as Cookie from './modules/cookie-module';
import * as ImageLoader from './modules/image-loader-module';
import * as NetworkInfo from './modules/network-info';
import * as UIManager from './modules/ui-manager-module';
import BackAndroid from './modules/back-android';

const {
  addEventListener,
  AsyncStorage,
  Bridge,
  Device,
  HippyRegister,
} = HippyGlobal;

export {
  addEventListener,
  AsyncStorage,
  BackAndroid,
  Bridge,
  Clipboard,
  Cookie,
  Device,
  HippyRegister,
  ImageLoader,
  NetworkInfo,
  UIManager,
};
