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
import { PrimitiveSerializationTag } from '../../serialization/PrimitiveSerializationTag';
import { PrimitiveValueDeserializer } from '../../serialization/PrimitiveValueDeserializer';
import { BinaryReader } from '../../serialization/reader/BinaryReader';
import { HippySerValue, SharedSerialization } from '../../serialization/SharedSerialization';
import { StringLocation } from '../../serialization/string/StringLocation';
import { StringTable } from '../../serialization/string/StringTable';
import { HippyException } from '../../support/common/HippyException';
import { HippyAny, HippyArray, HippyMap, HippyValue } from '../../support/common/HippyTypes';
import { ErrorTag } from './ErrorTag';
import { JSSerializationTag } from './JSSerializationTag';

export class Deserializer extends PrimitiveValueDeserializer {
  TAG = 'Deserializer'
  private version13BrokenDataMode_ = false

  constructor(reader: BinaryReader, stringTable: StringTable | null) {
    super(reader, stringTable)
  }

  getSupportedVersion(): number {
    return 15
  }

  public readValue(): HippySerValue {
    /*
     *  The `V8` engine has a bug which produced invalid version 13 data (see https://crbug.com/1284506).
     *
     *  This compatibility mode tries to first read the data normally,
     *  and if it fails, and the version is 13, tries to read the broken format.
     */
    let originalPosition = this.reader_.position()
    try {
      return super.readValue()
    } catch (e) {
      if (this.getWireFormatVersion() == 13) {
        this.reader_.setPosition(originalPosition)
        this.version13BrokenDataMode_ = true
        return super.readValue()
      } else {
        throw e as Error
      }
    }
  }

  readValue3(tag: number, location: StringLocation, relatedKey: HippyAny): HippySerValue {
    let value = super.readValue3(tag, location, relatedKey)
    if (value != SharedSerialization.NOTHING) {
      return value
    }

    switch (tag) {
      case JSSerializationTag.TRUE_OBJECT:
        return this.readJSBoolean(true)
      case JSSerializationTag.FALSE_OBJECT:
        return this.readJSBoolean(false)
      case JSSerializationTag.NUMBER_OBJECT:
        return this.readJSNumber()
      case JSSerializationTag.BIG_INT_OBJECT:
        return this.readJSBigInt()
      case JSSerializationTag.STRING_OBJECT:
        return this.readJSString(location, relatedKey)
      case JSSerializationTag.REGEXP:
        return this.readJSRegExp()
      case JSSerializationTag.ARRAY_BUFFER:
        return this.readJSArrayBuffer()
      case JSSerializationTag.ARRAY_BUFFER_TRANSFER:
        return this.readTransferredJSArrayBuffer()
      case JSSerializationTag.SHARED_ARRAY_BUFFER:
        return this.readSharedArrayBuffer()
      case JSSerializationTag.BEGIN_JS_OBJECT:
        return this.readJSObject()
      case JSSerializationTag.BEGIN_JS_MAP:
        return this.readJSMap()
      case JSSerializationTag.BEGIN_JS_SET:
        return this.readJSSet()
      case JSSerializationTag.BEGIN_DENSE_JS_ARRAY:
        return this.readDenseArray()
      case JSSerializationTag.BEGIN_SPARSE_JS_ARRAY:
        return this.readSparseArray()
      case JSSerializationTag.WASM_MODULE_TRANSFER:
        return this.readTransferredWasmModule()
      case JSSerializationTag.HOST_OBJECT:
        return this.readHostObject()
      case JSSerializationTag.WASM_MEMORY_TRANSFER:
        return this.readTransferredWasmMemory()
      case JSSerializationTag.ERROR:
        return this.readJSError()
      case JSSerializationTag.SHARED_OBJECT: {
        if (this.getWireFormatVersion() >= 15) {
          return this.readSharedObject()
        }
        // If the data doesn't support shared values because it is from an older
        // version, treat the tag as unknown.
        // [[fallthrough]]
      }
      default: {
        //  Before there was an explicit tag for host objects, all unknown tags
        //  were delegated to the host.
        if (this.getWireFormatVersion() < 13) {
          this.reader_.setPosition(-1)
          return this.readHostObject()
        }

        // Unsupported Tag treated as Undefined
        return SharedSerialization.UNDEFINED
      }
    }
  }

  private readJSBoolean(value: boolean): boolean {
    return this.assignId(value) as boolean
  }

  private readJSNumber(): number {
    return this.assignId(this.reader_.getDouble()) as number
  }

  private readJSBigInt(): bigint {
    return this.assignId(this.readBigInt()) as bigint
  }

  private readJSString(location: StringLocation, relatedKey: HippyAny): string {
    return this.assignId(this.readString(location, relatedKey)) as string
  }

