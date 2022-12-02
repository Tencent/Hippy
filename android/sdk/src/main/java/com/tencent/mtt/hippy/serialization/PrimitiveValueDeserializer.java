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

import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.DirectStringTable;
import com.tencent.mtt.hippy.serialization.string.StringTable;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueDeserializer}.
 */
@SuppressWarnings({"unused"})
public abstract class PrimitiveValueDeserializer extends SharedSerialization {

  /**
   * StingTable used for byte[] to String
   */
  private final StringTable stringTable;
  /**
   * Reader used for read buffer.
   */
  protected BinaryReader reader;
  /**
   * Version of the data format used during serialization.
   */
  private int version;
  /**
   * ID of the next deserialized object.
   */
  private int nextId;
  /**
   * Maps ID of a deserialized object to the object itself.
   */
  private final Map<Integer, Object> objectMap = new HashMap<>();

  protected PrimitiveValueDeserializer(BinaryReader reader, StringTable stringTable) {
    super();
    this.reader = reader;

    if (stringTable == null) {
      stringTable = new DirectStringTable();
    }
    this.stringTable = stringTable;
  }

  protected abstract int getSupportedVersion();

  /**
   * Set current binary reader
   *
   * @param reader The binary reader to be set
   */
  public void setReader(BinaryReader reader) {
    this.reader = reader;
  }

  /**
   * Get current binary reader
   *
   * @return The current binary reader
   */
  public BinaryReader getReader() {
    return reader;
  }

  /**
   * Get current string table
   *
   * @return The current string table
   */
  public StringTable getStringTable() {
    return stringTable;
  }

  /**
   * Reset Deserializer, for the future using
   */
  public void reset() {
    objectMap.clear();
    nextId = 0;
  }

  /**
   * Reads and validates a header (including the format version). Throw an {@link
   * UnsupportedOperationException} exception on unsupported wire format.
   */
  public void readHeader() {
    if (readTag() == SerializationTag.VERSION) {
      version = (int) reader.getVarint();
      int supportedVersion = getSupportedVersion();
      if (supportedVersion > 0 && version > supportedVersion) {
        throw new UnsupportedOperationException(
            "Unable to deserialize cloned data due to invalid or unsupported version.");
      }
    }
  }

  /**
   * Deserializes a JavaScript delegate object from the buffer.
   *
   * @return JavaScript delegate object
   */
  public Object readValue() {
    return readValue(StringLocation.TOP_LEVEL, null);
  }

  protected Object readValue(StringLocation location, Object relatedKey) {
    byte tag = readTag();
    return readValue(tag, location, relatedKey);
  }

  protected Object readValue(byte tag, StringLocation location, Object relatedKey) {
    switch (tag) {
      case SerializationTag.TRUE:
        return Boolean.TRUE;
      case SerializationTag.FALSE:
        return Boolean.FALSE;
      case SerializationTag.THE_HOLE:
        return Hole;
      case SerializationTag.UNDEFINED:
        return Undefined;
      case SerializationTag.NULL:
        return Null;
      case SerializationTag.INT32:
        return readZigZag();
      case SerializationTag.UINT32:
        return reader.getVarint();
      case SerializationTag.DOUBLE:
        return readDoubleWithRectification();
      case SerializationTag.BIG_INT:
        return readBigInt();
      case SerializationTag.ONE_BYTE_STRING:
        return readOneByteString(location, relatedKey);
      case SerializationTag.TWO_BYTE_STRING:
        return readTwoByteString(location, relatedKey);
      case SerializationTag.UTF8_STRING:
        return readUTF8String(location, relatedKey);
      case SerializationTag.DATE:
        return readDate();
      case SerializationTag.OBJECT_REFERENCE:
        return readObjectReference();
      default:
        return Nothing;
    }
  }

  protected byte readTag() {
    byte tag;
    do {
      tag = reader.getByte();
    } while (tag == SerializationTag.PADDING);
    return tag;
  }

  protected byte peekTag() {
    if (reader.position() < reader.length()) {
      byte tag = reader.getByte();
      reader.position(-1);
      return tag;
    }
    return SerializationTag.VOID;
  }

  protected int readZigZag() {
    long zigzag = reader.getVarint();
    long value = (zigzag >> 1) ^ -(zigzag & 1);
    return (int) value;
  }

