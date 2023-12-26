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
import { TimeMonitor } from '../support/utils/TimeMonitor';
import { VfsManager } from '../vfs/VfsManager';
import { HippyBridgeManager } from './bridge/HippyBridgeManager';
import { JsDriver } from './connector/JsDriver';
import { HippyGlobalConfigs } from './HippyGlobalConfigs';
import { HashMap } from '@kit.ArkTS';
import { HippyModuleManager } from './modules/HippyModuleManager';
import { HippyJsException } from './common/HippyJsException';
import { DevSupportManager } from './devsupport/DevSupportManager';
import { HippyLibrary } from '../hippy_library/HippyLibrary';
import { DevtoolsManager } from './devsupport/DevtoolsManager';
import { NativeRender } from '../renderer_native/NativeRender';
import { HippyRootView } from '../renderer_native/HippyRootView';
import { NativeRenderProvider } from '../renderer_native/NativeRenderProvider';

export interface HippyEngineContext {

  getLibHippy(): HippyLibrary

  getNativeParams(): Map<string, Object>

  getNativeRender(): NativeRender | null

  getVfsManager(): VfsManager

  getJsDriver(): JsDriver | null

  getMonitor(): TimeMonitor

  getGlobalConfigs(): HippyGlobalConfigs

  getModuleManager(): HippyModuleManager

  getBridgeManager(): HippyBridgeManager | null

  getDevSupportManager(): DevSupportManager | null

  destroyBridge(isReload: boolean): void

  handleException(error: HippyJsException): void

  getRootView(rootId: number): HippyRootView | null

  getNativeRenderProvider(): NativeRenderProvider | null

  // int getEngineId();

  getDomManagerId(): number;

  getVfsId(): number;

  getDevtoolsId(): number;

  reloadRootView(): void;

  onBridgeDestroyed(isReload: boolean): void;

  onLoadModuleCompleted(statusCode: number, msg: string): void;

  setComponentName(component: string): void

  getComponentName(): string;
}
