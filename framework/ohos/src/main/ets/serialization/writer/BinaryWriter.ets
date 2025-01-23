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
import { HippyException } from '../../support/common/HippyException'

export class BinaryWriter {
  private bytes_: Array<number>
  private position_: number = 0

  constructor() {
    this.bytes_ = new Array<number>()
  }

  length(): number {
    return this.bytes_.length
  }

  position(): number {
    return this.position_
  }

  putByte(byte: number) {
    if (!(byte >= 0 && byte < 256)) {
      throw new HippyException(`illegal write byte(${byte}), out of range`)
    }

    this.bytes_.push(byte)
    this.position_++
  }

  putBytes(bytes: Uint8Array) {
    if (bytes.length == 0) {
      return;
    }

    for (let i = 0; i < bytes.length; i++) {
      this.putByte(bytes[i])
    }
  }

  putDouble(num: number) {
    let float64Array = new Float64Array([num])
    let bytes = new Uint8Array(float64Array.buffer)
    this.putBytes(bytes)
  }

  putVarint(num: number): number {
    let rest = num
    let bytes = 0
    let b: number
    do {
      b = rest & 0xff
      if (b != rest) {
        b |= 0x80
      }
      this.putByte(b)
      rest >>>= 7
      bytes++
    } while (rest != 0)
    return bytes
  }

  putInt64(num: bigint) {
    let int64Array = new BigInt64Array([num])
    let bytes = new Uint8Array(int64Array.buffer)
    this.putBytes(bytes)
  }

  putChar(c: number) {
    this.putByte(c & 0xff)
    this.putByte((c >> 8) & 0xff)
  }

  chunked(): Uint8Array {
    let bytes = this.bytes_
    this.reset()
    return Uint8Array.from(bytes)
  }

  reset(): BinaryWriter {
    this.bytes_ = new Array<number>()
    this.position_ = 0
    return this
  }
}
