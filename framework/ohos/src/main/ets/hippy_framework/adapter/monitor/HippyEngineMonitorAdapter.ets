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
import { EngineInitStatus, ModuleLoadStatus } from '../..'
import { MonitorGroup } from '../../../support/utils/TimeMonitor'
import { HippyCallNativeParams } from '../../bridge/HippyCallNativeParams'

export interface HippyEngineMonitorAdapter {
  onEngineInitialized(statusCode: EngineInitStatus, monitorGroup: MonitorGroup): void

  onLoadModuleCompleted(statusCode: ModuleLoadStatus, componentName: string, monitorGroup: MonitorGroup): void

  onFirstPaintCompleted(componentName: string): void

  onFirstContentfulPaintCompleted(componentName: string): void

  onInterceptCallNative(componentName: string, params: HippyCallNativeParams): boolean

  onCallNativeFinished(componentName: string, params: HippyCallNativeParams): void

  onInterceptPromiseCallback(componentName: string, moduleName: string, funcName: string, callbackId: string, callbackResult: Object): boolean
}
