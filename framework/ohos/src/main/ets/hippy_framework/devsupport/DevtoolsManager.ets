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

import { util } from '@kit.ArkTS';
import { HippyLibrary } from '../../hippy_library/HippyLibrary';
import { JsDriver } from '../connector/JsDriver';
import { DomManager } from '../connector/DomManager';
import { NativeRenderer } from '../connector/NativeRenderer';

export class DevtoolsManager {
  private mInstanceUUID = util.generateRandomUUID()
  private libHippy: HippyLibrary
  private mDebugMode: boolean
  private mId: number

  constructor(libHippy: HippyLibrary, debugMode: boolean) {
    this.libHippy = libHippy;
    this.mDebugMode = debugMode;
    this.mId = 0;
  }

  public getId(): number {
    return this.mId;
  }

  public getDevInstanceUUID(): string {
    return this.mInstanceUUID;
  }

  public create(dataDir: string, wsUrl: string): void {
    if (this.mDebugMode) {
      this.mId = this.onCreateDevtools(dataDir, wsUrl);
    }
  }

  public destroy(isReload: boolean): void {
    if (this.mDebugMode) {
      this.onDestroyDevtools(this.mId, isReload);
    }
  }

  public bind(driver: JsDriver, dom: DomManager, render: NativeRenderer): void {
    if (this.mDebugMode) {
      this.onBindDevtools(this.mId, driver.getInstanceId(), dom.getDomManagerId(), render.instanceId);
    }
  }

  public attachToRoot(rootId: number): void {
    if (this.mDebugMode) {
      this.onAttachToRoot(this.mId, rootId);
    }
  }

  private onCreateDevtools(dataDir: string, wsUrl: string): number {
    return this.libHippy?.Devtools_OnCreateDevtools(dataDir, wsUrl);
  }

  private onDestroyDevtools(devtoolsId: number, isReload: boolean): void {
    this.libHippy?.Devtools_OnDestroyDevtools(devtoolsId, isReload);
  }

  private onBindDevtools(devtoolsId: number, driverId: number, domId: number,
    renderId: number): void {
    this.libHippy?.Devtools_OnBindDevtools(devtoolsId, driverId, domId, renderId);
  }

  private onAttachToRoot(devtoolsId: number, rootId: number): void {
    this.libHippy?.Devtools_OnAttachToRoot(devtoolsId, rootId);
  }
}
