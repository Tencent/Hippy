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
package com.tencent.mtt.hippy.serialization;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.serialization.utils.IntegerPolyfill;
import com.tencent.mtt.hippy.serialization.nio.writer.BinaryWriter;

import java.math.BigInteger;
import java.util.IdentityHashMap;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
@SuppressWarnings({"unused"})
public abstract class PrimitiveValueSerializer extends SharedSerialization {

  /**
   * Writer used for write buffer.
   */
  protected BinaryWriter writer;
  /**
   * ID of the next serialized object.
   **/
  private int nextId;
  /**
   * Maps a serialized object to its ID.
   */
  private final Map<Object, Integer> objectMap = new IdentityHashMap<>();
  /**
   * Temporary char buffer for string writing.
   */
  private char[] stringWriteBuffer;
  /**
   * Unsigned int max value.
   */
  private static final long MAX_UINT32_VALUE = 4294967295L;
  /**
   * Small string max length, used for SSO(Short / Small String Optimization).
   */
  private static final int SSO_SMALL_STRING_MAX_LENGTH = 32;

  protected PrimitiveValueSerializer(BinaryWriter writer) {
    super();

    this.writer = writer;
  }

  /**
   * Set current binary writer
   *
   * @param writer The binary writer to be set
   */
  public void setWriter(BinaryWriter writer) {
    this.writer = writer;
  }

  /**
   * Get current binary writer
   *
   * @return The current binary writer
   */
  public BinaryWriter getWriter() {
    return writer;
  }

  /**
   * Reset Serializer, for the future using
   */
  public void reset() {
    objectMap.clear();
    nextId = 0;
    stringWriteBuffer = null;
  }

  /**
   * Writes out a header, which includes the format version.
   */
  public void writeHeader() {
    writeTag(SerializationTag.VERSION);
    writer.putVarint(LATEST_VERSION);
  }

  protected void writeTag(SerializationTag tag) {
    writer.putByte(tag.getTag());
  }

  protected void writeTag(ArrayBufferViewTag tag) {
    writer.putByte(tag.getTag());
  }

  protected void writeTag(ErrorTag tag) {
    writer.putByte(tag.getTag());
  }

  /**
   * Serializes a JavaScript delegate object into the buffer.
   *
   * @param value JavaScript delegate object
   */
  public boolean writeValue(Object value) {
    if (value instanceof String) {
      writeString((String) value);
    } else if (value instanceof Number) {
      if (value instanceof Integer || value instanceof Short || value instanceof Byte) {
        writeTag(SerializationTag.INT32);
        writeInt32((int) value);
      } else if (value instanceof Long) {
        long longValue = (long) value;
        if (longValue <= MAX_UINT32_VALUE) {
          writeTag(SerializationTag.UINT32);
          writer.putVarint(longValue);
        } else {
          writeTag(SerializationTag.DOUBLE);
          writer.putDouble((double) value);
        }
      } else if (value instanceof BigInteger) {
        writeTag(SerializationTag.BIG_INT);
        writeBigIntContents((BigInteger) value);
      } else {
        double doubleValue = ((Number) value).doubleValue();
        writeTag(SerializationTag.DOUBLE);
        writer.putDouble(doubleValue);
      }
    } else if (value == Boolean.TRUE) {
      writeTag(SerializationTag.TRUE);
    } else if (value == Boolean.FALSE) {
      writeTag(SerializationTag.FALSE);
    } else if (value == Hole) {
      writeTag(SerializationTag.THE_HOLE);
    } else if (value == Undefined) {
      writeTag(SerializationTag.UNDEFINED);
    } else if (value == Null) {
      writeTag(SerializationTag.NULL);
    } else {
      Integer id = objectMap.get(value);
      if (id != null) {
        writeTag(SerializationTag.OBJECT_REFERENCE);
        writer.putVarint(id);
      } else {
        return false;
      }
    }
    return true;
  }

  protected void writeInt32(int value) {
    int zigzag = (value << 1) ^ (value >> 31);
    writer.putVarint(IntegerPolyfill.toUnsignedLong(zigzag));
  }

  /**
   * Write {@code UInt32} data to the buffer.
   *
   * @param value data
   */
  public void writeUInt32(long value) {
    writer.putVarint(value);
  }

  /**
   * Write {@code UInt64} data to the buffer.
   *
   * @param value data
   */
  public void writeUInt64(long value) {
    writer.putVarint(value);
  }

  /**
   * Write {@code byte[]} to the buffer.
   *
   * @param bytes  source
   * @param start  start position in source
   * @param length length in source
   */
  public void writeBytes(byte[] bytes, int start, int length) {
    writer.putBytes(bytes, start, length);
  }

  /**
   * Write {@code double} data to the buffer.
   *
   * @param value data
   */
  public void writeDouble(double value) {
    writer.putDouble(value);
  }

