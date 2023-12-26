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
import { LogUtils } from '../../support/utils/LogUtils';
import { BinaryReader } from '../../serialization/reader/BinaryReader';
import { StringLocation } from '../../serialization/string/StringLocation';
import { StringTable } from '../../serialization/string/StringTable';
import { PrimitiveValueDeserializer } from '../../serialization/PrimitiveValueDeserializer';
import { PrimitiveSerializationTag } from '../../serialization/PrimitiveSerializationTag';
import { NativeRenderSerializationTag } from './NativeRenderSerializationTag';
import {
  HippySerValue, SharedSerialization } from '../../serialization/SharedSerialization';
import { HippyAny } from '../../support/common/HippyTypes';
import { HippyException } from '../../support/common/HippyException';

export class NativeRenderDeserializer extends PrimitiveValueDeserializer {
  TAG = "NativeRenderDeserializer"

  constructor(reader: BinaryReader, stringTable: StringTable | null) {
    super(reader, stringTable)
  }

  getSupportedVersion(): number {
    return -1
  }

  readValue3(tag: number, location: StringLocation, relatedKey: HippyAny): HippySerValue {
    let object = super.readValue3(tag, location, relatedKey)
    if (object != SharedSerialization.NOTHING) {
      return object
    }

    switch (tag) {
      case NativeRenderSerializationTag.TRUE_OBJECT:
        return this.readBooleanObject(true)
      case NativeRenderSerializationTag.FALSE_OBJECT:
        return this.readBooleanObject(false)
      case NativeRenderSerializationTag.NUMBER_OBJECT:
        return this.readNumberObject()
      case NativeRenderSerializationTag.BIG_INT_OBJECT:
        return this.readBigIntObject()
      case NativeRenderSerializationTag.STRING_OBJECT:
        return this.readStringObject(location, relatedKey)
      case NativeRenderSerializationTag.BEGIN_OBJECT:
        return this.readObject()
      case NativeRenderSerializationTag.BEGIN_MAP:
        return this.readMap()
      case NativeRenderSerializationTag.BEGIN_DENSE_ARRAY:
        return this.readDenseArray()
      case NativeRenderSerializationTag.BEGIN_SPARSE_JS_ARRAY:
        return this.readSparseArray()
      default:
        throw new HippyException(this.TAG + `: readValue3: unsupported tag(${tag})`)
    }
  }

  readBooleanObject(value: boolean): boolean {
    return this.assignId(value) as boolean
  }

  readNumberObject(): number {
    return this.assignId(this.reader_.getDouble()) as number
  }

  readBigIntObject(): bigint {
    return this.assignId(this.readBigInt()) as bigint
  }

  readStringObject(location: StringLocation, relatedKey: HippyAny): string {
    return this.assignId(this.readString(location, relatedKey)) as string
  }

  readObject(): Map<string, HippyAny> {
    let map = new Map<string, HippyAny>()
    this.assignId(map)
    let read = this.readObjectProperties(map)
    let expected = this.reader_.getVarint()
    if (read != expected) {
      throw new HippyException(this.TAG + ": readObject: unexpected number of properties")
    }
    return map;
  }

  readObjectProperties(map: Map<string, HippyAny>): number {
    let keyLocation = StringLocation.OBJECT_KEY
    let valueLocation = StringLocation.OBJECT_VALUE

    let tag: number = 0
    let count: number = 0
    while ((tag = this.readTag()) != NativeRenderSerializationTag.END_OBJECT) {
      count++
      let key = this.readValue3(tag, keyLocation, null) as string
      let value = this.readValue2(valueLocation, key) as HippyAny
      if (typeof key == 'string' || typeof key == 'number') {
        map.set(key.toString(), value)
      } else {
        throw new HippyException(this.TAG + ": readObjectProperties: object key is not of String nor Number type")
      }
    }
    return count
  }

  readMap(): Map<HippyAny, HippyAny> {
    let map: Map<HippyAny, HippyAny> = new Map<HippyAny, HippyAny>()
    this.assignId(map)
    let tag: number = 0
    let read: number = 0
    while ((tag = this.readTag()) != NativeRenderSerializationTag.END_MAP) {
      read++
      let key = this.readValue3(tag, StringLocation.MAP_KEY, null) as HippyAny
      let value = this.readValue2(StringLocation.MAP_VALUE, key) as HippyAny
      map.set(key, value)
    }
    let expected = this.reader_.getVarint()
    if (2 * read != expected) {
      throw new HippyException(this.TAG + ": readMap: unexpected number of entries")
    }
    return map
  }

  readDenseArray(): Array<HippyAny> {
    let totalLength = this.reader_.getVarint()
    if (totalLength < 0) {
      throw new HippyException(this.TAG + ": readDenseArray: out of range")
    }
    let array: Array<HippyAny> = new Array<HippyAny>()
    this.assignId(array)
    for (let i = 0; i < totalLength; i++) {
      let tag = this.readTag()
      if (tag != PrimitiveSerializationTag.THE_HOLE) {
        array.push(this.readValue3(tag, StringLocation.DENSE_ARRAY_ITEM, i) as HippyAny)
      }
    }
    let propsLength = this.readArrayProperties()
    let expected = this.reader_.getVarint()
    if (propsLength != expected) {
      throw new HippyException(this.TAG + ": readDenseArray: unexpected number of properties")
    }
    expected = this.reader_.getVarint()
    if (totalLength != expected) {
      throw new HippyException(this.TAG + ": readDenseArray: length ambiguity")
    }
    return array
  }

  readArrayProperties(): number {
    let keyLocation = StringLocation.DENSE_ARRAY_KEY
    let valueLocation = StringLocation.DENSE_ARRAY_ITEM

    let tag: number = 0
    let count: number = 0
    while ((tag = this.readTag()) != NativeRenderSerializationTag.END_DENSE_ARRAY) {
      count++
      let key = this.readValue3(tag, keyLocation, null) as HippyAny
      let value = this.readValue2(valueLocation, key) as HippyAny
      LogUtils.d(this.TAG, "readArrayProperties: key" + key + ", value=" + value)
    }
    return count
  }

  readSparseArray(): Array<HippyAny> {
    let length = this.reader_.getVarint()
    let array: Array<HippyAny> = new Array<HippyAny>()
    this.assignId(array)
    let tag: number = 0
    let read: number = 0
    while ((tag = this.readTag()) != NativeRenderSerializationTag.END_SPARSE_JS_ARRAY) {
      read++
      let key = this.readValue3(tag, StringLocation.SPARSE_ARRAY_KEY, null) as HippyAny
      let value = this.readValue2(StringLocation.SPARSE_ARRAY_ITEM, key) as HippyAny
      let index = -1
      if (typeof key == 'number') {
        index = Math.trunc(key.valueOf())
      } else if (typeof key == 'string') {
        try {
          index = parseInt(key.valueOf())
        } catch (e) {
          // ignore not parsable string
        }
      }
      if (index >= 0) {
        let spaceNeeded = (index + 1) - array.length
        if (spaceNeeded == 1) { // Fast path, item are ordered in general ECMAScript(VM) implementation
          array.push(value)
        } else { // Slow path, universal
          for (let i = 0; i < spaceNeeded; i++) {
            array.push(null)
          }
          array[index] = value
        }
      }
    }
    let expected = this.reader_.getVarint()
    if (read != expected) {
      throw new HippyException(this.TAG + ": readSparseArray: unexpected number of properties")
    }
    let length2 = this.reader_.getVarint()
    if (length != length2) {
      throw new HippyException(this.TAG + ": readSparseArray: length ambiguity")
    }
    return array
  }
}
