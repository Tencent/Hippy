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
import { HippyEngineMonitorAdapter } from './HippyEngineMonitorAdapter';
import { MonitorGroup, MonitorPoint } from '../../../support/utils/TimeMonitor';
import { EngineInitStatus, ModuleLoadStatus } from '../..';
import { HippyCallNativeParams } from '../../bridge/HippyCallNativeParams';
import { LogUtils } from '../../../support/utils/LogUtils';

const DEFAULT_ENGIN_MONITOR_TAG: string = "DefaultEngineMonitorAdapter"

export class DefaultEngineMonitorAdapter implements HippyEngineMonitorAdapter {

  onEngineInitialized(statusCode: EngineInitStatus): void {
    LogUtils.i(DEFAULT_ENGIN_MONITOR_TAG, "engine initialization completed with result: " + statusCode);
  }

  onLoadModuleCompleted(statusCode: ModuleLoadStatus): void {
    LogUtils.i(DEFAULT_ENGIN_MONITOR_TAG, "load module completed with result: " + statusCode);
  }

  onFirstPaintCompleted(componentName: string): void {
    LogUtils.i(DEFAULT_ENGIN_MONITOR_TAG, componentName + " first paint completed with first view added");
  }

  onFirstContentfulPaintCompleted(componentName: string): void {
    LogUtils.i(DEFAULT_ENGIN_MONITOR_TAG, componentName + " first contentful paint completed last content view added");
  }

  onInterceptCallNative(componentName: string, params: HippyCallNativeParams): boolean {
    return false;
  }

  onCallNativeFinished(componentName: string, params: HippyCallNativeParams): void {
  }

  onInterceptPromiseCallback(componentName: string, moduleName: string, funcName: string, callbackId: string, callbackResult: Object): boolean {
    return false;
  }
}
