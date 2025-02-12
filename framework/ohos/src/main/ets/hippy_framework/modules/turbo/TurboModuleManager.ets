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
import { HippyLibrary } from '../../../hippy_library/HippyLibrary';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HippyEngineContext } from '../../HippyEngineContext';
import { HippyModuleManager } from '../HippyModuleManager';
import { HippyNativeModuleBase } from '../native';


export class TurboModuleManager {
  public static TAG: string = "TurboModuleManager";
  private mHippyEngineContext: HippyEngineContext;
  private libHippy: HippyLibrary;

  public constructor(context: HippyEngineContext, libHippy: HippyLibrary) {
    this.mHippyEngineContext = context;
    this.libHippy = libHippy;
  }

  public get(name: string): HippyNativeModuleBase | null {
    LogUtils.d("TurboModuleManager", "get " + name);
    const hippyModuleManager: HippyModuleManager = this.mHippyEngineContext.getModuleManager();
    return hippyModuleManager.getNativeModule(name, true);
  }

  public install(runtimeId: number) {
    return this.libHippy?.TurboModuleManager_Install(this, runtimeId);
  }
}
