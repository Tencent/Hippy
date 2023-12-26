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
import { HippyAny } from '../support/common/HippyTypes'
import { LogUtils } from '../support/utils/LogUtils'

export enum OddballType {
  UNDEFINED,
  NULL,
  HOLE,
  NOTHING
}

export class Oddball {
  private type_: OddballType

  constructor(type: OddballType) {
    this.type_ = type
  }

  isUndefined(): boolean {
    return this.type_ === OddballType.UNDEFINED
  }

  isNull(): boolean {
    return this.type_ === OddballType.NULL
  }

  isHole(): boolean {
    return this.type_ === OddballType.HOLE
  }
}

export type HippySerValue = HippyAny | Date | Oddball
  | Map<string, HippyAny>
  | Map<HippyAny, HippyAny>
  | Array<HippyAny>

export class SharedSerialization {
  TAG = 'SharedSerialization'

  static readonly HOLE = new Oddball(OddballType.HOLE)
  static readonly UNDEFINED = new Oddball(OddballType.UNDEFINED)
  static readonly NULL = new Oddball(OddballType.NULL)
  static readonly NOTHING = new Oddball(OddballType.NOTHING)

  printValue(value: HippySerValue, spaceString: string, prefixString: string) {
    if(value instanceof Array) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} Array(length=${value.length})`)
      for(let i = 0; i < value.length; i++) {
        this.printValue(value[i], `${spaceString}  `, `[${i}]: `)
      }
    } else if (value instanceof Map) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} Map(length=${value.size})`)
      value.forEach((value: HippyAny, key: HippyAny) => {
        this.printValue(key, `${spaceString}  `, `k: `)
        this.printValue(value, `${spaceString}  `, `v: `)
      })
    } else if (value instanceof Date) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} Date(mills=${value.getTime()})`)
    } else if (typeof value == 'string') {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} \'${value}\'`)
    } else if (typeof value == 'number') {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} ${value}`)
    } else if (typeof value == 'boolean') {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} ${value}`)
    } else if (typeof value == 'bigint') {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} bigint(${value})`)
    } else if (value == SharedSerialization.HOLE) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} HOLE`)
    } else if (value == SharedSerialization.UNDEFINED) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} UNDEFINED`)
    } else if (value == SharedSerialization.NULL) {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} NULL`)
    } else {
      LogUtils.d(this.TAG, `${spaceString} ${prefixString} NOTHING`)
    }
  }
}
