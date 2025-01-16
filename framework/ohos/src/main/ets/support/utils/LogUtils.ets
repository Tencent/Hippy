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
import hilog from '@ohos.hilog';

export class LogUtils {
  private static DEBUG_ENABLE: boolean = false

  public static enableDebugLog(debuggable: boolean) {
    LogUtils.DEBUG_ENABLE = debuggable
  }

  public static d(tag: string, msg: string) {
    if (LogUtils.DEBUG_ENABLE) {
      hilog.debug(0x0000, tag, msg)
    }
  }

  public static l(tag: string, msg: string) {
    if (!LogUtils.DEBUG_ENABLE) {
      return
    }

    let index = 0  // 当前位置
    let max = 3800 // 需要截取的最大长度,别用4000
    let sub: string // 进行截取操作的string
    while (index < msg.length) {
      if (msg.length < max) { // 如果长度比最大长度小
        max = msg.length // 最大长度设为length,全部截取完成
        sub = msg.substring(index, max)
      } else {
        sub = msg.substring(index, max)
      }
      hilog.info(0x0000, tag, sub)
      index = max
      max += 3800
    }
  }

  public static w(tag: string, msg: string) {
    if (LogUtils.DEBUG_ENABLE) {
      hilog.warn(0x0000, tag, msg)
    }
  }

  public static i(tag: string, msg: string) {
    if (LogUtils.DEBUG_ENABLE) {
      hilog.info(0x0000, tag, msg)
    }
  }

  public static e(tag: string, msg: string) {
    hilog.error(0x0000, tag, msg)
  }
}
