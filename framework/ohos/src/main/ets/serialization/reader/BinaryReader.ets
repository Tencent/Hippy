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

export class BinaryReader {
  private bytes_: Uint8Array
  private byteLength_: number
  private position_: number = 0

  constructor(bytes: Uint8Array) {
    this.bytes_ = bytes
    this.byteLength_ = bytes.byteLength
  }

  length(): number {
    return this.byteLength_
  }

  position(): number {
    return this.position_
  }

  setPosition(pos: number) {
    if (pos < 0) {
      pos += this.position_
    }
    if (pos < 0 || pos >= this.byteLength_) {
      throw new HippyException(`illegal set position, position = ${this.position_}, targetPosition = ${pos}, total buffer length = ${this.byteLength_}`)
    }
    this.position_ = pos;
  }

  getByte(): number {
    let oneByte = this.bytes_[this.position_]
    this.position_++
    return oneByte
  }

  getBytes(length: number): Uint8Array {
    if (this.position_ + length > this.byteLength_) {
      throw new HippyException(`illegal read length, position = ${this.position_}}, length = ${this.length}, total buffer length = ${this.byteLength_}`)
    }
    let byteData = new Uint8Array(length)
    let index = 0
    for (let i = this.position_, j = this.position_ + length; i < j; i++) {
      byteData[index++] = this.bytes_[i]
    }
    this.position_ += length
    return byteData
  }

  getDouble(): number {
    let length = 8
    let byteData = new Uint8Array(length)
    let index = 0
    for (let i = this.position_, j = this.position_ + length; i < j; i++) {
      byteData[index++] = this.bytes_[i]
    }
    let buf64 = new Float64Array(byteData.buffer)
    let number = buf64[0]
    this.position_ += 8
    return number
  }

  getVarint(): number {
    let value = 0
    let shift = 0
    let b = 0
    do {
      b = this.getByte()
      value |= (b & 0x7f) << shift
      shift += 7
    } while ((b & 0x80) != 0)
    return value
  }

  readInt64(): bigint {
    let length = 8
    let byteData = new Uint8Array(length)
    let index = 0
    for (let i = this.position_, j = this.position_ + length; i < j; i++) {
      byteData[index++] = this.bytes_[i]
    }
    let buf64 = new BigInt64Array(byteData.buffer)
    let number = buf64[0]
    this.position_ += 8
    return number
  }
}
