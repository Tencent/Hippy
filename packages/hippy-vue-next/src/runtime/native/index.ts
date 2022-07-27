/**
 * Native提供的global接口
 */
import { isFunction } from '@vue/shared';
import { translateColor } from '@next-css-loader/index';
import type { CallbackType } from '../../../global';
import { NATIVE_COMPONENT_MAP } from '../../config';
import { trace } from '../../util';
import { type HippyNode } from '../node/hippy-node';

import { type NativeInterfaceMap } from './modules';

/** 扩展global接口定义 */
declare global {
  // 这里是为了typescript扩展global定义所使用的 var，所以disable eslint
  // eslint-disable-next-line no-var,@typescript-eslint/naming-convention,vars-on-top
  var Hippy: any;
  // eslint-disable-next-line no-var,@typescript-eslint/naming-convention,vars-on-top
  var __HIPPYNATIVEGLOBAL__: any;
  // eslint-disable-next-line no-var,vars-on-top
  var localStorage: Storage;
}

/** 屏幕维度信息 */
interface ScreenInfo {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  statusBarHeight: number;
  navigatorBarHeight: number;
}

interface Dimensions {
  window: ScreenInfo;
  screen: ScreenInfo;
}

/** 元素位置信息类型 */
interface MeasurePosition {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

/** Native位置信息类型 */
interface NativePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* 图片size类型 */
interface ImageSize {
  width: number;
  height: number;
}

// 取出对应函数的签名
type CallNativeFunctionSignature<
  K extends keyof NativeInterfaceMap,
  T extends keyof NativeInterfaceMap[K],
> = NativeInterfaceMap[K][T] extends (...args: any[]) => any
  ? NativeInterfaceMap[K][T]
  : never;

// 调用终端接口的模块类型
interface CallNativeFunctionType {
  <K extends keyof NativeInterfaceMap, T extends keyof NativeInterfaceMap[K]>(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ): void;
  // 补充function.call的调用签名，如果有function.apply再补充
  call: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
    U,
  >(
    thisType: U,
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => void;
}

interface CallNativeWithPromiseType {
  <K extends keyof NativeInterfaceMap, T extends keyof NativeInterfaceMap[K]>(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ): Promise<ReturnType<CallNativeFunctionSignature<K, T>>>;
  call: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
    U,
  >(
    thisType: U,
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => Promise<ReturnType<CallNativeFunctionSignature<K, T>>>;
}

export interface AsyncStorage {
  getAllKeys: () => Promise<string[]>;
  getItem: (key: string) => Promise<string>;
  multiGet: (keys: string[]) => Promise<string[]>;
  multiRemove: (keys: string[]) => Promise<void>;
  multiSet: (keys: { [key: string]: string | number }) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string | number) => Promise<void>;
}

/**
 * Native Api 类型
 *
 * @public
 */
export interface NativeApiType {
  // hippy Native Document实例
  hippyNativeDocument: {
    createNode: (rootViewId: any, queue: any) => void;
    updateNode: (rootViewId: any, queue: any) => void;
    deleteNode: (rootViewId: any, queue: any) => void;
    flushBatch: (rootViewId: any, queue: any) => void;
    setNodeTree: (rootViewId: any, newNodeTree: any) => void;
    setNodeId: (rootViewId: any, cacheIdList: any) => void;
    getNodeById: (nodeId: any) => any;
    getNodeIdByRef: (ref: any) => any;
    callUIFunction: (
      node: any,
      funcName: any,
      paramList?: any,
      callback?: any,
    ) => void;
    measureInWindow: (node: any, callBack: any) => void;
    startBatch: () => void;
    endBatch: () => void;
    sendRenderError: (error: Error) => void;
  };
  // hippy Native 注册对象方法
  hippyNativeRegister: {
    regist: CallbackType;
  };

  // 当前平台的本地化信息
  localization: {
    direction: number;
  };
  // 平台字符串
  platform: string;
  // 当前屏幕像素比
  pixelRatio: number;
  // hippy版的异步localstorage
  asyncStorage: AsyncStorage;

  /** 剪贴板模块 */
  clipboard: {
    // 获取简介版内容
    getString: () => Promise<string>;
    // 设置剪贴板内容
    setString: (content: string) => void;
  };

  /** Cookie管理模块 */
  cookie: {
    // 获取指定url的全部cookie
    getAll: (url: string) => Promise<string>;
    // 设置cookie
    set: (url: string, keyValue: string, expireDate: Date) => void;
  };

