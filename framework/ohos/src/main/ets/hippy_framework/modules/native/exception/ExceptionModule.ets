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
import { HippyAny, HippyMap, HippyModuleCallback } from '../../../../support/common/HippyTypes'
import { HippyJsException } from '../../../common/HippyJsException'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyModulePromise } from '../../HippyModulePromise'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'

@HippyNativeModule({ name: "ExceptionModule" })
export class ExceptionModule extends HippyNativeModuleBase {
  public static readonly NAME = 'ExceptionModule'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  private handleException(title: string, details: string) {
    this.ctx.handleException(new HippyJsException(title, details));
  }

  private handleBackgroundTracing(details: string) {
    if (this.ctx.getGlobalConfigs().getExceptionHandler() != null) {
      this.ctx.getGlobalConfigs().getExceptionHandler()?.handleBackgroundTracing(details);
    }
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'handleException': {
        if (params != null && params instanceof Map) {
          let title = ""
          let details = ""
          if ((params as HippyMap).get("title") !== undefined) {
            title = (params as HippyMap).get("title") as string
          }
          if ((params as HippyMap).get("details") !== undefined) {
            details = (params as HippyMap).get("details") as string
          }
          this.handleException(title, details)
        }
        break;
      }
      case 'handleBackgroundTracing': {
        this.handleBackgroundTracing(params[0] as string)
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }
}
