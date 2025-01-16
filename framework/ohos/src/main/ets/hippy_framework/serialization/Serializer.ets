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
import { HippySerValue } from '../../serialization/SharedSerialization';
import { BinaryWriter } from '../../serialization/writer/BinaryWriter';
import { HippyAny, HippyArray, HippyMap } from '../../support/common/HippyTypes';
import { JSSerializationTag } from './JSSerializationTag';

export class Serializer extends PrimitiveValueSerializer {
  constructor(writer: BinaryWriter) {
    super(writer, 13)
  }

  writeValue(value: HippySerValue): boolean {
    if (super.writeValue(value)) {
      return true
    }
    if (value instanceof Array) {
      this.assignId(value)
      this.writeJSArray(value as HippyArray)
    } else if (value instanceof Map) {
      this.assignId(value)
      this.writeJSObject(value as HippyMap)
    } else {
      return false
    }
    return true
  }

  private writeJSObject(value: HippyMap) {
    this.writeTag(JSSerializationTag.BEGIN_JS_OBJECT)
    value.forEach((value: HippyAny, key: string) => {
      this.writeString(key)
      this.writeValue(value)
    })
    this.writeTag(JSSerializationTag.END_JS_OBJECT)
    this.writer_.putVarint(value.size)
  }

  private writeJSArray(value: HippyArray) {
    let length = value.length
    this.writeTag(JSSerializationTag.BEGIN_DENSE_JS_ARRAY)
    this.writer_.putVarint(length)
    for(let i = 0; i < length; i++) {
      this.writeValue(value[i])
    }
    this.writeTag(JSSerializationTag.END_DENSE_JS_ARRAY)
    this.writer_.putVarint(0)
    this.writer_.putVarint(length)
  }

}
