import { EventBus } from './runtime/event/event-bus';
import { Native } from './runtime/native';

const DEVICE_MODULE = 'DeviceEventModule';
const backPressSubscriptions = new Set();
let hasInitialized = false;

/**
 * 安卓物理返回键事件监听
 */
const realBackAndroid = {
  /**
   * 退出APP
   */
  exitApp() {
    Native.callNative(DEVICE_MODULE, 'invokeDefaultBackPressHandler');
  },
  /**
   * 添加物理按键监听事件
   *
   * @param handler - 处理事件
   *
   */
  addListener(handler) {
    if (!hasInitialized) {
      hasInitialized = true;
      realBackAndroid.initEventListener();
    }
    Native.callNative(DEVICE_MODULE, 'setListenBackPress', true);
    backPressSubscriptions.add(handler);
    return {
      remove() {
        realBackAndroid.removeListener(handler);
      },
    };
  },

  /**
   * 移除物理按键监听事件
   *
   * @param handler - 处理事件
   */
  removeListener(handler) {
    backPressSubscriptions.delete(handler);
    if (backPressSubscriptions.size === 0) {
      Native.callNative(DEVICE_MODULE, 'setListenBackPress', false);
    }
  },

  /**
   * 初始化事件监听器
   */
  initEventListener() {
    // Vue3无$on $off等，使用tiny-emitter提供的事件总线
    EventBus.$on('hardwareBackPress', () => {
      let invokeDefault = true;
      const subscriptions = Array.from(backPressSubscriptions).reverse();
      subscriptions.every((subscription) => {
        if (typeof subscription === 'function' && subscription()) {
          invokeDefault = false;
          return false;
        }
        return true;
      });
      if (invokeDefault) {
        realBackAndroid.exitApp();
      }
    });
  },
};

/**
 * 为iOS模拟物理返回按键的处理事件
 */
const fakeBackAndroid = {
  exitApp() {},
  addListener() {
    return {
      remove() {},
    };
  },
  removeListener() {},
  initEventListener() {},
};

/**
 * 安卓物理返回按键处理
 *
 * @public
 */
export const BackAndroid = (() => {
  if (Native.isAndroid()) {
    return realBackAndroid;
  }
  return fakeBackAndroid;
})();
