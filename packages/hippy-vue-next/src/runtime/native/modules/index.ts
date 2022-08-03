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

import type { AnimationModule } from './animation-module';
import type { ClipboardModule } from './clip-board-module';
import type { DeviceEventModule } from './device-event-module';
import type { Http } from './http';
import type { ImageLoaderModule } from './image-loader-module';
import type { NetInfo } from './net-info';
import type { Network } from './network';
import type { TestModule } from './test-module';
import type { UiManagerModule } from './ui-manager-module';
import type { Websocket } from './websocket';

export interface NativeInterfaceMap {
  // The key here is the module name set by the native and cannot be changed at will.
  UIManagerModule: UiManagerModule;
  ImageLoaderModule: ImageLoaderModule;
  websocket: Websocket;
  NetInfo: NetInfo;
  ClipboardModule: ClipboardModule;
  network: Network;
  AnimationModule: AnimationModule;
  DeviceEventModule: DeviceEventModule;
  http: Http;
  TestModule: TestModule;
}
