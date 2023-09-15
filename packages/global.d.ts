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
    x: number | undefined;
    // The position Y of component
    y: number | undefined;
    // The width of component
    width: number | undefined;
    // The height of component
    height: number | undefined;
    // error message
    errMsg?: string | undefined;
  }

  export interface DOMRect {
    x: number | undefined;
    y: number | undefined;
    top: number | undefined;
    left: number | undefined;
    bottom: number | undefined;
    right: number | undefined;
    width: number | undefined;
    height: number | undefined;
  }

  export type Color = string;
  export type Colors = Color[];
  export type tintColor = Color;
  export type tintColors = Colors;

  export type FlexAlignType =
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'baseline';

  export type DimensionValue =
    | number
    | 'auto'
    | Animation
    | AnimationSet;

  export interface FlexStyle {
    alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around';
    alignItems?: FlexAlignType;
    alignSelf?: 'auto' | FlexAlignType;
    bottom?: DimensionValue;
    collapse?: boolean;
    collapsable?: boolean;
    display?: 'none' | 'flex';
    flex?: DimensionValue;
    flexBasis?: DimensionValue;
    flexDirection?:
    | 'row'
    | 'column'
    | 'row-reverse'
    | 'column-reverse'
    ;
    rowGap?: number;
    gap?: number;
    columnGap?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    height?: DimensionValue;
    justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    ;
    left?: DimensionValue;
    margin?: DimensionValue;
    marginBottom?: DimensionValue;
    marginHorizontal?: DimensionValue;
    marginLeft?: DimensionValue;
    marginRight?: DimensionValue;
    marginTop?: DimensionValue;
    marginVertical?: DimensionValue;
    maxHeight?: DimensionValue;
    maxWidth?: DimensionValue;
    minHeight?: DimensionValue;
    minWidth?: DimensionValue;
    overflow?: 'visible' | 'hidden' | 'scroll';
    padding?: DimensionValue;
    paddingBottom?: DimensionValue;
    paddingHorizontal?: DimensionValue;
    paddingLeft?: DimensionValue;
    paddingRight?: DimensionValue;
    paddingTop?: DimensionValue;
    paddingVertical?: DimensionValue;
    position?: 'absolute' | 'relative';
    right?: DimensionValue;
    start?: DimensionValue;
    top?: DimensionValue;
    width?: DimensionValue;
    zIndex?: number;
  }

  export interface BoxShadowStyle {
    boxShadowOpacity?: number;
    boxShadowRadius?: number;
    boxShadowColor?: Color;
    boxShadowOffsetX?: number;
    boxShadowOffsetY?: number;
    /** iOS only */
    boxShadowSpread?: number;
    shadowColor?: string;
    shadowOffset?:
    | string
    | {
      width?: number;
      height?: number;
    };
    shadowOpacity?: number;
    shadowRadius?: string | number;
  }

  export interface Transform {
    perspective?: number | Animation;
    rotate?: string | Animation;
    rotateX?: string | Animation;
    rotateY?: string | Animation;
    rotateZ?: string | Animation;
    scale?: number | Animation;
    scaleX?: number | Animation;
    scaleY?: number | Animation;
    translateX?: number | Animation;
    translateY?: number | Animation;
    skewX?: string | Animation;
    skewY?: string | Animation;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface TransformsStyle {
  }

  export type BorderStyle = 'solid' | 'dotted' | 'dashed' | 'none';
  export interface BorderBoxStyle {
    borderStyle?: BorderStyle;
    borderTopStyle?: BorderStyle;
    borderRightStyle?: BorderStyle;
    borderLeftStyle?: BorderStyle;
    borderBottomStyle?: BorderStyle;
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderColor?: Color;
    borderTopColor?: Color;
    borderLeftColor?: Color;
    borderBottomColor?: Color;
    borderRightColor?: Color;
  }

  export interface BackgroundStyle {
    backgroundColor?: Color;
    backgroundColors?: Colors;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
  }

  export interface ViewStyle extends FlexStyle, BoxShadowStyle, BorderBoxStyle, TransformsStyle, BackgroundStyle {
    opacity?: DimensionValue;
  }


  export type FontVariant =
  | 'small-caps'
  | 'oldstyle-nums'
  | 'lining-nums'
  | 'tabular-nums'
  | 'proportional-nums';

  export interface TextStyleIOS extends ViewStyle {
    fontVariant?: FontVariant[] | undefined;
    textDecorationColor?: Color | undefined;
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | undefined;
    writingDirection?: 'auto' | 'ltr' | 'rtl' | undefined;
  }

  export interface TextStyleAndroid extends ViewStyle {
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center' | undefined;
    verticalAlign?: 'auto' | 'top' | 'bottom' | 'middle' | undefined;
    underlineColorAndroid?: string;
  }

  export interface TextStyle extends TextStyleIOS, TextStyleAndroid, ViewStyle {
    color?: Color;
    colors?: Colors;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic';
    /**
     * Specifies font weight. The values 'normal' and 'bold' are supported
     * for most fonts. Not all fonts have a variant for each of the numeric
     * values, in that case the closest one is chosen.
     */
    fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    ;
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined;
    textDecorationLine?:
    | 'none'
    | 'underline'
    | 'line-through'
    | 'underline line-through'
    ;
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: Color;
    textShadowColor?: Color;
    textShadowOffset?: {width: number; height: number};
    textShadowRadius?: number;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    placeholderTextColor?: Color;
    placeholderTextColors?: Colors;
    caretColor?: Color;
  }

  export interface ImageStyle extends FlexStyle, BoxShadowStyle, BorderBoxStyle, TransformsStyle, BackgroundStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    tintColor?: tintColor;
    tintColors?: tintColors;
    opacity?: DimensionValue;
  }

  export interface Style extends ViewStyle, TextStyle, ImageStyle {
    [props: string]: any
  }
  export type Falsy = undefined | null | false;
  type RecursiveArray<T> = Array<T | ReadonlyArray<T> | RecursiveArray<T>>;
  export type GenericStyleProp<T> =
  | T
  | RecursiveArray<T | Falsy>
  | Falsy;

  export type StyleProp = GenericStyleProp<Style>;
  export type ViewStyleProp = GenericStyleProp<ViewStyle>;
  export type ImageStyleProp = GenericStyleProp<ImageStyle>;
  export type TextStyleProp = GenericStyleProp<TextStyle>;

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
    clear: () => Promise<void>;
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
    // Android bottom navigatorBar height; supported version is 2.3.4
    navigatorBarHeight: number;
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
        OS: Platform['OS'];
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
    Hippy: HippyConstance;
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

declare const __PLATFORM__: HippyTypes.Platform['OS'];
