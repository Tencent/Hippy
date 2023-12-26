/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { HippyAny, HippyArray, HippyMap, HippyValue } from '../../../support/common/HippyTypes';
import { HippyJavaScriptModuleBase } from './HippyJavaScriptModuleBase';

export class EventDispatcher extends HippyJavaScriptModuleBase {
  public static MODULE_NAME: string = 'EventDispatcher';
  public static METHOD_RECEIVE_NATIVE_GESTURE: string = 'receiveNativeGesture';

  public static METHOD_RECEIVE_UI_COMPONENT_EVENT: string = 'receiveUIComponentEvent';
  public static METHOD_RECEIVE_NATIVE_EVENT: string = 'receiveNativeEvent';


  public receiveNativeGesture(param: HippyMap) {
    this.callJs(EventDispatcher.MODULE_NAME, EventDispatcher.METHOD_RECEIVE_NATIVE_GESTURE, param, null);
  }

  public receiveUIComponentEvent(tagId: number, eventName: string, eventParam: HippyAny): void {
    let param: HippyArray = [];
    param.push(tagId);
    param.push(eventName);
    param.push(eventParam ?? new Map<string, HippyAny>());
    this.callJs(EventDispatcher.MODULE_NAME, EventDispatcher.METHOD_RECEIVE_UI_COMPONENT_EVENT, param, null);
  }

  public receiveNativeEvent(eventName: string, eventParam: HippyAny): void {
    let param: HippyArray = [];
    param.push(eventName);
    param.push(eventParam ?? new Map<string, HippyAny>());
    this.callJs(EventDispatcher.MODULE_NAME, EventDispatcher.METHOD_RECEIVE_NATIVE_EVENT, param, null);
  }
}