  /**
   * Reads {@code UInt32} data from the buffer.
   *
   * @return data
   */
  public long readUInt32() {
    return reader.getVarint();
  }

  /**
   * Reads {@code UInt64} data from the buffer.
   *
   * @return data
   */
  public long readUInt64() {
    return reader.getVarint();
  }

  /**
   * Reads {@code double} or {@code int} data from the buffer.
   * <p>
   * If {@code double} can be representable as {@code long}, it will be automatically converted to
   * {@code long} type.
   * <p/>
   * <h2>Background</h2>
   * Since the ECMAScript standard does not define the storage (expression) of the <a
   * href="https://262.ecma-international.org/#sec-ecmascript-language-types-number-type">number</a>
   * type in the VM, different implementations may have different storage implementations of the
   * same value. <br/> e.g. <br/> v8 store js number as Smi or Heap Number(out of Smi payload or
   * it's double value), if number store in heap, v8 regardless of the original type, treated as
   * {@code double}.
   *
   * @return Number data
   */
  private Number readDoubleWithRectification() {
    double doubleValue = reader.getDouble();
    long longValue = (long) doubleValue;
    //noinspection RedundantIfStatement
    if (longValue == doubleValue) {
      return longValue;
    }
    return doubleValue;
  }

  /**
   * Reads {@code double} data from the buffer.
   *
   * @return data
   */
  public double readDouble() {
    return reader.getDouble();
  }

  /**
   * Reads {@code byte[]} from the buffer.
   *
   * @param length read length
   * @return a wrapped {@link ByteBuffer} object
   */
  public ByteBuffer readBytes(int length) {
    return reader.getBytes(length);
  }

  protected String readString(StringLocation location, Object relatedKey) {
    byte tag = readTag();
    switch (tag) {
      case SerializationTag.ONE_BYTE_STRING:
        return readOneByteString(location, relatedKey);
      case SerializationTag.TWO_BYTE_STRING:
        return readTwoByteString(location, relatedKey);
      case SerializationTag.UTF8_STRING:
        return readUTF8String(location, relatedKey);
      default:
        throw new UnreachableCodeException();
    }
  }

  protected BigInteger readBigInt() {
    int bitField = (int) reader.getVarint();
    boolean negative = (bitField & 1) != 0;
    bitField >>= 1;
    BigInteger bigInteger = BigInteger.ZERO;
    for (int i = 0; i < bitField; i++) {
      byte b = reader.getByte();
      for (int bit = 8 * i; bit < 8 * (i + 1); bit++) {
        if ((b & 1) != 0) {
          bigInteger = bigInteger.setBit(bit);
        }
        b >>>= 1;
      }
    }
    if (negative) {
      bigInteger = bigInteger.negate();
    }
    return bigInteger;
  }

  protected String readOneByteString(StringLocation location, Object relatedKey) {
    return readString("ISO-8859-1", location, relatedKey);
  }

  protected String readTwoByteString(StringLocation location, Object relatedKey) {
    // Android is always little-endian
    return readString("UTF-16LE", location, relatedKey);
  }

  protected String readUTF8String(StringLocation location, Object relatedKey) {
    return readString("UTF-8", location, relatedKey);
  }

  protected String readString(String encoding, StringLocation location, Object relatedKey) {
    int byteCount = (int) reader.getVarint();
    if (byteCount < 0) {
      throw new DataCloneOutOfRangeException(byteCount);
    }

    ByteBuffer byteBuffer = reader.getBytes(byteCount);
    try {
      return stringTable.lookup(byteBuffer, encoding, location, relatedKey);
    } catch (UnsupportedEncodingException e) {
      throw new UnreachableCodeException(e);
    }
  }

  protected Date readDate() {
    double millis = reader.getDouble();
    return assignId(new Date((long) millis));
  }

  protected Object readObjectReference() {
    int id = (int) reader.getVarint();
    if (id < 0) {
      throw new DataCloneOutOfRangeException(id);
    }
    Object object = objectMap.get(id);
    if (object == null) {
      throw new AssertionError(String.format("invalid object reference(@%d)", id));
    }
    return object;
  }

  protected <T> T assignId(T object) {
    objectMap.put(nextId++, object);
    return object;
  }

  /**
   * Reads the underlying wire format version.
   * Likely mostly to be useful to legacy code reading old wire format versions.
   *
   * @return wire format version
   */
  public int getWireFormatVersion() {
    return version;
  }
}