  private readJSRegExp(): HippySerValue {
    this.readString(StringLocation.VOID, null)
    this.reader_.getVarint()
    return this.assignId(SharedSerialization.UNDEFINED)
  }

  private readJSArrayBuffer(): HippySerValue {
    let byteLength = this.reader_.getVarint()
    if (byteLength < 0) {
      throw new HippyException(this.TAG + `: readJSArrayBuffer: out of range(${byteLength})`)
    }
    this.reader_.setPosition(this.reader_.position() + byteLength)

    this.assignId(SharedSerialization.UNDEFINED)
    if (this.peekTag() == JSSerializationTag.ARRAY_BUFFER_VIEW) {
      this.readJSArrayBufferView()
    }

    return null
  }

  public readTransferredJSArrayBuffer(): HippySerValue {
    this.reader_.getVarint()
    this.assignId(SharedSerialization.UNDEFINED)
    if (this.peekTag() == JSSerializationTag.ARRAY_BUFFER_VIEW) {
      this.readJSArrayBufferView()
    }
    return null
  }

  private readSharedArrayBuffer(): HippySerValue {
    this.reader_.getVarint()
    this.assignId(SharedSerialization.UNDEFINED)
    if (this.peekTag() == JSSerializationTag.ARRAY_BUFFER_VIEW) {
      this.readJSArrayBufferView()
    }
    return null
  }

  private readJSArrayBufferView(): void {
    let arrayBufferViewTag = this.readTag()
    if (arrayBufferViewTag != JSSerializationTag.ARRAY_BUFFER_VIEW) {
      throw new HippyException(this.TAG + `: readJSArrayBufferView: tag(${arrayBufferViewTag})`)
    }
    this.reader_.getVarint()
    this.reader_.getVarint()
    if (this.getWireFormatVersion() >= 14 || this.version13BrokenDataMode_) {
      this.reader_.getVarint()
    }
    this.reader_.getVarint()

    this.assignId(SharedSerialization.UNDEFINED)
  }

  private readJSObject(): HippyMap {
    let map = new Map<string, HippyAny>()
    this.assignId(map)
    let read = this.readJSProperties(map as HippyMap, JSSerializationTag.END_JS_OBJECT)
    let expected = this.reader_.getVarint()
    if (read != expected) {
      throw new HippyException(this.TAG + `: readJSObject: unexpected number of properties(${read},${expected})`)
    }
    return map as HippyMap
  }

  private readJSProperties(map: HippyMap | null, endTag: Number): number {
    let keyLocation: StringLocation, valueLocation: StringLocation
    if (endTag == JSSerializationTag.END_DENSE_JS_ARRAY) {
      keyLocation = StringLocation.DENSE_ARRAY_KEY
      valueLocation = StringLocation.DENSE_ARRAY_ITEM
    } else if (endTag == JSSerializationTag.END_JS_OBJECT) {
      keyLocation = StringLocation.OBJECT_KEY
      valueLocation = StringLocation.OBJECT_VALUE
    } else {
      throw new HippyException(this.TAG + ": readJSProperties: unreachable code")
    }

    let tag = 0
    let count = 0
    while ((tag = this.readTag()) != endTag) {
      count++
      let key = this.readValue3(tag, keyLocation, null) as string
      let value = this.readValue2(valueLocation, key)

      if (map != null && value != SharedSerialization.UNDEFINED) {
        if (typeof key == 'number') {
          map.set(String(key).valueOf(), value as HippyValue)
        } else if (typeof key == 'string') {
          if (key == "null") {
            map.set('', value as HippyValue)
          } else {
            map.set(key, value as HippyValue)
          }
        } else {
          throw new HippyException(this.TAG + ": readJSProperties: object key is not of string(null) nor number type")
        }
      }
    }
    return count
  }

  private readJSMap(): HippyMap {
    let map = new Map<HippyAny, HippyAny>()
    this.assignId(map)
    let tag = 0
    let read = 0;
    while ((tag = this.readTag()) != JSSerializationTag.END_JS_MAP) {
      read++
      let key = this.readValue3(tag, StringLocation.MAP_KEY, null)
      if (typeof key != 'string') {
        key = "null"
      }
      let value = this.readValue2(StringLocation.MAP_VALUE, key)
      if (value != SharedSerialization.UNDEFINED) {
        if (key == "null") {
          map.set(null, value as HippyAny)
        } else {
          map.set(key, value as HippyAny)
        }
      }
    }
    let expected = this.reader_.getVarint()
    if (2 * read != expected) {
      throw new HippyException(this.TAG + ": readJSMap: unexpected number of entries")
    }
    return map as HippyMap
  }

