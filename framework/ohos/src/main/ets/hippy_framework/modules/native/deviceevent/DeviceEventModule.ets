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
import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule'
import { HippyAny, HippyModuleCallback } from '../../../../support/common/HippyTypes'
import { BackPressHandler } from '../../../HippyEngine'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyModulePromise } from '../../HippyModulePromise'
import { EventDispatcher } from '../../javascript/EventDispatcher'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'

@HippyNativeModule({ name: "DeviceEventModule" })
export class DeviceEventModule extends HippyNativeModuleBase {
  public static readonly NAME = 'DeviceEventModule'
  private mBackPressHandler: BackPressHandler | null = null;
  private mIsListening: boolean = false;

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  public onBackPressed(handler: BackPressHandler): boolean {
    if (this.mIsListening) {
      this.mBackPressHandler = handler;
      let scriptModule = this.ctx.getModuleManager().getJavaScriptModule(EventDispatcher.MODULE_NAME)

      if (scriptModule != null) {
        (scriptModule as EventDispatcher).receiveNativeEvent("hardwareBackPress", null);
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  private setListenBackPress(listen: boolean) {
    this.mIsListening = listen;
  }

  private invokeDefaultBackPressHandler() {
    if (this.mBackPressHandler != null) {
      this.mBackPressHandler.handleBackPress();
    }
  }

  public destroy() {
    this.mBackPressHandler = null;
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'setListenBackPress': {
        this.setListenBackPress(params[0] as boolean)
        break;
      }
      case 'invokeDefaultBackPressHandler': {
        this.invokeDefaultBackPressHandler()
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }
}

export interface InvokeDefaultBackPress {
  callSuperOnBackPress(): void
}
