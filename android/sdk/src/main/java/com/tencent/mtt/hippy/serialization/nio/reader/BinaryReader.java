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

/**
 * A serialization reader that read primitive value in their binary form.
 * in little-endian order, because Android is always little-endian order.
 */
@SuppressWarnings({"unused", "UnusedReturnValue"})
public interface BinaryReader {
  /**
   * Reads the byte at this reader's current position
   *
   * @return The byte at the reader's current position
   */
  byte getByte();

  /**
   * This method transfers bytes from this reader into the {@link ByteBuffer}.
   *
   * @param length The maximum number of bytes to be written to the {@link ByteBuffer}
   * @return byte buffer
   */
  ByteBuffer getBytes(int length);

  /**
   * Reads the next eight bytes at this reader's current position,
   * composing them into a double value according to the little-endian order
   *
   * @return The double value at the reader's current position
   */
  double getDouble();

  /**
   * Reads an unsigned integer as a base-128 varint.
   * The number is written, 7 bits at a time, from the least significant to the
   * most significant 7 bits. Each byte, except the last, has the MSB set.
   * @see <a href="https://developers.google.com/protocol-buffers/docs/encoding">protocol buffers encoding</a>
   *
   * @return The int or long value at the reader's current position
   */
  long getVarint();

  /**
   *  Reads the next eight bytes at this reader's current position,
   *  composing them into a long value according to the little-endian order
   *
   * @return The long value at the reader's current position
   */
  long readInt64();

  /**
   * Returns this reader's length.
   *
   * @return The length of this reader
   */
  int length();

  /**
   * Returns this reader's position.
   *
   * @return The position of this reader
   */
  int position();

  /**
   * Sets this reader's position.
   * If new position is negative, it is treated as {@code current_position() + new_position}
   *
   * @param position The new position value
   * @return The current position of this writer
   */
  int position(int position);

  /**
   * Reset the reader
   *
   * @param byteBuffer The byte buffer used to read
   * @return This reader
   */
  BinaryReader reset(ByteBuffer byteBuffer);
}
