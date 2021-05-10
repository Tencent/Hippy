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
public final class SafeHeapWriter extends AbstractBinaryWriter {
  public static final int INITIAL_CAPACITY = 64;
  public static final int MAX_CAPACITY = 1024 * 16; // 16k

  public byte[] value;
  private int count = 0;

  public SafeHeapWriter() {
    this(INITIAL_CAPACITY, MAX_CAPACITY);
  }

  public SafeHeapWriter(int initialCapacity, int maxCapacity) {
    super(initialCapacity, maxCapacity);
    value = new byte[initialCapacity];
  }

  private void enlargeBuffer(int min) {
    int twice = (value.length << 1) + 2;
    @SuppressWarnings("ManualMinMaxCalculation") byte[] newData = new byte[min > twice ? min : twice];
    System.arraycopy(value, 0, newData, 0, count);
    value = newData;
  }

  @Override
  public void putByte(byte b) {
    if (count == value.length) {
      enlargeBuffer(count + 1);
    }
    value[count++] = b;
  }

  @Override
  public void putBytes(byte[] bytes, int start, int length) {
    // start + length could overflow, start/length maybe MaxInt
    if (start >= 0 && 0 <= length && length <= bytes.length - start) {
      int newSize = count + length;
      if (newSize > value.length) {
        enlargeBuffer(newSize);
      }

      System.arraycopy(bytes, start, value, count, length);
      count = newSize;
    } else {
      throw new ArrayIndexOutOfBoundsException();
    }
  }

  @Override
  public void putDouble(double d) {
    putInt64(Double.doubleToRawLongBits(d));
  }

  @Override
  public int putVarint(long l) {
    if (count + 10 > value.length) {
      enlargeBuffer(count + 10);
    }

    long rest = l;
    int bytes = 0;
    byte b;
    do {
      b = (byte) rest;
      b |= 0x80;
      value[count++] = b;
      rest >>>= 7;
      bytes++;
    } while (rest != 0);
    value[count - 1] = (byte) (b & 0x7f);
    return bytes;
  }

  @Override
  public void putInt64(long l) {
    if (count + 8 > value.length) {
      enlargeBuffer(count + 8);
    }

    value[count++] = (byte) l;
    value[count++] = (byte) (l >> 8);
    value[count++] = (byte) (l >> 16);
    value[count++] = (byte) (l >> 24);
    value[count++] = (byte) (l >> 32);
    value[count++] = (byte) (l >> 40);
    value[count++] = (byte) (l >> 48);
    value[count++] = (byte) (l >> 56);
  }

  @Override
  public void putChar(char c) {
    if (count + 2 > value.length) {
      enlargeBuffer(count + 2);
    }

    value[count++] = ((byte) c);
    value[count++] = ((byte)(c >> 8));
  }

  @Override
  public int length() {
    return count;
  }

  @Override
  public int length(int length) {
    if (length < 0) {
      length += count;
      if (length < 0) {
        throw new IndexOutOfBoundsException();
      }
    }

    if (length > value.length) {
      enlargeBuffer(length);
    }

    return count = length;
  }

  @Override
  public final ByteBuffer chunked() {
    ByteBuffer chunked =  ByteBuffer.wrap(value, 0, count);
    if (count >= maxCapacity) {
      value = new byte[initialCapacity];
    }
    count = 0;
    return chunked;
  }
}
