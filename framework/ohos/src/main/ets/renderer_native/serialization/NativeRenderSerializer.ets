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
import { PrimitiveValueSerializer } from '../../serialization/PrimitiveValueSerializer';
import { HippySerValue, SharedSerialization } from '../../serialization/SharedSerialization';
import { BinaryWriter } from '../../serialization/writer/BinaryWriter';
import { HippyException } from '../../support/common/HippyException';
import { HippyAny } from '../../support/common/HippyTypes';
import { NativeRenderSerializationTag } from './NativeRenderSerializationTag';

export class NativeRenderSerializer extends PrimitiveValueSerializer {
  TAG = "NativeRenderSerializer"

  constructor(writer: BinaryWriter) {
    super(writer, 13)
  }

  writeValue(object: HippySerValue): boolean {
    if (object == null) {
      object = SharedSerialization.NULL
    }
    if (super.writeValue(object)) {
      return true
    }
    if (object instanceof Map) {
      this.assignId(object)
      if (object.size > 0) {
        let keys = object.keys()
        for (let key of keys) {
          if(typeof key == 'string') {
            this.writeObject(object as Map<string, HippyAny>)
          } else {
            this.writeMap(object as Map<HippyAny, HippyAny>)
          }
          break
        }
      } else {
        this.writeObject(object as Map<string, HippyAny>)
      }
    } else if (object instanceof Array) {
      this.assignId(object)
      this.writeList(object)
    } else {
      throw new HippyException(this.TAG + ": writeValue: unsupported object data type, object = " + object)
    }
    return true
  }

  writeMap(map: Map<HippyAny, HippyAny>) {
    this.writeTag(NativeRenderSerializationTag.BEGIN_MAP)
    let count = 0
    map.forEach((value: HippyAny, key: HippyAny) => {
      count++
      this.writeValue(key)
      this.writeValue(value)
    })
    this.writeTag(NativeRenderSerializationTag.END_MAP)
    this.writer_.putVarint(2 * count)
  }

  writeObject(map: Map<string, HippyAny>) {
    this.writeTag(NativeRenderSerializationTag.BEGIN_OBJECT)
    map.forEach((value: HippyAny, key: string) => {
      if (key == null) {
        this.writeString("null")
      } else {
        this.writeString(key)
      }
      this.writeValue(value)
    })
    this.writeTag(NativeRenderSerializationTag.END_OBJECT)
    this.writer_.putVarint(map.size)
  }

  writeList(list: Array<HippyAny>) {
    let length = list.length
    this.writeTag(NativeRenderSerializationTag.BEGIN_DENSE_ARRAY)
    this.writer_.putVarint(length)
    for(let i = 0; i < length; i++) {
      this.writeValue(list[i])
    }
    this.writeTag(NativeRenderSerializationTag.END_DENSE_ARRAY)
    this.writer_.putVarint(0)
    this.writer_.putVarint(length)
  }
}
