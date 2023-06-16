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
export interface TouchEvent {
  pageX: number;
  pageY: number;
  target: any;
  currentTarget: any;
  force: number;
  identifier: number;
  stopPropagation: () => void;
};

export interface LayoutValue {
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number,
}

export interface LayoutEvent {
  NativeEvent: {
    layout: LayoutValue,
  },
  layout: LayoutValue,
  target: any
  timeStamp: number
}

export interface ResizeObserver {
  disconnect: () => void;
  observe: (target: Element, options?: ResizeObserverOptions) => void;
  unobserve: (target: Element) => void;
};

type NetworkChangeEventData = any;
type NetworkInfoCallback = (data: NetworkChangeEventData) => void;

export interface NetInfoModule {
  addEventListener: (eventName: string, listener: NetworkInfoCallback) => { remove: () => void };
  removeEventListener: (eventName: string, listener?: NetworkInfoCallback) => void;
  fetch: () => Promise<NetworkChangeEventData>;
};

export interface LayoutableProps {
  onLayout?: (evt: LayoutEvent) => void;
}

export interface ClickableProps {
  /**
   * Called when the touch is released.
   */
  onClick?: () => void;
}

export interface TouchableProps {
  onTouchDown?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
}