  // 获取API版本，仅Android
  apiLevel: string | null;

  // 设备信息
  device: string | undefined;

  // 设备是否是iPhoneX刘海屏设备
  isIphoneX: boolean;

  // 设备上1px的大小
  onePixel: number;

  // 获取当前系统版本，仅iOS
  osVersion: string | null;

  // 获取终端sdk版本，仅iOS
  sdkVersion: string | null;

  // 屏幕当前是否是竖屏
  isVerticalScreen: boolean;

  // 网络信息模块
  network: {
    // 获取网络状态信息
    getNetStatus: () => Promise<string>;
    addStatusChangeListener: () => void;
    removeStatusChangeListener: () => void;
  };

  // 图片加载器
  imageLoader: {
    getSize: (url: string) => Promise<ImageSize>;
    prefetch: (url: string) => void;
  };

  /**
   *  屏幕维度信息
   */
  dimensions: Dimensions;

  // 调用Native接口
  callNative: CallNativeFunctionType;

  /**
   * 调用native接口，返回格式为promise格式
   *
   * @param moduleName - 模块名称
   * @param methodName - 模块方法
   * @param args - 调用参数
   */
  callNativeWithPromise: CallNativeWithPromiseType;

  /**
   * 传入callback id调用native接口
   *
   * @param moduleName - 模块名称
   * @param methodName - 模块方法
   * @param args - 调用参数
   */
  callNativeWithCallbackId: <
    K extends keyof NativeInterfaceMap,
    T extends keyof NativeInterfaceMap[K],
  >(
    moduleName: K,
    methodName: T,
    ...args: Parameters<CallNativeFunctionSignature<K, T>>
  ) => number;

  /**
   * 调用Native的UI模块方法
   *
   * @param el - hippy元素实例
   * @param funcName - 方法名称
   * @param args - 调用参数
   */
  callUIFunction: (
    el: Record<string, any>,
    funcName: any,
    ...args: any[]
  ) => void;

  /**
   * 当前平台是否是android
   */
  isAndroid: () => boolean;

  /**
   * 当前平台是否是ios
   */
  isIOS: () => boolean;

