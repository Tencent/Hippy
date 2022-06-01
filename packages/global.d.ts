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

declare namespace HippyTypes {

  export type __PLATFORM__ = 'ios' | 'android' | null;

  export interface TouchEvent {
    // Touch coordinate X
    // eslint-disable-next-line camelcase
    page_x: number;
    // Touch coordinate Y
    // eslint-disable-next-line camelcase
    page_y: number;
  }

  export interface FocusEvent {
    // Focus status
    focus: boolean;
  }

  // Event response from onTextChange of TextInput
  export interface TextInputEvent {
    // The text content in TextInput
    text: string;
  }

  // Event response from onHeaderPulling and onFooterPulling
  export interface PullingEvent {
    // Dragging gap
    contentOffset: number;
  }

  export interface LayoutEvent {
    // The event data of layout event
    // The position X of component
    x: number;
    // The position Y of component
    y: number;
    // The width of component
    width: number;
    // The height of component
    height: number;
  }

  export interface Transform {
    perspective?: number;
    rotate?: string;
    rotateX?: string;
    rotateY?: string;
    rotateZ?: string;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    translateX?: number;
    translateY?: number;
    skewX?: string;
    skewY?: string;
  }

  export type color = string | number;
  export type colors = string[] | number[];
  export type backgroundColor = string | number;
  export type tintColor = string | number;
  export type tintColors = string[] | number[] | null;
  export type position =
    | 'relative'
    | 'absolute';
  export type flexDirection =
    | 'row'
    | 'column'
    | 'row-reverse';
  export type flexWrap =
    | 'nowrap'
    | 'wrap'
    | 'wrap-reverse';
  export type justifyContent =
    | 'start'
    | 'center'
    | 'end'
    | 'flex-start'
    | 'flex-end'
    | 'left'
    | 'right'
    | 'normal'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'stretch';
  export type alignItems =
    | 'stretch'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'baseline';
  export type alignSelf =
    | 'stretch'
    | 'center'
    | 'flex-start'
    | 'flex-end'
    | 'baseline';
  export type overflow =
    | 'hidden'
    | 'scroll';
  export interface BaseStyle {
    color?: color;
    colors?: colors;
    collapsable?: false;
    backgroundColor?: backgroundColor;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    margin?: number;
    marginVertical?: number;
    marginHorizontal?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    padding?: number;
    paddingVertical?: number;
    paddingHorizontal?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    position?: position;
    flexDirection?: flexDirection;
    flexWrap?: flexWrap;
    justifyContent?: justifyContent;
    alignItems?: alignItems;
    alignSelf?: alignSelf;
    overflow?: overflow;
    flex?: any;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: true;
    zIndex?: number;
    shadowColor?: string;
    shadowOffset?: string;
    shadowOpacity?: number;
    shadowRadius?: string;
    tintColor?: tintColor;
    tintColors?: tintColors;
    underlineColorAndroid?: string;
    transform?: Transform[];
    collapse?: boolean,
  }

  export interface Style extends BaseStyle {
    [props: string]: any
  }

  interface ConsoleModule {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
  }

  export interface Dimensions {
    screenPhysicalPixels: {
      densityDpi?: number;
      fontScale?: number;
      height?: number;
      navigationBarHeight?: number;
      scale?: number;
      statusBarHeight?: number;
      width?: number;
    };
    windowPhysicalPixels: {
      densityDpi?: number;
      fontScale?: number;
      height?: number;
      navigationBarHeight?: number;
      scale?: number;
      statusBarHeight?: number;
      width?: number;
    };
  }

  export interface Platform {
    APILevel?: number;
    Localization?: {
      country: string;
      language: string;
      direction: number;
    };
    OS?: 'android' | 'ios' | 'web' | null;
    PackageName?: string;
    VersionName?: string;
  }

  export interface __HIPPYNATIVEGLOBAL__ {
    Dimensions: Dimensions;
    Platform: Platform;
  }

  export interface __GLOBAL__ {
    nodeId: number;
    reactRoots?: Map<number, any>;
    nodeTreeCache?: {
      [key: string]: any;
    };
    nodeIdCache?: {
      [key: number]: any;
    };
    nodeDeleteIdCache?: {
      [key: number]: {
        [key: number]: string;
      }
    };
    nodeParamCache?: {
      [key: number]: {
        [key: number]: any;
      };
    };
    moduleCallId?: number;
    moduleCallList?: Object
    jsModuleList?: any;
    animationId?: number;
  }

  export interface Attributes {
    [key: string]: string | number;
  }

  export interface AnimationStyle {
    animationId: number;
  }

  export interface NativeStyle {
    [key: string]: null | string | number | number[] | AnimationStyle | AnimationStyle[];
  }

