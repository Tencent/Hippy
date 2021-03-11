/* !
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

interface Native {
  /**
   * Hippy-Vue version
   */
  version: string;
  Cookie: Cookie;
  Clipboard: Clipboard;

  /**
   * Determine the device is iPhone X
   */
  isIPhoneX: boolean;

  /**
   * Determine the screen is vertical orientation.
   * Should always retrieve from scratch.
   */
  screenIsVertical: boolean;

  /**
   * Get the running operating system.
   */
  Platform: 'ios' | 'android' | 'web' | string;

  /**
   * Get the device information
   */
  Device: 'iPhone' | 'Android device' | 'Unknown device' | string;

  /**
   * Get the OS version
   */
  OSVersion: string | null;

  /**
   * Get the API version
   */
  APILevel: string | null;

  /**
   * Get the screen or view size.
   */
  Dimensions: Dimensions;

  /**
   * Get the device pixel ratio
   */
  PixelRatio: number;

  /**
   * Get the one pixel size of device
   */
  OnePixel: number;


  /**
   * Register a listener for a specific event, and the listener will be called
   * when the event is triggered.
   *
   * @param {string} eventName - The event name will be registered.
   * @param {Function} listener - Event callback.
   */
  on(eventName: string, listener: Function): void;

  /**
   * Remove specific event listener,
   *
   * @param {string} eventName - The event name will be removed.
   * @param {Function} listener - Specific event callback will be removed,
   *                              the listeners will clean all if not specific.
   */
  off(eventName: string, listener?: Function): void;

  /**
   * Trigger a event with arguments.
   *
   * @param {string} eventName - The event name will be trigger.
   * @param  {any} args - Event callback arguments.
   */
  emit(eventName: string, ...args: any[]): void;

  /**
   * Call native UI methods.
   */
  callUIFunction: (
    el: Record<string, any>,
    funcName: any,
    ...args: any[]
  ) => void;

  /**
   * Measure the component size and position.
   */
  measureInWindow: (
    el: Record<string | 'isMounted' | 'nodeId', any>
  ) => Promise<MeasurePosition>;

  /**
   * Class native methods
   */
  callNative: (
    moduleName: callNativeModuleName,
    methodName: callNativeMethodName,
    ...args: any[]
  ) => void;

  /**
   * Call native methods with a promise response.
   */
  callNativeWithPromise: (
    moduleName: callNativeModuleName,
    methodName: callNativeMethodName,
    ...args: any[]
  ) => Promise<any>;

  /**
   * Call native with callId returns
   */
  callNativeWithCallbackId: (
    moduleName: callNativeModuleName,
    methodName: callNativeMethodName,
    ...args: any[]
  ) => any;

  /**
   * Draw UI with native language.
   */
  UIManagerModule: UIManagerModule;
}

interface UIManagerModule {
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
    callback?: any
  ) => void;
  measureInWindow: (node: any, callBack: any) => void;
  startBatch: (renderId: any) => void;
  endBatch: (renderId: any) => void;
  sendRenderError: (error: Error) => void;
}

type callNativeModuleName = 'UIManagerModule' | string;
type callNativeMethodName =
  | 'callUIFunction'
  | 'createNode'
  | 'updateNode'
  | 'deleteNode'
  | string;

interface MeasurePosition {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

interface Cookie {
  /**
   * Get all of cookies by string
   * @param {string} url - Get the cookies by specific url.
   * @return {Promise<string>} - Cookie string, like `name=someone;gender=female`.
   */
  getAll: (url: string) => Promise<string>;
  /**
   * Set cookie key and value
   * @param {string} url - Set the cookie to specific url.
   * @param {string} keyValue - Full of key values, like `name=someone;gender=female`.
   * @param {Date} expireDate - Specific date of expiration.
   */
  set: (url: string, keyValue: string, expireDate?: Date) => void;
}

interface Clipboard {
  /**
   * Return the content at the clipboard.
   */
  getString: () => Promise<string | undefined>;
  /**
   * Set up clipboard contents.
   */
  setString: (content: string) => void;
}

interface Dimensions {
  window: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
    statusBarHeight: number;
    navigatorBarHeight: number;
  };
  screen: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
    statusBarHeight: number;
    navigatorBarHeight: number;
  };
}

export default Native;
export {
  Cookie,
  Clipboard,
  Dimensions,
  MeasurePosition,
};
