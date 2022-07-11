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

import { HippyCallBack } from './exports';

export type HippyNativeBridge =
  (action: string, callObj?: { moduleName: string, methodName: string, params: any } | any) => void;

export interface HippyJsBridge {
  callNative(moduleName: string, methodName: string, ...args: any[]): void;
  callNativeWithCallbackId(moduleName: string, methodName: string, ...args: any[]): number;
  callNativeWithPromise<T>(moduleName: string, methodName: string, ...args: any[]): Promise<T>;
  removeNativeCallback(callBack: HippyCallBack): void;
}

export type HippyJsCallNatives = (moduleName: string, moduleFunc: string, callId: number, params?: any[]) => void;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace HippyTransferData {
  export type NativeUIEvent = [nodeId: string, eventName: string, eventParams: any];
  export type NativeEvent = [eventName: string, eventParams: any];

  export type NativeGestureEventTypes = 'onClick' | 'onPressIn' | 'onPressOut' | 'onLongClick' | 'onTouchDown' | 'onTouchMove' | 'onTouchEnd' | 'onTouchCancel';
  export type NativeGestureEvent = {
    name: NativeGestureEventTypes,
    id: number;
    page_x?: number;
    page_y: number;
  };
}


