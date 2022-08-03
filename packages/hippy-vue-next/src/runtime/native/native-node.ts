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

/**
 * Hippy Native Node Props types, including properties, events, styles, and more
 */
// type NativeNodeProps = NativeNodeNativeProps | NativeNodeEvent | NativeNodeStyle & NativeNodeDebugProps;
import type { NeedToTyped } from '@hippy-shared/index';

export interface NativeNodeProps {
  [key: string]: NeedToTyped;
}

// Hippy Native Node type
export interface NativeNode {
  // native node id
  id: number;
  // parent node id
  pId: number;
  // index value of the current node in the sibling nodes
  index: number;
  // name in native, such as View,SwiperView
  name?: string;
  // tag name, such as div, li, used for inspector debugging
  tagName?: string;
  // properties, include props, styles, events
  props?: NativeNodeProps;
}
