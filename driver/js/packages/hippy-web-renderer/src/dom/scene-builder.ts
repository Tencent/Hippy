/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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

// event handler type
type EventHandler = (...args: any[]) => void;

// native custom event map
const NativeCustomEventMap = {
  initiallistready: 'initialListReady',
  momentumscrollbegin: 'onMomentumScrollBegin',
  momentumscrollend: 'onMomentumScrollEnd',
  scrollbegindrag: 'onScrollBeginDrag',
  scrollenddrag: 'onScrollEndDrag',
  willappear: 'willAppear',
  willdisappear: 'willDisappear',
  endreached: 'onEndReached',
  loadstart: 'onLoadStart',
  loadend: 'onLoadEnd',
  requestclose: 'onRequestClose',
  headerreleased: 'onHeaderReleased',
  headerpulling: 'onHeaderPulling',
  footerreleased: 'onFooterReleased',
  footerpulling: 'onFooterPulling',
  getrefresh: 'onGetRefresh',
};

// native gesture event map
const NativeGestureEventMap = {
  click: 'onClick',
  longclick: 'onLongClick',
  pressin: 'onPressIn',
  pressout: 'onPressOut',
  touchstart: 'onTouchDown', // compatible with w3c standard name touchstart
  touchend: 'onTouchEnd',
  touchmove: 'onTouchMove',
  touchcancel: 'onTouchCancel',
};

// native gesture event map
const NativeInputEventMap = {
  changetext: 'onChangeText',
  keyboardwillhide: 'onKeyboardWillHide',
  keyboardwillshow: 'onKeyboardWillShow',
  contentsizechange: 'onContentSizeChange',
  endediting: 'onEndEditing',
};

// native gesture event map
const NativeSwiperEventMap = {
  pageselected: 'onPageSelected',
  pagescroll: 'onPageScroll',
  statechanged: 'onStateChanged',
  pagescrollstatechanged: 'onPageScrollStateChanged',
};

/**
 * return event name is native custom event or not
 *
 * @param name
 */
function isNativeCustom(name): boolean {
  return !!NativeCustomEventMap[name];
}

/**
 * return event name is native gesture or not
 *
 * @param name
 */
function isNativeGesture(name): boolean {
  return !!NativeGestureEventMap[name];
}

/**
 * return event name is input event or not
 *
 * @param name
 */
function isNativeInput(name): boolean {
  return !!NativeInputEventMap[name];
}

/**
 * return event name is swiper event or not
 *
 * @param name
 */
function isNativeSwiper(name): boolean {
  return !!NativeSwiperEventMap[name];
}

/**
 * get normalize event name
 */
function getNormalizeEventName(eventName: string): string {
  // add the 'on' for the event name and convert the first letter to uppercase, eg. click -> onClick
  return eventName.startsWith('on') ? eventName : `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
}

/**
 * get real native event name
 *
 * @param eventName
 */
function getNativeEventName(eventName: string): string {
  if (isNativeCustom(eventName)) {
    return NativeCustomEventMap[eventName];
  }

  if (isNativeGesture(eventName)) {
    return NativeGestureEventMap[eventName];
  }

  if (isNativeInput(eventName)) {
    return NativeInputEventMap[eventName];
  }

  if (isNativeSwiper(eventName)) {
    return NativeSwiperEventMap[eventName];
  }

  return getNormalizeEventName(eventName);
}

/**
 * hippy 3.x scene builder class, provide node operate func and event listener
 */
export class SceneBuilder {
  // root view id
  private readonly rootViewId: number;

  constructor(rootViewId: number) {
    this.rootViewId = rootViewId;
  }

  /**
   * create native nodes
   *
   * @param nodes
   */
  public create(nodes: Array<HippyTypes.TranslatedNodes>) {
    // create native view list
    Hippy.bridge.callNative('UIManagerModule', 'createNode', this.rootViewId, nodes);
  }

  /**
   * update native nodes
   *
   * @param nodes
   */
  public update(nodes: Array<HippyTypes.TranslatedNodes>) {
    // create native view
    Hippy.bridge.callNative('UIManagerModule', 'updateNode', this.rootViewId, nodes);
  }

  /**
   * delete native nodes
   *
   * @param nodes
   */
  public delete(nodes: Array<HippyTypes.TranslatedNodes>) {
    Hippy.bridge.callNative('UIManagerModule', 'deleteNode', this.rootViewId, nodes);
  }

  /**
   * move native nodes
   *
   * @param nodes
   */
  public move(nodes: Array<HippyTypes.TranslatedNodes>) {
    Hippy.bridge.callNative('UIManagerModule', 'moveNode', this.rootViewId, nodes);
  }

  /**
   * start node operate
   */
  public build() {
    // noting need to do at web platform
  }

  /**
   * add event listener for native node
   *
   * @param id
   * @param eventName
   * @param handler
   */
  public addEventListener(id: number, eventName: string, handler: EventHandler) {
    Hippy.bridge.callNativeWithoutDelete('UIManagerModule', 'addEventListener', id, getNativeEventName(eventName), handler);
  }

  /**
   * remove event listener of native node
   *
   * @param id
   * @param eventName
   * @param handler
   */
  public removeEventListener(id: number, eventName: string, handler: EventHandler) {
    Hippy.bridge.callNative('UIManagerModule', 'removeEventListener', id, getNativeEventName(eventName), handler);
  }
}
