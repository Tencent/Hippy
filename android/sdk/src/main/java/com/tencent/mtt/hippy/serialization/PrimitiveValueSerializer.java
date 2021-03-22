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

import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.memory.buffer.Allocator;
import com.tencent.mtt.hippy.serialization.memory.buffer.SimpleAllocator;
import com.tencent.mtt.hippy.serialization.utils.IntegerPolyfill;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.IdentityHashMap;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
public abstract class PrimitiveValueSerializer extends SharedSerialization {
  /** This serializer should not be used once the buffer is released */
  private boolean isReleased = false;
  /** Allocator used for Buffer. */
  private final Allocator<ByteBuffer> allocator;
  /** Buffer used for serialization. */
  protected ByteBuffer buffer;
  /** ID of the next serialized object. **/
  private int nextId;
  /** Maps a serialized object to its ID. */
  private final Map<Object, Integer> objectMap = new IdentityHashMap<>();
  /** Unsigned int max value. */
  private static final long MAX_UINT32_VALUE = 4294967295L;

  protected PrimitiveValueSerializer(Allocator<ByteBuffer> allocator) {
    super();

    if (allocator == null) {
      allocator = new SimpleAllocator();
    }
    this.allocator = allocator;

    buffer = this.allocator.allocate(1024);
  }

  protected void ensureFreeSpace(int spaceNeeded) {
    int capacity = buffer.capacity();
    int capacityNeeded = buffer.position() + spaceNeeded;
    if (capacityNeeded > capacity) {
      buffer = this.allocator.expand(buffer, capacityNeeded);
    }
  }

  protected void ensureNotReleased() {
    if (isReleased) {
      throw new IllegalStateException("Already released");
    }
  }

  private void setReleased() {
    isReleased = true;
  }

  /**
   * Writes out a header, which includes the format version.
   */
  public void writeHeader() {
    ensureNotReleased();
    writeTag(SerializationTag.VERSION);
    writeVarint(LATEST_VERSION);
  }

  protected void writeTag(SerializationTag tag) {
    writeByte(tag.getTag());
  }

  protected void writeTag(ArrayBufferViewTag tag) {
    writeByte(tag.getTag());
  }

  protected void writeTag(ErrorTag tag) {
    writeByte(tag.getTag());
  }

  protected void writeByte(byte b) {
    ensureFreeSpace(1);
    buffer.put(b);
  }

  /**
   * Serializes a JavaScript delegate object into the buffer.
   * @param value JavaScript delegate object
   */
  public void writeValue(Object value) {
    ensureNotReleased();
    if (value == Boolean.TRUE) {
      writeTag(SerializationTag.TRUE);
    } else if (value == Boolean.FALSE) {
      writeTag(SerializationTag.FALSE);
    } else if (value == Hole) {
      writeTag(SerializationTag.THE_HOLE);
    } else if (value == Undefined) {
      writeTag(SerializationTag.UNDEFINED);
    } else if (value == Null) {
      writeTag(SerializationTag.NULL);
    } else if (value instanceof Integer || value instanceof Short || value instanceof Byte || value instanceof Character) {
      writeTag(SerializationTag.INT32);
      writeInt32((int) value);
    } else if (value instanceof Long) {
      long longValue = (long) value;
      if (longValue <= MAX_UINT32_VALUE) {
       writeTag(SerializationTag.UINT32);
       writeVarint(longValue);
      } else {
        writeTag(SerializationTag.DOUBLE);
        writeDouble((double) value);
      }
    } else if (value instanceof BigInteger) {
      writeTag(SerializationTag.BIG_INT);
      writeBigIntContents((BigInteger) value);
    } else if (value instanceof Number) {
      double doubleValue = ((Number) value).doubleValue();
      writeTag(SerializationTag.DOUBLE);
      writeDouble(doubleValue);
    } else if (value instanceof String) {
      writeString((String) value);
    } else {
      Integer id = objectMap.get(value);
      if (id != null) {
        writeTag(SerializationTag.OBJECT_REFERENCE);
        writeVarint(id);
      } else {
        beforeWriteObject(value);
        writeObject(value);
      }
    }
  }

  protected void beforeWriteObject(Object object) { }

