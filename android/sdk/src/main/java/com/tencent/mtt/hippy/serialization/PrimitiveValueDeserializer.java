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
import com.tencent.mtt.hippy.serialization.memory.string.DirectStringTable;
import com.tencent.mtt.hippy.serialization.memory.string.StringTable;

import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueDeserializer}.
 */
public abstract class PrimitiveValueDeserializer extends SharedSerialization {
  /** StingTable used for byte[] to String */
  private final StringTable stringTable;
  /** Buffer used for serialization. */
  protected final ByteBuffer buffer;
  /** Version of the data format used during serialization. */
  private int version;
  /** ID of the next deserialized object. */
  private int nextId;
  /** Maps ID of a deserialized object to the object itself. */
  private final Map<Integer, Object> objectMap = new HashMap<>();

  protected PrimitiveValueDeserializer(ByteBuffer buffer, StringTable stringTable) {
    super();

    if (buffer == null) {
      throw new NullPointerException();
    }
    this.buffer = buffer.order(ByteOrder.nativeOrder());

    if (stringTable == null) {
      stringTable = new DirectStringTable();
    }
    this.stringTable = stringTable;
  }

  /**
   * Reads and validates a header (including the format version).
   * Throw an {@link UnsupportedOperationException} exception on unsupported wire format.
   */
  public void readHeader() {
    if (readTag() == SerializationTag.VERSION) {
      version = (int) readVarint();
      if (version > LATEST_VERSION) {
        throw new UnsupportedOperationException("Unable to deserialize cloned data due to invalid or unsupported version.");
      }
    }
  }

  /**
   * Deserializes a JavaScript delegate object from the buffer.
   * @return JavaScript delegate object
   */
  public Object readValue() {
    return readValue(StringLocation.TOP_LEVEL, null);
  }

  protected Object readValue(StringLocation location, Object relatedKey) {
    SerializationTag tag = readTag();
    return readValue(tag, location, relatedKey);
  }

  protected Object readValue(SerializationTag tag, StringLocation location, Object relatedKey) {
    switch (tag) {
      case TRUE:
        return Boolean.TRUE;
      case FALSE:
        return Boolean.FALSE;
      case THE_HOLE:
        return Hole;
      case UNDEFINED:
        return Undefined;
      case NULL:
        return Null;
      case INT32:
        return readZigZag();
      case UINT32:
        return readVarint();
      case DOUBLE:
        return readDoubleWithRectification();
      case BIG_INT:
        return readBigInt();
      case ONE_BYTE_STRING:
        return readOneByteString(location, relatedKey);
      case TWO_BYTE_STRING:
        return readTwoByteString(location, relatedKey);
      case UTF8_STRING:
        return readUTF8String(location, relatedKey);
      case DATE:
        return readDate();
      case TRUE_OBJECT:
        return readJSBoolean(true);
      case FALSE_OBJECT:
        return readJSBoolean(false);
      case NUMBER_OBJECT:
        return readJSNumber();
      case BIG_INT_OBJECT:
        return readJSBigInt();
      case STRING_OBJECT:
        return readJSString(location, relatedKey);
      case REGEXP:
        return readJSRegExp();
      case ARRAY_BUFFER:
        return readJSArrayBuffer();
      case ARRAY_BUFFER_TRANSFER:
        return readTransferredJSArrayBuffer();
      case SHARED_ARRAY_BUFFER:
        return readSharedArrayBuffer();
      case BEGIN_JS_OBJECT:
        return readJSObject();
      case BEGIN_JS_MAP:
        return readJSMap();
      case BEGIN_JS_SET:
        return readJSSet();
      case BEGIN_DENSE_JS_ARRAY:
        return readDenseArray();
      case BEGIN_SPARSE_JS_ARRAY:
        return readSparseArray();
      case OBJECT_REFERENCE:
        return readObjectReference();
      case WASM_MODULE_TRANSFER:
        return readTransferredWasmModule();
      case HOST_OBJECT:
        return readHostObject();
      case WASM_MEMORY_TRANSFER:
        return readTransferredWasmMemory();
      case ERROR:
        return readJSError();
      default: {
        //  Before there was an explicit tag for host objects, all unknown tags
        //  were delegated to the host.
        if (version < 13) {
          buffer.position(buffer.position() - 1);
          return readHostObject();
        }

        // Unsupported Tag treated as Undefined
        return Undefined;
      }
    }
  }

  protected SerializationTag readTag() {
    SerializationTag tag;
    do {
      tag = SerializationTag.fromTag(buffer.get());
    } while (tag == SerializationTag.PADDING);
    return tag;
  }

  protected SerializationTag peekTag() {
    return buffer.hasRemaining() ? SerializationTag.fromTag(buffer.get(buffer.position())) : null;
  }

  protected ArrayBufferViewTag readArrayBufferViewTag() {
    return ArrayBufferViewTag.fromTag(buffer.get());
  }

  protected ErrorTag readErrorTag() {
    return ErrorTag.fromTag(buffer.get());
  }

  protected int readZigZag() {
    long zigzag = readVarint();
    long value = (zigzag >> 1) ^ -(zigzag & 1);
    return (int) value;
  }

  /**
   * Reads {@code UInt32} data from the buffer.
   *
   * @return data
   */
  public long readUInt32() {
    return readVarint();
  }

