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
import { HippySerValue, Oddball, SharedSerialization } from './SharedSerialization';
import { BinaryReader } from './reader/BinaryReader';
import { StringTable } from './string/StringTable';
import { DirectStringTable } from './string/DirectStringTable';
import { InternalizedStringTable } from './string/InternalizedStringTable';
import { PrimitiveSerializationTag } from './PrimitiveSerializationTag';
import { StringLocation } from './string/StringLocation';
import { StringEncoding } from './string/StringEncoding';
import { HippyAny } from '../support/common/HippyTypes';
import { HippyException } from '../support/common/HippyException';

export class PrimitiveValueDeserializer extends SharedSerialization {
  protected stringTable_: StringTable
  protected reader_: BinaryReader

  protected version_: number = 0
  protected nextId_: number = 0

  protected objectMap_: Map<number, HippySerValue> = new Map<number, HippySerValue>()

  constructor(reader: BinaryReader, stringTable: StringTable | null) {
    super()
    this.reader_ = reader
    if (stringTable != null) {
      this.stringTable_ = stringTable
    } else {
      this.stringTable_ = new InternalizedStringTable()
    }
  }

  getSupportedVersion(): number {
    return -1
  }

  setReader(reader: BinaryReader) {
    this.reader_ = reader
  }

  getReader(): BinaryReader {
    return this.reader_
  }

  getStringTable(): StringTable {
    return this.stringTable_
  }

  reset() {
    this.objectMap_.clear()
    this.nextId_ = 0
  }

  readHeader() {
    if (this.readTag() == PrimitiveSerializationTag.VERSION) {
      this.version_ = this.reader_.getVarint();
      let supportedVersion = this.getSupportedVersion();
      if (supportedVersion > 0 && this.version_ > supportedVersion) {
        throw new HippyException(this.TAG + ": readHeader: invalid or unsupported version")
      }
    }
  }

  readValue(): HippySerValue {
    return this.readValue2(StringLocation.TOP_LEVEL, null)
  }

  readValue2(location: StringLocation, relatedKey: HippyAny): HippySerValue {
    let tag = this.readTag()
    return this.readValue3(tag, location, relatedKey)
  }

  readValue3(tag: number, location: StringLocation, relatedKey: HippyAny): HippySerValue {
    switch (tag) {
      case PrimitiveSerializationTag.TRUE:
        return true
      case PrimitiveSerializationTag.FALSE:
        return false
      case PrimitiveSerializationTag.THE_HOLE:
        return SharedSerialization.HOLE
      case PrimitiveSerializationTag.UNDEFINED:
        return SharedSerialization.UNDEFINED
      case PrimitiveSerializationTag.NULL:
        return SharedSerialization.NULL
      case PrimitiveSerializationTag.INT32:
        return this.readZigZag()
      case PrimitiveSerializationTag.UINT32:
        return this.reader_.getVarint()
      case PrimitiveSerializationTag.DOUBLE:
        return this.readDoubleWithRectification()
      case PrimitiveSerializationTag.BIG_INT:
        return this.readBigInt()
      case PrimitiveSerializationTag.ONE_BYTE_STRING:
        return this.readOneByteString(location, relatedKey)
      case PrimitiveSerializationTag.TWO_BYTE_STRING:
        return this.readTwoByteString(location, relatedKey)
      case PrimitiveSerializationTag.UTF8_STRING:
        return this.readUTF8String(location, relatedKey)
      case PrimitiveSerializationTag.DATE:
        return this.readDate()
      case PrimitiveSerializationTag.OBJECT_REFERENCE:
        return this.readObjectReference()
      default:
        return SharedSerialization.NOTHING
    }
  }

  readTag(): number {
    let tag: number
    do {
      tag = this.reader_.getByte()
    } while (tag == PrimitiveSerializationTag.PADDING)
    return tag
  }