  /**
   * 测量元素在窗口内的位置
   *
   * @param el - 需要测量的hippy节点
   */
  measureInAppWindow: (el: HippyNode) => Promise<MeasurePosition>;
  // 将给定颜色字符串转为Native能识别的int32
  parseColor: (color: string, { platform: string }?) => number;
}

/** 缓存的类型数据 */
interface CacheType {
  // 颜色parser map
  COLOR_PARSER?: {
    [key: string]: number;
  };
  // 一像素大小
  OnePixel?: number;
  // 当前设备是否是iPhoneX
  isIPhoneX?: boolean;
  Device?: string;
}

// 缓存不变的数据
export const CACHE: CacheType = {};

// 从Native注入全局的Hippy对象中解构出我们所需的属性和方法
export const {
  bridge: { callNative, callNativeWithPromise, callNativeWithCallbackId },
  device: {
    platform: { OS: platform, localization = {} },
    screen: { scale: pixelRatio },
  },
  device,
  document: hippyNativeDocument,
  register: hippyNativeRegister,
} = global.Hippy;

/**
 * 调用Native接口测量节点的位置信息并返回
 *
 * @param el - Hippy的元素实例
 * @param method - 方法名称
 */
export const measureInWindowByMethod = async (
  el: HippyNode,
  method: 'measureInWindow' | 'measureInAppWindow',
): Promise<MeasurePosition> => {
  const empty: MeasurePosition = {
    top: -1,
    left: -1,
    bottom: -1,
    right: -1,
    width: -1,
    height: -1,
  };

  if (!el.isMounted || !el.nodeId) {
    return Promise.resolve(empty);
  }

  const { nodeId } = el;
  return new Promise(resolve => Native.callNative(
    'UIManagerModule',
    method,
    nodeId,
    (pos: NativePosition | string) => {
      // Android error handler.
      if (
        !pos
          || pos === 'this view is null'
          || typeof nodeId === 'undefined'
      ) {
        return resolve(empty);
      }

      // 返回位置信息
      if (typeof pos !== 'string') {
        return resolve({
          top: pos.y,
          left: pos.x,
          bottom: pos.y + pos.height,
          right: pos.x + pos.width,
          width: pos.width,
          height: pos.height,
        });
      }

      return resolve(empty);
    },
  ));
};

/**
 * 封装Native相关接口，方便调用
 *
 * @public
 */
export const Native: NativeApiType = {
  // 本地信息相关
  localization,

  hippyNativeDocument,

  hippyNativeRegister,

  platform,

  pixelRatio,

  callNative,

  callNativeWithPromise,

  callNativeWithCallbackId,

  /**
   * Hippy的异步版localStorage
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  asyncStorage: global.localStorage,

  /**
   * 调用Native提供的UI相关方法
   */
  callUIFunction(...args) {
    const [el, funcName, ...options] = args;
    // el 元素不存在或不合法，则直接 return
    if (!el?.nodeId) {
      return;
    }
    const { nodeId } = el;
    let [params = [], callback] = options;
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    trace('callUIFunction', { nodeId, funcName, params });

    if (Native.isAndroid()) {
      if (isFunction(callback)) {
        Native.callNative(
          'UIManagerModule',
          'callUIFunction',
          [nodeId, funcName, params],
          callback,
        );
      } else {
        Native.callNative('UIManagerModule', 'callUIFunction', [
          nodeId,
          funcName,
          params,
        ]);
      }
    } else if (Native.isIOS() && el.component.name) {
      // iOS平台必须传入组件的Native名称作为参数
      // 获取节点所属组件的Native的View的名称，比如div的native组件名称是View
      let { name: componentName } = el.component;
      // FIXME: iOS callNative method need the real component name,
      //        but there's no a module named View in __GLOBAL__.NativeModules.
      //        Because only ScrollView use the method so far, so just a workaround here.
      if (componentName === NATIVE_COMPONENT_MAP.View) {
        // iOS中都是ScrollView
        componentName = NATIVE_COMPONENT_MAP.ScrollView;
      }
      if (isFunction(callback) && Array.isArray(params)) {
        params.push(callback);
      }
      Native.callNative('UIManagerModule', 'callUIFunction', [
        componentName,
        nodeId,
        funcName,
        params,
      ]);
    }
  },

  /**
   * 剪切板模块
   */
  clipboard: {
    /**
     * 获取剪贴板内容
     */
    async getString(): Promise<string> {
      return Native.callNativeWithPromise.call(
        this,
        'ClipboardModule',
        'getString',
      );
    },

    /**
     * 设置剪贴板内容
     *
     * @param content - 需要设置的内容
     */
    setString(content: string): void {
      Native.callNative.call(this, 'ClipboardModule', 'setString', content);
    },
  },

  /**
   * cookie模块
   */
  cookie: {
    /**
     * Get all cookies by string
     *
     * @param url - Get the cookies by specific url.
     */
    async getAll(url: string) {
      if (!url) {
        throw new TypeError('Vue.Native.Cookie.getAll() must have url argument');
      }
      return Native.callNativeWithPromise.call(
        this,
        'network',
        'getCookie',
        url,
      );
    },
    /**
     * Set cookie key and value
     * @param url - Set the cookie to specific url.
     * @param keyValue - Full of key values, like `name=someone;gender=female`.
     * @param expireDate - Specific date of expiration.
     */
    set(url: string, keyValue: string, expireDate: Date) {
      if (!url) {
        throw new TypeError('Vue.Native.Cookie.getAll() must have url argument');
      }

      let expireStr = '';
      if (expireDate) {
        expireStr = expireDate.toUTCString();
      }
      Native.callNative.call(
        this,
        'network',
        'setCookie',
        url,
        keyValue,
        expireStr,
      );
    },
  },

  /**
   * 图片加载模块
   */
  imageLoader: {
    /**
     * 在图片渲染前获取图片大小
     *
     * @param url - 图片的 url 链接
     */
    async getSize(url): Promise<ImageSize> {
      return Native.callNativeWithPromise.call(
        this,
        'ImageLoaderModule',
        'getSize',
        url,
      );
    },

    /**
     * 预加载指定url的图片，后续再有此类图片加载时，可以加快渲染速度，无需下载
     *
     * @param url - 图片的 url 链接
     */
    prefetch(url: string): void {
      Native.callNative.call(this, 'ImageLoaderModule', 'prefetch', url);
    },
  },

  /**
   * 获取屏幕尺寸等维度信息
   */
  get dimensions(): Dimensions {
    const { screen } = device;
    // Convert statusBarHeight to dp unit for android platform
    // Here's a base issue: statusBarHeight for iOS is dp, but for statusBarHeight is pixel.
    // So make them be same to hippy-vue.
    let { statusBarHeight } = screen;
    if (Native.isAndroid()) {
      statusBarHeight /= Native.pixelRatio;
    }
    return {
      window: device.window,
      screen: {
        ...screen,
        statusBarHeight,
      },
    };
  },

  /**
   * 获取当前设备类型
   */
  get device(): string | undefined {
    if (typeof CACHE.Device === 'undefined') {
      if (Native.isIOS()) {
        if (global?.__HIPPYNATIVEGLOBAL__?.Device) {
          CACHE.Device = global.__HIPPYNATIVEGLOBAL__.Device;
        } else {
          CACHE.Device = 'iPhone';
        }
      } else if (Native.isAndroid()) {
        // 目前Android 终端还没有填充这里的详情
        CACHE.Device = 'Android device';
      } else {
        CACHE.Device = 'Unknow device';
      }
    }

    return CACHE.Device;
  },

  /**
   * 当前屏幕是否是竖屏
   */
  get isVerticalScreen(): boolean {
    return Native.dimensions.window.width < Native.dimensions.window.height;
  },

  /**
   * 判断当前平台是否是 Android 平台
   */
  isAndroid(): boolean {
    return Native.platform === 'android';
  },

  /**
   * 判断当前平台是否是 iOS 平台
   */
  isIOS(): boolean {
    return Native.platform === 'ios';
  },

  /**
   * Measure the component size and position.
   */
  async measureInAppWindow(el) {
    if (Native.isAndroid()) {
      return measureInWindowByMethod(el, 'measureInWindow');
    }
    return measureInWindowByMethod(el, 'measureInAppWindow');
  },

  network: {
    /**
     * 获取当前网络状态，是个promise的方法
     */
    async getNetStatus(): Promise<string> {
      return Native.callNativeWithPromise(
        'NetInfo',
        'getCurrentConnectivity',
      ).then(({ network_info }) => network_info);
    },
    addStatusChangeListener() {},
    removeStatusChangeListener() {},
  },

  /**
   * 判断当前版本是否是刘海屏iPhone
   */
  get isIphoneX(): boolean {
    if (typeof CACHE.isIPhoneX === 'undefined') {
      // 通常情况下都不是X
      let isIPhoneX = false;
      if (Native.isIOS()) {
        // iOS12 - iPhone11: 48 Phone12/12 pro/12 pro max: 47 other: 44
        const statusBarHeightList = [44, 47, 48];
        isIPhoneX =          statusBarHeightList.indexOf(Native.dimensions.screen.statusBarHeight) > -1;
      }
      CACHE.isIPhoneX = isIPhoneX;
    }

    return CACHE.isIPhoneX;
  },

  /**
   * 获取设备一像素的大小
   */
  get onePixel(): number {
    if (typeof CACHE.OnePixel === 'undefined') {
      const ratio = Native.pixelRatio;
      let onePixel = Math.round(0.4 * ratio) / ratio;
      if (!onePixel) {
        // Assume 0 is false
        onePixel = 1 / ratio;
      }
      CACHE.OnePixel = onePixel;
    }
    return CACHE.OnePixel;
  },

  /**
   * 获取API版本，仅支持Android
   */
  get apiLevel(): string | null {
    if (!Native.isAndroid()) {
      return null;
    }

    if (global?.__HIPPYNATIVEGLOBAL__?.Platform?.APILevel) {
      return global.__HIPPYNATIVEGLOBAL__.Platform.APILevel;
    }

    return null;
  },

  /**
   * 获取当前系统版本，目前仅支持iOS
   *
   */
  get osVersion(): string | null {
    if (!Native.isIOS()) {
      return null;
    }
    if (global?.__HIPPYNATIVEGLOBAL__?.OSVersion) {
      return global.__HIPPYNATIVEGLOBAL__.OSVersion;
    }

    return null;
  },

  /**
   * 获取终端sdk版本，仅支持iOS
   */
  get sdkVersion(): string | null {
    if (!Native.isIOS()) {
      return null;
    }

    if (global?.__HIPPYNATIVEGLOBAL__?.OSVersion) {
      return global?.__HIPPYNATIVEGLOBAL__?.SDKVersion;
    }

    return null;
  },

  /**
   * 将颜色转换为Native可以理解的int32颜色值
   *
   * @param color - 颜色描述字符串
   * @param options - parse选项参数
   */
  parseColor(color: string, options = { platform: Native.platform }): number {
    const cache = CACHE.COLOR_PARSER ?? (CACHE.COLOR_PARSER = Object.create(null));
    if (!cache[color]) {
      // 缓存颜色parse结果
      cache[color] = translateColor(color, options);
    }
    return cache[color];
  },
};
