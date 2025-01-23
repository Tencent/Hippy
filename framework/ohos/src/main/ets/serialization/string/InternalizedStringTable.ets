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
import { HippyAny } from '../../support/common/HippyTypes';
import { DirectStringTable } from './DirectStringTable';
import { StringEncoding } from './StringEncoding';
import { StringLocation } from './StringLocation';
import { HashMap } from '@kit.ArkTS';

export class InternalizedStringTable extends DirectStringTable {
  // region key
  private static MAX_KEY_CALC_LENGTH: number = 32
  private static KEY_TABLE_SIZE: number = 2 * 1024
  private keyTable: string[] = []
  // endregion

  // region value - local
  private VALUE_CACHE_SIZE: number = 32
  private valueCache: Map<number, string> = new Map<number, string>()
  // endregion

  /**
   * byte of "data:image/" URI string
   */
  private static DATA_IMAGE_URI: Uint8Array = new Uint8Array([
    'd'.charCodeAt(0),
    'a'.charCodeAt(0),
    't'.charCodeAt(0),
    'a'.charCodeAt(0),
    ':'.charCodeAt(0),
    'i'.charCodeAt(0),
    'm'.charCodeAt(0),
    'a'.charCodeAt(0),
    'g'.charCodeAt(0),
    'e'.charCodeAt(0),
    '/'.charCodeAt(0)
  ])
  private cacheablesProperty: HashMap<string, Uint8Array> = new HashMap<string, Uint8Array>()

  constructor() {
    super()
    this.cacheablesProperty.set("uri", InternalizedStringTable.DATA_IMAGE_URI)
    this.cacheablesProperty.set("src", InternalizedStringTable.DATA_IMAGE_URI)
    this.cacheablesProperty.set("source", InternalizedStringTable.DATA_IMAGE_URI)
  }

  private static DJB_HASH(byteData: Uint8Array): number {
    let hash = 5381
    for (let i = 0; i < byteData.length; i++) {
      hash = ((hash << 5) + hash) + byteData[i]
    }
    return hash
  }

  private static STRING_HASH(byteData: Uint8Array) {
    let hash = 0
    for (let i = 0; i < byteData.length; i++) {
      hash = hash * 31 + (byteData[i] & 0xff)
    }
    return hash
  }

  private equals(byteData: Uint8Array, encoding: StringEncoding, str: string): boolean {
    let bytesPerCharacter = encoding == StringEncoding.UTF16LE ? 2 : 1
    let count = str.length
    // fast negative check
    if (byteData.length / bytesPerCharacter != count) {
      return false
    }

    for (let i = 0; i < count; i++) {
      let c = str.charCodeAt(i)
      // little-endian
      if (byteData[i] != (c & 0xff) || (bytesPerCharacter == 2 && byteData[i + 1] != (c >> 8))) {
        return false
      }
    }

    return true
  }

  private lookupKey(byteData: Uint8Array,
                    encoding: StringEncoding): string {
    // only calculate one or two byte encoding
    if (byteData.length >= InternalizedStringTable.MAX_KEY_CALC_LENGTH || encoding == StringEncoding.UTF8) {
      return super.lookupImpl(byteData, encoding)
    }

    let hashCode = InternalizedStringTable.DJB_HASH(byteData)
    let hashIndex = (InternalizedStringTable.KEY_TABLE_SIZE - 1) & hashCode
    let internalized = this.keyTable[hashIndex]
    if (internalized != null && internalized != undefined && this.equals(byteData, encoding, internalized)) {
      return internalized
    }
    internalized = super.lookupImpl(byteData, encoding)
    this.keyTable[hashIndex] = internalized
    return internalized
  }

  private lookupValue(byteData: Uint8Array, encoding: StringEncoding, relatedKey: HippyAny): string {
    if (typeof relatedKey == 'string') {
      let valuePrefix = this.cacheablesProperty.get(relatedKey)
      if (valuePrefix) {
        let cacheables = true

        for (let i = 0; i < valuePrefix.length && i < byteData.length; i++) {
          if ((valuePrefix[i]) != byteData[i]) {
            cacheables = false
            break
          }
        }

        let value: string | undefined = undefined
        let hashCode = -1
        if (cacheables) {
          hashCode = InternalizedStringTable.STRING_HASH(byteData)
          value = this.valueCache.get(hashCode)
        }
        if (!value) {
          value = super.lookupImpl(byteData, encoding)
          if (cacheables) {
            this.valueCache.set(hashCode, value)
          }
        }
        return value
      }
    }

    return super.lookupImpl(byteData, encoding)
  }

  lookup(byteData: Uint8Array,
         encoding: StringEncoding,
         location: StringLocation,
         relatedKey: HippyAny
  ): string {
    switch (location) {
      case StringLocation.OBJECT_KEY:
      case StringLocation.DENSE_ARRAY_KEY:
      case StringLocation.SPARSE_ARRAY_KEY:
      case StringLocation.MAP_KEY:
        return this.lookupKey(byteData, encoding)
      case StringLocation.OBJECT_VALUE:
      case StringLocation.DENSE_ARRAY_ITEM:
      case StringLocation.SPARSE_ARRAY_ITEM:
      case StringLocation.MAP_VALUE:
        return this.lookupValue(byteData, encoding, relatedKey)
      case StringLocation.ERROR_MESSAGE:
      case StringLocation.ERROR_STACK:
      case StringLocation.REGEXP:
      case StringLocation.SET_ITEM:
      case StringLocation.TOP_LEVEL:
        return super.lookup(byteData, encoding, location, relatedKey);
      case StringLocation.VOID:
        return ''
      default:
        return ''
    }
  }

  release() {
    super.release()
    this.valueCache.clear()
  }
}
