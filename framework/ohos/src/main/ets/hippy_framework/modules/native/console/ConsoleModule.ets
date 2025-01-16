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
import { HippyAny, HippyModuleCallback } from '../../../../support/common/HippyTypes';
import { LogUtils } from '../../../../support/utils/LogUtils';
import { HippyEngineContext } from '../../../HippyEngineContext';
import { HippyModulePromise } from '../../HippyModulePromise';
import { HippyNativeModuleBase } from '../HippyNativeModuleBase';

const CONSOLE_LOG_TAG: string = 'hippy_console'

export class ConsoleModule extends HippyNativeModuleBase {
  public static readonly NAME = 'ConsoleModule'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'log': {
        this.log(params[0] as string)
        break;
      }
      case 'warn': {
        this.warn(params[0] as string)
        break;
      }
      case 'info': {
        this.info(params[0] as string)
        break;
      }
      case 'error': {
        this.error(params[0] as string)
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }

  private log(message: string) {
    LogUtils.d(CONSOLE_LOG_TAG, '%{public}s :' + message)
  }

  private warn(message: string) {
    LogUtils.w(CONSOLE_LOG_TAG, '%{public}s :' + message)
  }

  private info(message: string) {
    LogUtils.i(CONSOLE_LOG_TAG, '%{public}s :' + message)
  }

  private error(message: string) {
    LogUtils.e(CONSOLE_LOG_TAG, '%{public}s :' + message)
  }
}