  protected void writeObject(Object object) {
    assignId(object);
    if (object instanceof Date) {
      writeTag(SerializationTag.DATE);
      writeDate((Date) object);
    } else {
      writeCustomObjectValue(object);
    }
  }

  protected abstract void writeCustomObjectValue(Object object);

  protected void writeInt32(int value) {
    int zigzag = (value << 1) ^ (value >> 31);
    writeVarint(IntegerPolyfill.toUnsignedLong(zigzag));
  }

  /**
   * Write {@code UInt32} data to the buffer.
   *
   * @param value data
   */
  public void writeUInt32(long value) {
    writeVarint(value);
  }

  /**
   * Write {@code UInt64} data to the buffer.
   *
   * @param value data
   */
  public void writeUInt64(long value) {
    writeVarint(value);
  }

  /**
   * Writes an unsigned integer as a base-128 varint.
   * The number is written, 7 bits at a time, from the least significant to the
   * most significant 7 bits. Each byte, except the last, has the MSB set.
   * @see <a href="https://developers.google.com/protocol-buffers/docs/encoding">protocol buffers encoding</a>
   *
   * @param value data
   */
  protected void writeVarint(long value) {
    ensureNotReleased();
    long rest = value;
    byte[] bytes = new byte[10];
    int idx = 0;
    do {
      byte b = (byte) rest;
      b |= 0x80;
      bytes[idx] = b;
      idx++;
      rest >>>= 7;
    } while (rest != 0);
    bytes[idx - 1] &= 0x7f;
    writeBytes(bytes, idx);
  }

  protected void writeBytes(byte[] bytes, int length) {
    ensureFreeSpace(length);
    buffer.put(bytes, 0, length);
  }

  /**
   * Write raw bytes to the buffer.
   *
   * @param bytes source {@link ByteBuffer}
   */
  public void writeRawBytes(ByteBuffer bytes) {
    ensureNotReleased();
    ensureFreeSpace(bytes.remaining());
    buffer.put(bytes);
  }

  /**
   * Write raw {@code byte[]} to the buffer.
   *
   * @param bytes source
   */
  public void writeRawBytes(byte[] bytes) {
    ensureNotReleased();
    ensureFreeSpace(bytes.length);
    buffer.put(bytes);
  }

  /**
   * Write {@code double} data to the buffer.
   *
   * @param value data
   */
  public void writeDouble(double value) {
    ensureNotReleased();
    ensureFreeSpace(8);
    buffer.putDouble(value);
  }

  protected void writeString(String string) {
    try {
      byte[] bytes;
      SerializationTag tag;
      String encoding;
      if (isOneByteString(string)) {
        tag = SerializationTag.ONE_BYTE_STRING;
        encoding = "ISO-8859-1";
      } else {
        tag = SerializationTag.TWO_BYTE_STRING;
        encoding = NATIVE_UTF16_ENCODING;
      }
      writeTag(tag);
      bytes = string.getBytes(encoding);
      writeVarint(bytes.length);
      writeBytes(bytes, bytes.length);
    } catch (UnsupportedEncodingException e) {
      throw new UnreachableCodeException();
    }
  }

  protected static boolean isOneByteString(String string) {
    for (char c : string.toCharArray()) {
      if (c >= 256) {
        return false;
      }
    }
    return true;
  }

  protected void writeBigIntContents(BigInteger bigInteger) {
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
    writeVarint(bitfield);
    for (int i = 0; i < bytes; i++) {
      byte b = 0;
      for (int bit = 8 * (i + 1) - 1; bit >= 8 * i; bit--) {
        b <<= 1;
        if (bigInteger.testBit(bit)) {
          b++;
        }
      }
      writeByte(b);
    }
  }

  protected void writeDate(Date date) {
    writeDouble(date.getTime());
  }

  /**
   * Returns the serialized data (allocated using the {@link Allocator}).
   * This serializer should not be used once the buffer is released.
   * Ownership of the buffer is transferred to the caller.
   *
   * @return Serialized data
   */
  public ByteBuffer release() {
    ensureNotReleased();
    setReleased();
    buffer.flip();
    allocator.release(buffer);
    return buffer;
  }

  protected void assignId(Object object) {
    objectMap.put(object, nextId++);
  }
}
