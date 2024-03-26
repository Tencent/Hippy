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
 * module for the Hippy tag
 *
 * Register Hippy tag uniformly,
 * establish the mapping between Hippy tag and native tag, and add default parameters and event processing logic.
 *
 * TODO Is it better to obtain component information in the node or where it is used?
 *
 */
import { camelize } from '@vue/shared'
import type { NeedToTyped, NativeNodeProps } from '../../types';
import { normalizeTagName } from '../../util';
import type { EventsUnionType, HippyEvent } from '../event/hippy-event';

export interface TagComponent {
  // the type of component that Native actually renders, such as View, TextView, etc.
  name: string;
  // manually modify the native event return value and do some additional processing logic
  processEventData?: (
    evtData: EventsUnionType,
    nativeEventParams: NeedToTyped,
  ) => HippyEvent;
  // event Map, for example, touchmove in template corresponds to native onTouchMove
  eventNamesMap?: Map<string, string>;
  // default style
  defaultNativeStyle?: NativeNodeProps;
  // default props
  defaultNativeProps?: NativeNodeProps;
  // can be used to set the props of the Native node, with the highest priority
  nativeProps?: NativeNodeProps;
  // attribute map
  attributeMaps?: NativeNodeProps;
}

export interface ElementComponent {
  component: TagComponent;
}

// the mapping between Hippy tag and native tag
const tagMap = new Map();

/**
 * register component information for the specified tag
 *
 * @param tagName - tag name
 * @param elementComponent - tag component
 */
export function registerElement(
  tagName: string,
  elementComponent: ElementComponent,
): void {
  if (!tagName) {
    throw new Error('tagName can not be empty');
  }

  // normalize tag name
  const normalizedTagName = normalizeTagName(tagName);

  // register only those who have not yet registered
  if (!tagMap.has(normalizedTagName)) {
    // TODO merge component default information

    // save the component with tag
    tagMap.set(normalizedTagName, elementComponent.component);
  }
}

/**
 * get the component information of the specified tag
 *
 * @param tagName - tag name
 */
export function getTagComponent(tagName: string): TagComponent {
  // normalize tag name
  const normalizedTagName = normalizeTagName(tagName);
  // lowerCase camelize tag name, compatible vue2 component tag name
  const lowerCamelizedTagName = camelize(tagName).toLowerCase()
  // first, get normal tag name. second get lower camelized name
  // eg. register hippy custom element: registerElement('CustomTag', xxx).
  // vue tepmlate: vue2 <custom-tag> -> customtag, vue3 <custom-tag> -> custom-tag
  // so we compatible tag name at here
  return tagMap.get(normalizedTagName) || tagMap.get(lowerCamelizedTagName);
}