  peekTag(): number {
    if (this.reader_.position() < this.reader_.length()) {
      let tag = this.reader_.getByte()
      this.reader_.setPosition(-1)
      return tag
    }
    return PrimitiveSerializationTag.VOID
  }

  readZigZag(): number {
    let zigzag = this.reader_.getVarint()
    let value = (zigzag >> 1) ^ -(zigzag & 1)
    return value
  }

  readUInt32(): number {
    return this.reader_.getVarint()
  }

  readUInt64(): number {
    return this.reader_.getVarint()
  }

  readDoubleWithRectification(): number {
    let doubleValue = this.reader_.getDouble()
    let longValue = Math.trunc(doubleValue)
    if (doubleValue == longValue) {
      return longValue
    }
    return doubleValue
  }

  readDouble(): number {
    return this.reader_.getDouble()
  }

  readBytes(length: number): Uint8Array {
    return this.reader_.getBytes(length)
  }

  readString(location: StringLocation, relatedKey: HippyAny): string {
    let tag = this.readTag()
    switch (tag) {
      case PrimitiveSerializationTag.ONE_BYTE_STRING:
        return this.readOneByteString(location, relatedKey)
      case PrimitiveSerializationTag.TWO_BYTE_STRING:
        return this.readTwoByteString(location, relatedKey)
      case PrimitiveSerializationTag.UTF8_STRING:
        return this.readUTF8String(location, relatedKey)
      default:
        throw new HippyException(this.TAG + ": readString: unreachable code")
      }
  }

  readBigInt(): bigint {
    let bitField = this.reader_.getVarint()
    let negative: boolean = (bitField & 1) != 0
    bitField >>= 1
    let bigInteger: bigint = BigInt(0)
    for (let i = 0; i < bitField; i++) {
      let b = this.reader_.getByte()
      for (let bit = 8 * i; bit < 8 * (i + 1); bit++) {
        if ((b & 1) != 0) {
          bigInteger = bigInteger | BigInt(Math.pow(2, bit))
        }
        b >>>= 1
      }
    }
    if (negative) {
      bigInteger = BigInt(0) - BigInt(bigInteger)
    }
    return bigInteger
  }

  readOneByteString(location: StringLocation, relatedKey: HippyAny): string {
    return this.readString2(StringEncoding.LATIN, location, relatedKey)
  }

  readTwoByteString(location: StringLocation, relatedKey: HippyAny): string {
    return this.readString2(StringEncoding.UTF16LE, location, relatedKey)
  }

  readUTF8String(location: StringLocation, relatedKey: HippyAny): string {
    return this.readString2(StringEncoding.UTF8, location, relatedKey)
  }

  readString2(encoding: StringEncoding, location: StringLocation, relatedKey: HippyAny): string {
    let byteCount = this.reader_.getVarint()
    if (byteCount < 0) {
      throw new HippyException(this.TAG + ": readString2: out of range")
    }

    if (byteCount == 0) {
      return ''
    }

    let byteBuffer = this.reader_.getBytes(byteCount)
    try {
      return this.stringTable_.lookup(byteBuffer, encoding, location, relatedKey)
    } catch (e) {
      throw new HippyException(this.TAG + ": readString2: unreachable code")
    }
  }

  readDate(): Date {
    let millis = this.reader_.getDouble()
    return this.assignId(new Date(Math.trunc(millis))) as Date
  }

  readObjectReference(): HippySerValue {
    let id = this.reader_.getVarint()
    if (id < 0) {
      throw new HippyException(this.TAG + ": readObjectReference: out of range")
    }
    let object = this.objectMap_.get(id)
    if (object == null) {
      throw new HippyException(this.TAG + ": readObjectReference: invalid object reference(" + id + ")")
    }
    return object
  }

  assignId(object: HippySerValue): HippySerValue {
    this.objectMap_.set(this.nextId_++, object)
    return object
  }

  getWireFormatVersion(): number {
    return this.version_
  }
}
