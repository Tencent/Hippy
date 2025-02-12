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
import { HippyAny, HippyArray, HippyMap, HippyValue } from '../../support/common/HippyTypes';
import { HippyThirdPartyAdapter } from '../adapter/thirdparty/HippyThirdPartyAdapter';
import { NativeCallback } from '../connector/NativeCallback';
import { HippyBundleLoader } from './bundleloader/HippyBundleLoader';

export interface HippyBridgeManager {
  initBridge(initBridgeCallback: NativeCallback, isReload: boolean): void;

  runBundle(id: number, loader: HippyBundleLoader): void;

  loadInstance(name: string, id: number, params: HippyMap | null): void;

  resumeInstance(id: number): void;

  pauseInstance(id: number): void;

  destroyInstance(id: number): void;

  execPromiseCallback(params: Map<string, HippyAny>): void;

  destroyBridge(isReload: boolean): void;

  destroy(): void;

  callJavaScriptModule(moduleName: string, methodName: string, params: HippyAny): void;

  getThirdPartyAdapter(): HippyThirdPartyAdapter | null;
}