  /**
   * <p>Write {@link String} string to the buffer</p>
   * <p></p>
   *
   * <h2>Research</h2>
   *
   * <h3>Background / Overview</h3>
   * <p>According to the following benchmark tests and real world scenarios,
   * this method will choose different iterator based on the length of the string for more
   * efficiency, called <strong>SSO</strong>(Short / Small String Optimization).</p>
   * <p>If string length small than {@link #SSO_SMALL_STRING_MAX_LENGTH}, will use {@link
   * String#charAt(int)}
   * to iterate, otherwise will use {@link String#getChars(int, int, char[], int)}</p>
   * <p></p>
   *
   * <h3>Benchmark</h3>
   *
   * <h4>Test Cases</h4>
   * <pre>{@code
   *   int charAt(final String data) {
   *     final int len = data.length();
   *     for (int i = 0; i < len; i++) {
   *       if (data.charAt(i) <= ' ') {
   *         doThrow();
   *       }
   *     }
   *     return len;
   *   }
   *
   *   int getChars(final char[] reusable, final String data) {
   *     final int len = data.length();
   *     data.getChars(0, len, reusable, 0);
   *     for (int i = 0; i < len; i++) {
   *       if (reusable[i] <= ' ') {
   *         doThrow();
   *       }
   *     }
   *     return len;
   *   }
   *
   *   int toCharArray(final String data) {
   *     final int len = data.length();
   *     final char[] copy = data.toCharArray();
   *     for (int i = 0; i < len; i++) {
   *       if (copy[i] <= ' ') {
   *         doThrow();
   *       }
   *     }
   *     return len;
   *   }
   * }</pre>
   *
   * <h4>Results</h4>
   * <i>(run tests on HUAWEI JSN-AL00a with Android 9)</i>
   * <pre>
   *   ======= (tries per size: 1000) =======
   *   Size   charAt  getChars    toCharArray
   *      1   357.00  1,289.00    567.00
   *      2   179.00    202.00    300.00
   *      4    87.75     95.75    141.25
   *      8    46.63     46.88     73.75
   *     16    25.06     25.06     41.44
   *     32    14.53     14.13     24.22
   *     64     8.66      8.05     12.45
   *    128     6.23      5.22      8.27
   *    256     4.84      3.89      6.13
   *    512     4.10      3.21      5.44
   *   1024     3.91      4.36      4.83
   *   2048     3.67      2.78      4.85
   *   4096     4.01      2.65      6.32
   *   8192     3.60      2.63      6.42
   *  16384     3.65      2.61      5.39
   *  32768     3.61      2.60      4.91
   *  65536     3.57      2.62      4.68
   *  Rate in nanoseconds per character inspected
   * </pre>
   * <p>Obviously we can discover two facts,
   * {@link String#toCharArray()} performance is lower than other methods at any time, and there is
   * a dividing line when the string has 32({@link #SSO_SMALL_STRING_MAX_LENGTH}) characters.</p>
   *
   * @param value data
   * @see <a href="https://stackoverflow.com/questions/8894258/fastest-way-to-iterate-over-all-the-chars-in-a-string">Fastest
   * way to iterate over all the chars in a String</a>
   * @see <a href="https://stackoverflow.com/questions/196830/what-is-the-easiest-best-most-correct-way-to-iterate-through-the-characters-of-a">What
   * is the easiest/best/most correct way to iterate through the characters of a string in
   * Java?</a>
   */
  protected void writeString(@NonNull String value) {
    int length = value.length();
    if (length > SSO_SMALL_STRING_MAX_LENGTH) {
      if (stringWriteBuffer == null || stringWriteBuffer.length < length) {
        stringWriteBuffer = new char[length];
      }
      value.getChars(0, length, stringWriteBuffer, 0);
    }

    // region one byte string, commonly path
    writeTag(SerializationTag.ONE_BYTE_STRING);
    int headerBytes = writer.putVarint(length) + 1;
    int i = 0;
    // Designed to take advantage of
    // https://wiki.openjdk.java.net/display/HotSpot/RangeCheckElimination
    if (length > SSO_SMALL_STRING_MAX_LENGTH) {
      for (char c; i < length && (c = stringWriteBuffer[i]) < 0x80; i++) {
        writer.putByte((byte) c);
      }
    } else {
      for (char c; i < length && (c = value.charAt(i)) < 0x80; i++) {
        writer.putByte((byte) c);
      }
    }
    if (i == length) {
      return;
    }
    writer.length(-headerBytes - i); // revert buffer changes
    // endregion

    // region two byte string, universal path
    writeTag(SerializationTag.TWO_BYTE_STRING);
    writer.putVarint(length * 2);
    if (length > SSO_SMALL_STRING_MAX_LENGTH) {
      for (i = 0; i < length; i++) {
        char c = stringWriteBuffer[i];
        writer.putChar(c);
      }
    } else {
      for (i = 0; i < length; i++) {
        char c = value.charAt(i);
        writer.putChar(c);
      }
    }
    // endregion
  }

  protected void writeBigIntContents(@NonNull BigInteger bigInteger) {
    boolean negative = bigInteger.signum() == -1;
    if (negative) {
      bigInteger = bigInteger.negate();
    }
    int bitLength = bigInteger.bitLength();
    int digits = (bitLength + 63) / 64;
    int bytes = digits * 8;
    int bitfield = bytes;
    bitfield <<= 1;
    if (negative) {
      bitfield++;
    }
    writer.putVarint(bitfield);
    for (int i = 0; i < bytes; i++) {
      byte b = 0;
      for (int bit = 8 * (i + 1) - 1; bit >= 8 * i; bit--) {
        b <<= 1;
        if (bigInteger.testBit(bit)) {
          b++;
        }
      }
      writer.putByte(b);
    }
  }

  protected void assignId(Object object) {
    objectMap.put(object, nextId++);
  }
}