  export interface NativeNode {
    id: number;
    pId: number;
    index: number;
    name?: string;
    style?: NativeStyle;
    tagName?: string;
    props?: {
      [key: string]: string | number | undefined | Attributes | Style;
      attributes?: Attributes;
    }
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

  export interface Bridge {
    callNative: (moduleName: string, methodName: string, ...args: any[]) => void;
    callNativeWithCallbackId: (moduleName: string, methodName: string, ...args: any[]) => number;
    callNativeWithPromise: <T>(moduleName: string, methodName: string, ...args: any[]) => Promise<T>;
    removeNativeCallback: (callbackId: number) => void;
  }

  export interface Sizes {
    fontScale: number;
    height: number;
    scale: number;
    statusBarHeight: number;
    width: number;
  }

  export enum WebSocketReadyState {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED,
  }

  interface HippyWebSocket {
    /**
     * Read-only property returns the absolute URL of the WebSocket as resolved by the constructor.
     */
    url?: string;
    /**
     * read-only property returns the name of the sub-protocol the server selected; this will be
     * one of the strings specified in the protocols parameter when creating the WebSocket object,
     * or the empty string if no connection is established.
     */
    protocol?: string;
    /**
     * Read-only property returns the current state of the WebSocket connection.
     */
    readyState?: WebSocketReadyState;
    webSocketCallbacks?: {
      onOpen?: (...args: any[]) => void;
      onClose?: (...args: any[]) => void;
      onError?: (...args: any[]) => void;
      onMessage?: (...args: any[]) => void;
    }
    webSocketCallbackId?: number;
    webSocketId?: number;
  }

  export type WebSocket = HippyWebSocket | any;

  export interface HippyConstance {
    asyncStorage: AsyncStorage;
    bridge: Bridge;
    device: {
      cancelVibrate: () => void;
      vibrate: (pattern: number, repeatTimes?: number) => void;
      platform: {
        Localization: { country: string, language: string, direction: number } | undefined;
        OS: Platform;
        APILevel?: number; // Android Only
      };
      screen: Sizes;
      window: Sizes;
    };
    document: {
      createNode: (rootViewId: number, queue: NativeNode[]) => void;
      deleteNode: (rootViewId: number, queue: NativeNode[]) => void;
      endBatch: () => void;
      flushBatch: (rootViewId: number, queue: NativeNode[]) => void;
      sendRenderError: (err: Error) => void;
      startBatch: () => void;
      updateNode: (rootViewId: number, queue: NativeNode[]) => void;
    };

    /**
     * Register a listener for a specific event, and the listener will be called
     * when the event is triggered.
     *
     * @param {string} eventName - The event name will be registered.
     * @param {Function} listener - Event callback.
     */
    on: (eventName: string, listener: () => void) => void;

    /**
     * Remove specific event listener,
     *
     * @param {string} eventName - The event name will be removed.
     * @param {Function} listener - Specific event callback will be removed,
     *                              the listeners will clean all if not specific.
     */
    off: (eventName: string, listener?: () => void) => void;

    /**
     * Trigger a event with arguments.
     *
     * @param {string} eventName - The event name will be trigger.
     * @param  {[]} args - Event callback arguments.
     */
    emit: (eventName: string, ...args: any[]) => void;

    register: {
      /**
       * Register the Hippy app entry function,
       * the native will trigger an event to execute the function
       * and start the app.
       *
       * The different platforms the event name is different, for Android it's 'loadInstance',
       * for iOS it's 'runApplication'.
       *
       * For the same app startup multiple times, it needs to use a different Javascript Context
       * for the environment isolation.
       *
       * @param {string} appName - The app name will be register.
       * @param {*} entryFunc - The entry function will be execute after native called.
       */
      regist: (appName: string, entryFunc: (...args: any[]) => void) => void;
    };
  }

  export interface HippyGlobal {
    __GLOBAL__: __GLOBAL__;
    __HIPPYNATIVEGLOBAL__: __HIPPYNATIVEGLOBAL__;
    __PLATFORM__: __PLATFORM__;
    __HIPPYCURDIR__?: string;
    Hippy: HippyTypes.HippyConstance;
    WebSocket: WebSocket | any;
    ConsoleModule: ConsoleModule;
    HippyDealloc?: () => void;
    cancelIdleCallback?: (id: ReturnType<typeof setTimeout> | number) => void;
    dynamicLoad?: (path: string, encode: string, callback: (err: Error) => void) => void
    getTurboModule?: (moduleName: string) => Object;
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      options?: { timeout: number },
    ) => ReturnType<typeof setTimeout> | number;
  }
}

declare type Diff<T extends keyof any, U extends keyof any> =
  ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];

declare type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

declare const __PLATFORM__: HippyTypes.Platform;

/* eslint-disable */
// @ts-ignore
declare var global: HippyTypes.HippyGlobal & typeof globalThis;
