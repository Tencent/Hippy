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
import { HippyCallNativeParams } from '../bridge/HippyCallNativeParams';
import { HippyAPIProvider } from '../bridge/HippyAPIProvider';
import { HippyNativeModuleBase } from './native';
import { HippyJavaScriptModuleBase } from './javascript/HippyJavaScriptModuleBase';
import { HippyNativeModuleCreator } from './HippyModuleManagerImpl';

export interface HippyModuleManager {

  callNatives(params: HippyCallNativeParams): void;

  destroy(): void;

  getNativeModule(name: string, isTurbo: boolean): HippyNativeModuleBase | null;

  getJavaScriptModule(name: string): HippyJavaScriptModuleBase | null;

  addModules(customNativeModules: Map<string, HippyNativeModuleCreator> | null): void;
}