  /**
   * Reads {@code UInt64} data from the buffer.
   *
   * @return data
   */
  public long readUInt64() {
    return readVarint();
  }

  /**
   * Reads an unsigned integer as a base-128 varint.
   * The number is written, 7 bits at a time, from the least significant to the
   * most significant 7 bits. Each byte, except the last, has the MSB set.
   * @see <a href="https://developers.google.com/protocol-buffers/docs/encoding">protocol buffers encoding</a>
   *
   * @return data
   */
  protected long readVarint() {
    long value = 0;
    int shift = 0;
    byte b;
    do {
      b = buffer.get();
      value |= (b & 0x7fL) << shift;
      shift += 7;
    } while ((b & 0x80) != 0);
    return value;
  }

  /**
   * Reads {@code double} or {@code int} data from the buffer.
   * <p>
   * If {@code double} can be representable as {@code long},
   * it will be automatically converted to {@code long} type.
   * <p/>
   * <h2>Background</h2>
   * Since the ECMAScript standard does not define the storage (expression) of the <a href="https://262.ecma-international.org/#sec-ecmascript-language-types-number-type">number</a> type in the VM,
   * different implementations may have different storage implementations of the same value.
   * <br/>
   * e.g. <br/>
   * v8 store js number as Smi or Heap Number(out of Smi payload or it's double value),
   * if number store in heap, v8 regardless of the original type, treated as {@code double}.
   *
   * @return Number data
   */
  private Number readDoubleWithRectification() {
    double doubleValue = readDouble();
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
    return buffer.getDouble();
  }

  /**
   * Direct reads raw bytes from the buffer without copy.
   *
   * @param length read length
   * @return {@link ByteBuffer}
   */
  public ByteBuffer readRawBytesDirect(int length) {
    ByteBuffer sliced = buffer.slice();
    sliced.limit(length);
    return sliced;
  }

  /**
   * Reads raw {@code byte[]} from the buffer.
   *
   * @param length read length
   * @return byte[]
   */
  public byte[] readRawBytes(int length) {
    byte[] bytes = new byte[length];
    buffer.get(bytes);
    return bytes;
  }

  protected String readString(StringLocation location, Object relatedKey) {
    SerializationTag tag = readTag();
    switch (tag) {
      case ONE_BYTE_STRING:
        return readOneByteString(location, relatedKey);
      case TWO_BYTE_STRING:
        return readTwoByteString(location, relatedKey);
      case UTF8_STRING:
        return readUTF8String(location, relatedKey);
      default:
        throw new UnreachableCodeException();
    }
  }

  protected BigInteger readBigInt() {
    int bitField = (int) readVarint();
    boolean negative = (bitField & 1) != 0;
    bitField >>= 1;
    BigInteger bigInteger = BigInteger.ZERO;
    for (int i = 0; i < bitField; i++) {
      byte b = buffer.get();
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
    int charCount = (int) readVarint();
    if (charCount < 0) {
      throw new DataCloneOutOfRangeException(charCount);
    }
    char[] chars = new char[charCount];
    for (int i = 0; i < charCount; i++) {
      byte b = buffer.get();
      chars[i] = (char) (b & 0xff);
    }
    return stringTable.lookup(chars, location, relatedKey);
  }

  protected String readTwoByteString(StringLocation location, Object relatedKey) {
    return readString(NATIVE_UTF16_ENCODING, location, relatedKey);
  }

  protected String readUTF8String(StringLocation location, Object relatedKey) {
    return readString("UTF-8", location, relatedKey);
  }

  protected String readString(String encoding, StringLocation location, Object relatedKey) {
    int byteCount = (int) readVarint();
    if (byteCount < 0) {
      throw new DataCloneOutOfRangeException(byteCount);
    }
    byte[] bytes = new byte[byteCount];
    buffer.get(bytes);
    try {
      return stringTable.lookup(bytes, encoding, location, relatedKey);
    } catch (UnsupportedEncodingException e) {
      throw new UnreachableCodeException(e);
    }
  }

  protected Date readDate() {
    double millis = readDouble();
    return assignId(new Date((long) millis));
  }

  protected Object readObjectReference() {
    int id = (int) readVarint();
    if (id < 0) {
      throw new DataCloneOutOfRangeException(id);
    }
    Object object = objectMap.get(id);
    if (object == null) {
      throw new AssertionError("invalid object reference");
    }
    return object;
  }

  protected abstract Object readJSBoolean(boolean value);
  protected abstract Object readJSNumber();
  protected abstract Object readJSBigInt();
  protected abstract Object readJSString(StringLocation location, Object relatedKey);
  protected abstract Object readJSArrayBuffer();
  protected abstract Object readJSRegExp();
  protected abstract Object readJSObject();
  protected abstract Object readJSMap();
  protected abstract Object readJSSet();
  protected abstract Object readDenseArray();
  protected abstract Object readSparseArray();
  protected abstract Object readJSError();
  protected abstract Object readHostObject();
  protected abstract Object readTransferredJSArrayBuffer();
  protected abstract Object readSharedArrayBuffer();
  protected abstract Object readTransferredWasmModule();
  protected abstract Object readTransferredWasmMemory();

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
