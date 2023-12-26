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
import { HippyAny, HippyArray, HippyValue } from '../common/HippyTypes'
import { LogUtils } from './LogUtils'

export class ArgumentUtils {
  public static objectToJson(obj: HippyAny): string {
    if (obj == null || obj == undefined) {
      return ""
    }

    let str = ArgumentUtils.objectToJsonImpl(obj)
    return str
  }

  private static stringFormat(value: string): string {
    let builder: string = "\""
    for (let i = 0, length = value.length; i < length; i++) {
      let c = value.charAt(i)
      switch (c) {
        case '"':
        case '\\':
        case '/': {
          builder += "\\"
          builder += c
          break
        }
        case '\t': {
          builder += "\\t"
          break
        }
        case '\b': {
          builder += "\\b"
          break
        }
        case '\n': {
          builder += "\\n"
          break
        }
        case '\r': {
          builder += "\\r"
          break
        }
        case '\f': {
          builder += "\\f"
          break
        }
        default: {
          if (c.charCodeAt(0) <= 0x1F) {
            builder += "\\u"
            builder += ("0000" + c.charCodeAt(0).toString(16)).slice(-4)
          } else {
            builder += c
          }
          break
        }
      }
    }
    builder += "\""
    return builder
  }

  private static objectToJsonImpl(obj: HippyAny): string {
    let builder: string = ""
    if (obj == null || obj == undefined) {
      builder += "\"\""
      return builder
    }

    if (typeof obj == 'string') {
      if (obj.length == 0) {
        builder += "\"\""
      } else {
        builder += ArgumentUtils.stringFormat(obj)
      }
    } else if (typeof obj == 'number') {
      builder += Number.isNaN(obj) ? "0" : obj.toString()
    } else if (typeof obj == 'bigint') {
      builder += obj.toString()
    } else if (typeof obj == 'boolean') {
      builder += obj.toString()
    } else if (obj instanceof Array) {
      builder += "["
      let array = obj as Array<HippyAny>
      let length = array.length
      for (let i = 0; i < length; i++) {
        builder += ArgumentUtils.objectToJsonImpl(array[i])
        if (i != length - 1) {
          builder += ","
        }
      }
      builder += "]"
    } else if ((obj instanceof Map) || (typeof obj == 'object')) {
      let map: Map<string, HippyAny>
      if (obj instanceof Map) {
        map = obj as Map<string, HippyAny>
      } else {
        map = new Map(Object.entries(obj))
      }
      builder += "{"
      let length = map.size
      let count = 0
      map.forEach((value: HippyAny, key: string) => {
        builder += "\""
        builder += key
        builder += "\""
        builder += ":"
        builder += ArgumentUtils.objectToJsonImpl(value)
        ++count
        if (count < length) {
          builder += ","
        }
      })
      builder += "}"
    } else {
      builder += "\"\""
    }
    return builder
  }

  public static mapToRecord(map: Map<string, HippyAny>): Object {
    let record: Record<string, Object> = {};
    map.forEach((value, key) => {
      if (key != undefined && key != null) {
        if (value instanceof Map) {
          record[key] = ArgumentUtils.mapToRecord(value);
        } else if (Array.isArray(value)) {
          record[key] = ArgumentUtils.arrayToRecordArray(value);
        } else {
          record[key] = value as Object;
        }
      }
    })
    return record;
  }

  public static arrayToRecordArray(array: HippyArray): Object {
    return array.map((value) => {
      if (value instanceof Map) {
        return ArgumentUtils.mapToRecord(value);
      } else if (Array.isArray(value)) {
        return ArgumentUtils.arrayToRecordArray(value);
      } else {
        return value as Object;
      }
    });
  }

}
