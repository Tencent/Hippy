/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
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

import { NeedToTyped } from '../types/native';

const EventHandlerType = {
  ADD: 0,
  REMOVE: 1,
};

const NativeEventMap: NeedToTyped = {
  onClick: 'click',
  onLongClick: 'longclick',
  onPressIn: 'pressin',
  onPressOut: 'pressout',
  onTouchDown: 'touchstart', // compatible with w3c standard name touchstart
  onTouchStart: 'touchstart',
  onTouchEnd: 'touchend',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
};

const DOMEventPhase = {
  NONE: 0,
  CAPTURING_PHASE: 1,
  AT_TARGET: 2,
  BUBBLING_PHASE: 3,
};

function isNativeGesture(name: keyof typeof NativeEventMap) {
  return !!NativeEventMap[name];
}

function translateToNativeEventName(name: string) {
  return name.replace(/^(on)?/g, '').toLocaleLowerCase();
}

// event method constant
const EventMethod = {
  ADD: 'addEventListener',
  REMOVE: 'removeEventListener',
};

export {
  EventMethod,
  EventHandlerType,
  NativeEventMap,
  DOMEventPhase,
  isNativeGesture,
  translateToNativeEventName,
};
