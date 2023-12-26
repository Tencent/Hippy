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
import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule';
import { HippyEngineContext } from '../../../HippyEngineContext';
import { HippyNativeModuleBase } from '../HippyNativeModuleBase';
import vibrator from '@ohos.vibrator';
import { LogUtils } from '../../../../support/utils/LogUtils';
import {
  HippyAny,
  HippyArray,
  HippyMap,
  HippyModuleCallback
} from '../../../../support/common/HippyTypes';
import { HippyModulePromise } from '../../HippyModulePromise';

const UTILS_MODULE_TAG = "UtilsModule"

@HippyNativeModule({ name: "UtilsModule" })
export class UtilsModule extends HippyNativeModuleBase {
  public static readonly NAME = 'UtilsModule'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'vibrate': {
        if (params != null && params instanceof Map) {
          let patternHippy: HippyArray = []
          let repeat = 1
          if ((params as HippyMap).get("patternHippy") !== undefined) {
            patternHippy = params.get("patternHippy") as HippyArray
          }
          if ((params as HippyMap).get("details") !== undefined) {
            repeat = (params as HippyMap).get("repeat") as number
          }
          this.vibrate(patternHippy as HippyArray, repeat as number)
        }
        break;
      }
      case 'cancel': {
        this.cancel()
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }

  private vibrate(patternHippy: HippyArray, repeat: number) {
    try { //todo 看需求是否区分振动类型time、preset
      vibrator.startVibration({
        type: 'preset',
        effectId: "0",
        count: repeat,
      }, {
        id: 0,
        usage: 'alarm'//默认类型
      }, (error) => {
        if (error) {
          LogUtils.e(UTILS_MODULE_TAG, 'vibrate fail, error.code: ' + error.code + 'error.message: ' + error.message);
          return;
        }
        LogUtils.e(UTILS_MODULE_TAG, 'Callback returned to indicate a successful vibration.');
      });
    } catch (err) {
      LogUtils.e(UTILS_MODULE_TAG, 'errCode: ' + err.code + ' ,msg: ' + err.message);
    }
  }

  private cancel() { //todo 看业务需求是否区分振动类型time、preset
    try {
      // 按照VIBRATOR_STOP_MODE_PRESET模式停止振动
      vibrator.stopVibration(vibrator.VibratorStopMode.VIBRATOR_STOP_MODE_PRESET, (error) => {
        if (error) {
          LogUtils.e(UTILS_MODULE_TAG, 'error.code' + error.code + 'error.message' + error.message);
          return;
        }
        LogUtils.d(UTILS_MODULE_TAG, 'Callback returned to indicate successful.');
      })
    } catch (err) {
      LogUtils.e(UTILS_MODULE_TAG, 'errCode: ' + err.code + ' ,msg: ' + err.message);
    }
  }
}
