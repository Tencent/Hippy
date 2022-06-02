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

@SuppressWarnings("unused")
public abstract class AbstractBinaryWriter implements BinaryWriter {

  protected final int initialCapacity;
  protected final int maxCapacity;

  /**
   * Non-reusable binary writer
   *
   * @param initialCapacity The writer initial capacity
   */
  AbstractBinaryWriter(int initialCapacity) {
    this(initialCapacity, 0);
  }

  /**
   * Reusable binary writer
   *
   * @param initialCapacity The writer initial capacity
   * @param maxCapacity     The max cache capacity
   */
  AbstractBinaryWriter(int initialCapacity, int maxCapacity) {
    if (initialCapacity < 0 || maxCapacity < 0) {
      throw new NegativeArraySizeException();
    }
    this.initialCapacity = initialCapacity;
    this.maxCapacity = maxCapacity;
  }

  @Override
  abstract public void putByte(byte b);

  @Override
  abstract public void putBytes(byte[] bytes, int start, int length);

  @Override
  abstract public void putDouble(double d);

  @Override
  abstract public int putVarint(long l);

  @Override
  abstract public void putInt64(long l);

  @Override
  abstract public void putChar(char c);

  @Override
  abstract public int length();

  @Override
  abstract public int length(int length);

  @Override
  abstract public ByteBuffer chunked();
}
