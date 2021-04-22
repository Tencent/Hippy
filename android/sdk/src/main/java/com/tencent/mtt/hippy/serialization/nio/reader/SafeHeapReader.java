/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.serialization.nio.reader;

import java.nio.ByteBuffer;

public final class SafeHeapReader implements BinaryReader {
  private byte[] buffer;
  private int pos; // Relative to base
  private int count; // Relative to base
  private int base;

  public SafeHeapReader() {
    this(null);
  }

  public SafeHeapReader(ByteBuffer byteBuffer) {
    if (byteBuffer != null) {
      reset(byteBuffer);
    }
  }

  @Override
  public byte getByte() {
    if (pos == count) {
      throw new IndexOutOfBoundsException();
    }
    return buffer[base + pos++];
  }

  @Override
  public ByteBuffer getBytes(int length) {
    if (pos + length > count) {
      throw new IndexOutOfBoundsException();
    }
    ByteBuffer byteBuffer = ByteBuffer.wrap(buffer, base + pos, length);
    pos += length;
    return byteBuffer;
  }

  @Override
  public int position() {
    return pos;
  }

  @Override
  public int position(int position) {
    if (position < 0) {
      position += pos;
    }
    if (position < 0 || position > count) {
      throw new IndexOutOfBoundsException();
    }

    return pos = position;
  }

  @Override
  public int length() {
    return count;
  }

  @Override
  public double getDouble() {
    return Double.longBitsToDouble(readInt64());
  }

  @Override
  public long getVarint() {
    long value = 0;
    int shift = 0;
    byte b;
    do {
      b = getByte();
      value |= (b & 0x7fL) << shift;
      shift += 7;
    } while ((b & 0x80) != 0);
    return value;
  }

  @Override
  public long readInt64() {
    if (pos + 8 > count) {
      throw new IndexOutOfBoundsException();
    }

    int p = pos + base;
    pos += 8;
    final byte[] buffer = this.buffer;
    return (((buffer[p] & 0xffL))
      | ((buffer[p + 1] & 0xffL) << 8)
      | ((buffer[p + 2] & 0xffL) << 16)
      | ((buffer[p + 3] & 0xffL) << 24)
      | ((buffer[p + 4] & 0xffL) << 32)
      | ((buffer[p + 5] & 0xffL) << 40)
      | ((buffer[p + 6] & 0xffL) << 48)
      | ((buffer[p + 7] & 0xffL) << 56));
  }

  @Override
  public SafeHeapReader reset(ByteBuffer byteBuffer) {
    buffer = byteBuffer.array();
    base = byteBuffer.arrayOffset() + byteBuffer.position();
    count = byteBuffer.limit() - byteBuffer.position();
    pos = 0;
    return this;
  }
}
