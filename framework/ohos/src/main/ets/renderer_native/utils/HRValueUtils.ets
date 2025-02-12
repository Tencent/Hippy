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
import { HippyAny, HippyArray, HippyMap } from '../../support/common/HippyTypes'

export class HRValueUtils {
  static getNumber(value: HippyAny): number {
    if (typeof value == 'number') {
      return value
    } else if (typeof value == 'string') {
      try {
        return parseFloat(value)
      } catch (e) {
      }
    }
    return 0
  }

  static getNumber2(value: HippyAny, defaultValue: number): number {
    if (typeof value == 'number') {
      return value
    } else if (typeof value == 'string') {
      try {
        return parseFloat(value)
      } catch (e) {
      }
    }
    return defaultValue
  }

  static getString(value: HippyAny): string {
    if (typeof value == 'string') {
      return value
    }
    return ''
  }

  static getBoolean(value: HippyAny, defalutValue: boolean): boolean {
    if (typeof value == 'boolean') {
      return value
    }
    return defalutValue
  }

  static getMap(value: HippyAny): HippyMap | null {
    if (value instanceof Map) {
      return value as HippyMap
    }
    return null
  }

  static getArray(value: HippyArray): HippyArray | null {
    if (value instanceof Array) {
      return value
    }
    return null
  }

}
