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

import { CSSProperties, DetailedHTMLProps } from 'react';

interface HTMLAttributesExtension {
  [props: string]: any;
  nativeName?: string;
  style?: HippyTypes.Style | CSSProperties | undefined;
  // ListView
  initialListReady?: () => void;
}

declare module 'react' {
  // eslint-disable-next-line
  interface HTMLAttributes<T> extends Overwrite<DetailedHTMLProps<any, any>, HTMLAttributesExtension> {}
}

export type Type = string;
export type Props = any;
export type Container = number;
export type UpdatePayload = any;

export interface LayoutableProps {
  /**
   * Invoked on mount and layout changes with:
   *
   * `{nativeEvent: { layout: {x, y, width, height}}}`
   *
   * This event is fired immediately once the layout has been calculated,
   * but the new layout may not yet be reflected on the screen
   * at the time the event is received, especially if a layout animation is in progress.
   *
   * @param {Object} evt - Layout event data
   * @param {number} evt.nativeEvent.x - The position X of component
   * @param {number} evt.nativeEvent.y - The position Y of component
   * @param {number} evt.nativeEvent.width - The width of component
   * @param {number} evt.nativeEvent.height - The height of component
   */
  onLayout?: (evt: HippyTypes.LayoutEvent) => void;
}

export interface ClickableProps {
  /**
   * Called when the touch is released.
   */
  onClick?: () => void;

  /**
   * Called when the touch with longer than about 1s is released.
   */
  onLongClick?: () => void;
}

export interface TouchableProps {

  /**
   * The touchdown event occurs when the user touches an component.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchDown?: (evt: HippyTypes.TouchEvent) => void;

  /**
   * The touchmove event occurs when the user moves the finger across the screen.

   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchMove?: (evt: HippyTypes.TouchEvent) => void;

  /**
   * The touchend event occurs when the user removes the finger from an component.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y = Touch coordinate Y
   */
  onTouchEnd?: (evt: HippyTypes.TouchEvent) => void;

  /**
   * The touchcancel event occurs when the touch event gets interrupted.
   *
   * @param {Object} evt - Touch event data
   * @param {number} evt.page_x - Touch coordinate X
   * @param {number} evt.page_y - Touch coordinate Y
   */
  onTouchCancel?: (evt: HippyTypes.TouchEvent) => void;
}
