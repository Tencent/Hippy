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
package com.tencent.mtt.hippy.serialization.nio.writer;

import java.nio.ByteBuffer;

@SuppressWarnings({"unused"})
public final class SafeDirectWriter extends AbstractBinaryWriter {

  public static final int INITIAL_CAPACITY = 1024;
  public static final int MAX_CAPACITY = 1024 * 16; // 16k

  public ByteBuffer value;

  public SafeDirectWriter() {
    this(INITIAL_CAPACITY, MAX_CAPACITY);
  }

  public SafeDirectWriter(int initialCapacity, int maxCapacity) {
    super(initialCapacity, maxCapacity);
    value = ByteBuffer.allocateDirect(initialCapacity);
  }

  private void enlargeBuffer(int min) {
    int twice = (value.position() << 1) + 2;
    @SuppressWarnings("ManualMinMaxCalculation") ByteBuffer newData = ByteBuffer
        .allocateDirect(min > twice ? min : twice);
    value.flip();
    newData.put(value);
    value = newData;
  }

  @Override
  public void putByte(byte b) {
    if (value.position() == value.capacity()) {
      enlargeBuffer(value.position() + 1);
    }
    value.put(b);
  }

  @Override
  public void putBytes(byte[] bytes, int start, int length) {
    if (value.position() + bytes.length > value.capacity()) {
      enlargeBuffer(value.position() + bytes.length);
    }

    value.put(bytes, start, length);
  }

  @Override
  public void putDouble(double d) {
    value.putDouble(d);
  }

  @Override
  public int putVarint(long l) {
    if (value.position() + 10 > value.capacity()) {
      enlargeBuffer(value.position() + 10);
    }

    long rest = l;
    int bytes = 0;
    byte b;
    do {
      b = (byte) rest;
      b |= 0x80;
      value.put(b);
      rest >>>= 7;
      bytes++;
    } while (rest != 0);
    value.position(value.position() - 1);
    value.put((byte) (b & 0x7f));
    return bytes;
  }

  @Override
  public void putInt64(long l) {
    if (value.position() + 8 > value.capacity()) {
      enlargeBuffer(value.position() + 8);
    }

    value.putLong(l);
  }

  @Override
  public void putChar(char c) {
    if (value.position() + 2 > value.capacity()) {
      enlargeBuffer(value.position() + 2);
    }

    value.putChar(c);
  }

  @Override
  public int length() {
    return value.position();
  }

  @Override
  public int length(int length) {
    if (length < 0) {
      length += value.position();
    }
    value.position(length);
    return length;
  }

  @Override
  public ByteBuffer chunked() {
    value.flip();
    ByteBuffer chunked;
    if (value.limit() < maxCapacity) {
      chunked = value.duplicate();
    } else {
      chunked = value;
      value = ByteBuffer.allocateDirect(initialCapacity);
    }
    return chunked;
  }
}
