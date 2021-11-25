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

/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */

interface LayoutContent {
  /**
   * The position X of component
   */
  x: number;

  /**
   * The position Y of component
   */
  y: number;

  /**
   * The width of component
   */
  width: number;

  /**
   * The height of component
   */
  height: number;
}

interface LayoutEvent {
  /**
   * The event data of layout event
   */
  nativeEvent: LayoutContent;
}

interface TouchEvent {
  /**
   * Touch coordinate X
   */
  page_x: number;

  /**
   * Touch coordinate Y
   */
  page_y: number;
}

interface FocusEvent {
  /**
   * Focus status
   */
  focus: boolean;
}

/**
 * Event response from onTextChange of TextInput
 */
interface TextInputEvent {
  /**
   * The text content in TextInput
   */
  text: string;
}

/**
 * Event response from onHeaderPulling and onFooterPulling
 */
interface PullingEvent {
  /**
   * Dragging gap
   */
  contentOffset: number;
}

export {
  LayoutContent,
  LayoutEvent,
  TouchEvent,
  FocusEvent,
  TextInputEvent,
  PullingEvent,
};