  private readJSSet(): HippyArray {
    let array = new Array<HippyAny>()
    this.assignId(array)
    let tag = 0
    let read = 0
    while ((tag = this.readTag()) != JSSerializationTag.END_JS_SET) {
      read++
      let value = this.readValue3(tag, StringLocation.SET_ITEM, null)
      array.push(value as HippyAny)
    }
    let expected = this.reader_.getVarint()
    if (read != expected) {
      throw new HippyException(this.TAG + ": readJSSet: unexpected number of values")
    }
    return array as HippyArray
  }

  private readDenseArray(): HippyArray {
    let length = this.reader_.getVarint()
    if (length < 0) {
      throw new HippyException(this.TAG + `: readDenseArray: out of range(${length})`)
    }
    let array = new Array<HippyAny>()
    this.assignId(array)
    for (let i = 0; i < length; i++) {
      let tag = this.readTag()
      if (tag != PrimitiveSerializationTag.THE_HOLE) {
        array.push(this.readValue3(tag, StringLocation.DENSE_ARRAY_ITEM, i) as HippyAny)
      }
    }

    let read = this.readJSProperties(null, JSSerializationTag.END_DENSE_JS_ARRAY)
    let expected = this.reader_.getVarint()
    if (read != expected) {
      throw new HippyException(this.TAG + ": readDenseArray: unexpected number of properties")
    }
    let length2 = this.reader_.getVarint()
    if (length != length2) {
      throw new HippyException(this.TAG + ": readDenseArray: length ambiguity")
    }
    return array as HippyArray
  }

  private readSparseArray(): HippyArray {
    let length = this.reader_.getVarint()
    let array = new Array<HippyAny>()
    this.assignId(array)

    let tag = 0
    let read = 0
    while ((tag = this.readTag()) != JSSerializationTag.END_SPARSE_JS_ARRAY) {
      read++
      let key = this.readValue3(tag, StringLocation.SPARSE_ARRAY_KEY, null)
      let value = this.readValue2(StringLocation.SPARSE_ARRAY_ITEM, key as HippyAny)

      let index = -1
      if (typeof key == 'number') {
        index = Math.trunc(key)
      } else if (typeof key == 'string') {
        try {
          index = parseInt(key)
        } catch (e) {
          // ignore not parsable string
        }
      }

      if (index >= 0) {
        let spaceNeeded = (index + 1) - array.length
        if (spaceNeeded == 1) { // Fast path, item are ordered in general ECMAScript(VM) implementation
          array.push(value as HippyAny)
        } else { // Slow path, universal
          for (let i = 0; i < spaceNeeded; i++) {
            array.push(null)
          }
          array[index] = value as HippyAny
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
    return array as HippyArray
  }

  private readTransferredWasmModule(): HippySerValue {
    this.reader_.getVarint()
    this.assignId(SharedSerialization.UNDEFINED)
    return null
  }

  private readHostObject(): HippySerValue {
    return this.assignId(SharedSerialization.UNDEFINED)
  }

  private readTransferredWasmMemory(): HippySerValue {
    this.reader_.getVarint()
    this.readSharedArrayBuffer()
    this.assignId(SharedSerialization.UNDEFINED)
    return null
  }

  private readJSError(): HippyMap {
    let message = ""
    let stack = ""
    let errorType = ""
    let done = false
    while (!done) {
      let tag = this.readErrorTag()
      if (tag == null) {
        break
      }
      switch (tag) {
        case ErrorTag.EVAL_ERROR:
          errorType = "EvalError"
          break
        case ErrorTag.RANGE_ERROR:
          errorType = "RangeError"
          break
        case ErrorTag.REFERENCE_ERROR:
          errorType = "ReferenceError"
          break
        case ErrorTag.SYNTAX_ERROR:
          errorType = "SyntaxError"
          break
        case ErrorTag.TYPE_ERROR:
          errorType = "TypeError"
          break
        case ErrorTag.URI_ERROR:
          errorType = "URIError"
          break
        case ErrorTag.MESSAGE:
          message = this.readString(StringLocation.ERROR_MESSAGE, null)
          break
        case ErrorTag.STACK:
          stack = this.readString(StringLocation.ERROR_STACK, null)
          break
        default:
          if (!(tag == ErrorTag.END)) {
            throw new HippyException(this.TAG + `: readJSError: ErrorTag(${tag})`)
          }
          done = true
          break
      }
    }

    let error = new Map<string, string>()
    error.set("message", message)
    error.set("stack", stack)
    error.set("type", errorType)
    this.assignId(error)
    return error
  }

  private readErrorTag(): number {
    return ErrorTag.fromTag(this.reader_.getVarint())
  }

  private readSharedObject(): HippySerValue {
    this.reader_.getVarint()
    return this.assignId(SharedSerialization.UNDEFINED)
  }

}
