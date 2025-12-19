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

  static convertMapToObject(value: HippyAny): HippyAny {
    if(value instanceof Array) {
      return (value as Array<HippyAny>).map(item => HRValueUtils.convertMapToObject(item))
    } else if (value instanceof Map) {
      let map = value as Map<string, HippyAny>
      let obj = new Map<string, HippyAny>()
      map.forEach((v: HippyAny, k: string) => {
        obj[k] = HRValueUtils.convertMapToObject(v)
      })
      let map2: Map<string, HippyAny> = new Map(Object.entries(value))
      map2.forEach((v: HippyAny, k: string) => {
        obj[k] = HRValueUtils.convertMapToObject(v)
      })
      return obj
    } else if (typeof value === 'object' && value !== null) {
      let map: Map<string, HippyAny> = new Map(Object.entries(value))
      let obj = new Map<string, HippyAny>()
      map.forEach((v: HippyAny, k: string) => {
        obj[k] = HRValueUtils.convertMapToObject(v)
      })
      return obj
    }
    return value
  }
}
