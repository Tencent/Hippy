/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

// eslint-disable-next-line max-classes-per-file
import type { NeedToTyped } from '../../types';
import type { HippyEventTarget } from './hippy-event-target';

/**
 * Hippy event base class
 *
 * @public
 */
export class HippyEvent {
  // event trigger time
  public timeStamp: number;

  // event name
  public type: string;

  // the object that triggered the event, the original target
  public target: HippyEventTarget | null = null;

  // the current object that triggered the event, which is changing as the event bubbles up
  public currentTarget: HippyEventTarget | null = null;

  // whether the event can bubble, the default is true
  public bubbles = true;

  // native parameters
  public nativeParams?: NeedToTyped;

  // whether the default behavior of the event can be canceled, the default is true
  protected cancelable = true;

  // indicates which stage of event stream processing, useless for now
  protected eventPhase = false;

  // whether the event has been canceled
  private isCanceled = false;

  constructor(eventName: string) {
    // save event name
    this.type = eventName;
    // save event trigger time
    this.timeStamp = Date.now();
  }

  get canceled(): boolean {
    return this.isCanceled;
  }

  /**
   * Prevent events from continuing to bubble up
   */
  stopPropagation(): void {
    this.bubbles = false;
  }

  /**
   * Block default behavior of events
   */
  preventDefault(): void {
    if (this.cancelable) {
      if (this.isCanceled) {
        return;
      }
      this.isCanceled = true;
    }
  }
}

/**
 * touch event
 */
export class HippyTouchEvent extends HippyEvent {
  // the X-direction offset where the event occurred
  public offsetX?: number;

  // the Y-direction offset where the event occurred
  public offsetY?: number;

  // location information related to touch events
  public touches?: {
    [key: number]: {
      // Distance to the left of the client
      clientX: number;
      // Distance from the top of the client
      clientY: number;
    };
    length: number;
  };

  // content offset
  public contentOffset?:
  | {
    x: number;
    y: number;
  }
  | number;

  // actual height of the scroll event content area, including non-viewable areas
  public scrollHeight?: number;

  // actual width of the scroll event content area, including non-viewable areas
  public scrollWidth?: number;
}

/**
 * layout event
 */
export class HippyLayoutEvent extends HippyEvent {
  // distance from top
  public top?: number;

  // distance from left
  public left?: number;

  // distance from bottom
  public bottom?: number;

  // distance from right
  public right?: number;

  // width
  public width?: number;

  // height
  public height?: number;
}

export class HippyLoadResourceEvent extends HippyEvent {
  // url load event url
  public url?: string;
  public success?: boolean;
  public error?: string;
  public width?: number;
  public height?: number;
}

export class HippyKeyboardEvent extends HippyEvent {
  // content value
  public value?: string | NeedToTyped;

  // the starting position of the text selected by the input box
  public start?: number;

  // the end position of the text selected by the input box
  public end?: number;

  // the height of the keyboard
  public keyboardHeight?: number;

  // key code
  public keyCode?: number;
}

export class ContentSizeEvent extends HippyEvent {
  public width?: number;

  public height?: number;
}

export class FocusEvent extends HippyEvent {
  // whether the current input box has the focus
  public isFocused?: boolean;
}

export class ViewPagerEvent extends HippyEvent {
  // current item index
  public currentSlide?: number;

  // next item index
  public nextSlide?: number;

  // event status
  public state?: string;

  // offset
  public offset?: number;
}

export class ExposureEvent extends HippyEvent {
  // exposure event
  public exposureInfo?: {
    [key: string]: NeedToTyped;
  };
}

export class ListViewEvent extends HippyEvent {
  // the index of the item that triggers the onDelete event
  public index?: number;
}

export function eventIsKeyboardEvent(event: HippyEvent): event is HippyKeyboardEvent {
  return typeof (event as HippyKeyboardEvent).value === 'string';
}

export interface HippyGlobalEventHandlersEventMap {
  onScroll: HippyTouchEvent;
  onMomentumScrollBegin: HippyTouchEvent;
  onMomentumScrollEnd: HippyTouchEvent;
  onScrollBeginDrag: HippyTouchEvent;
  onScrollEndDrag: HippyTouchEvent;
  onTouchDown: HippyTouchEvent;
  onTouchMove: HippyTouchEvent;
  onTouchEnd: HippyTouchEvent;
  onTouchCancel: HippyTouchEvent;
  onFocus: FocusEvent;
  onDelete: ListViewEvent;
  onChangeText: HippyKeyboardEvent;
  onEndEditing: HippyKeyboardEvent;
  onSelectionChange: HippyKeyboardEvent;
  onKeyboardWillShow: HippyKeyboardEvent;
  onContentSizeChange: ContentSizeEvent;
  onLoad: HippyLoadResourceEvent;
  onLoadStart: HippyLoadResourceEvent;
  onLoadEnd: HippyLoadResourceEvent;
  onExposureReport: ExposureEvent;
  onPageSelected: ViewPagerEvent;
  onPageScroll: ViewPagerEvent;
  onPageScrollStateChanged: ViewPagerEvent;
  onHeaderPulling: HippyTouchEvent;
  onFooterPulling: HippyTouchEvent;
  onLayout: HippyLayoutEvent;
}

// Convert map to union, so that you can use the feature of 4.6 to do narrowing in switch case
// https://devblogs.microsoft.com/typescript/announcing-typescript-4-6/#control-flow-analysis-for-destructured-discriminated-unions
// https://stackoverflow.com/questions/59075083/
export type MapToUnion<I> = { [k in keyof I]: { __evt: k; handler: I[k] } }[keyof I];
export type EventsUnionType = MapToUnion<HippyGlobalEventHandlersEventMap>;
