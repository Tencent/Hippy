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
package com.tencent.mtt.hippy.serialization.compatible;

import com.tencent.mtt.hippy.common.ConstantValue;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.exception.UnexpectedException;
import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.ErrorTag;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.StringLocation;
import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.StringTable;

import java.math.BigInteger;

/**
 * Compatible with {@code com.tencent.mtt.hippy.common.HippyMap}
 */
@SuppressWarnings({"unused", "deprecation"})
public class Deserializer extends PrimitiveValueDeserializer {

  /**
   * Version 13 compatibility mode
   */
  private boolean version13BrokenDataMode = false;

  public Deserializer(BinaryReader reader) {
    this(reader, null);
  }

  public Deserializer(BinaryReader reader, StringTable stringTable) {
    super(reader, stringTable);
  }

  @Override
  protected int getSupportedVersion() {
    return 15;
  }

  @Override
  protected Object getUndefined() {
    return ConstantValue.Undefined;
  }

  @Override
  protected Object getNull() {
    return ConstantValue.Null;
  }

  @Override
  protected Object getHole() {
    return ConstantValue.Hole;
  }

  @Override
  @SuppressWarnings("fallthrough")
  protected Object readValue(byte tag, StringLocation location, Object relatedKey) {
    Object object = super.readValue(tag, location, relatedKey);
    if (object != Nothing) {
      return object;
    }

    switch (tag) {
      case SerializationTag.TRUE_OBJECT:
        return readJSBoolean(true);
      case SerializationTag.FALSE_OBJECT:
        return readJSBoolean(false);
      case SerializationTag.NUMBER_OBJECT:
        return readJSNumber();
      case SerializationTag.BIG_INT_OBJECT:
        return readJSBigInt();
      case SerializationTag.STRING_OBJECT:
        return readJSString(location, relatedKey);
      case SerializationTag.REGEXP:
        return readJSRegExp();
      case SerializationTag.ARRAY_BUFFER:
        return readJSArrayBuffer();
      case SerializationTag.ARRAY_BUFFER_TRANSFER:
        return readTransferredJSArrayBuffer();
      case SerializationTag.SHARED_ARRAY_BUFFER:
        return readSharedArrayBuffer();
      case SerializationTag.BEGIN_JS_OBJECT:
        return readJSObject();
      case SerializationTag.BEGIN_JS_MAP:
        return readJSMap();
      case SerializationTag.BEGIN_JS_SET:
        return readJSSet();
      case SerializationTag.BEGIN_DENSE_JS_ARRAY:
        return readDenseArray();
      case SerializationTag.BEGIN_SPARSE_JS_ARRAY:
        return readSparseArray();
      case SerializationTag.WASM_MODULE_TRANSFER:
        return readTransferredWasmModule();
      case SerializationTag.HOST_OBJECT:
        return readHostObject();
      case SerializationTag.WASM_MEMORY_TRANSFER:
        return readTransferredWasmMemory();
      case SerializationTag.ERROR:
        return readJSError();
      case SerializationTag.SHARED_OBJECT: {
        if (getWireFormatVersion() >= 15) {
          return readSharedObject();
        }
        // If the data doesn't support shared values because it is from an older
        // version, treat the tag as unknown.
        // [[fallthrough]]
      }
      default: {
        //  Before there was an explicit tag for host objects, all unknown tags
        //  were delegated to the host.
        if (getWireFormatVersion() < 13) {
          reader.position(-1);
          return readHostObject();
        }

        // Unsupported Tag treated as Undefined
        return Undefined;
      }
    }
  }

  /**
   * Deserializes a JavaScript delegate object from the buffer.
   *
   * @return JavaScript delegate object
   */
  @Override
  public Object readValue() {
    /*
     *  The `V8` engine has a bug which produced invalid version 13 data (see https://crbug.com/1284506).
     *
     *  This compatibility mode tries to first read the data normally,
     *  and if it fails, and the version is 13, tries to read the broken format.
     */
    int originalPosition = reader.position();
    try {
      return super.readValue();
    } catch (Exception e) {
      if (getWireFormatVersion() == 13) {
        reader.position(originalPosition);
        version13BrokenDataMode = true;
        return super.readValue();
      } else {
        throw e;
      }
    }
  }

  private ErrorTag readErrorTag() {
    return ErrorTag.fromTag((byte) reader.getVarint());
  }

  private Boolean readJSBoolean(boolean value) {
    return assignId(value);
  }

  private Number readJSNumber() {
    return assignId(reader.getDouble());
  }

  private BigInteger readJSBigInt() {
    return assignId(readBigInt());
  }

  private String readJSString(StringLocation location, Object relatedKey) {
    return assignId(readString(location, relatedKey));
  }

  private Object readJSArrayBuffer() {
    int byteLength = (int) reader.getVarint();
    if (byteLength < 0) {
      throw new DataCloneOutOfRangeException(byteLength);
    }
    reader.position(reader.position() + byteLength);

    assignId(Undefined);
    if (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) {
      readJSArrayBufferView();
    }

    return null;
  }

  private Object readJSRegExp() {
    readString(StringLocation.VOID, null);
    reader.getVarint();
    return assignId(Undefined);
  }

  private HippyMap readJSObject() {
    HippyMap object = new HippyMap();
    assignId(object);
    int read = readJSProperties(object, SerializationTag.END_JS_OBJECT);
    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of properties");
    }
    return object;
  }

  private int readJSProperties(HippyMap object, byte endTag) {
    final StringLocation keyLocation, valueLocation;
    if (endTag == SerializationTag.END_DENSE_JS_ARRAY) {
      keyLocation = StringLocation.DENSE_ARRAY_KEY;
      valueLocation = StringLocation.DENSE_ARRAY_ITEM;
    } else if (endTag == SerializationTag.END_JS_OBJECT) {
      keyLocation = StringLocation.OBJECT_KEY;
      valueLocation = StringLocation.OBJECT_VALUE;
    } else {
      throw new UnreachableCodeException();
    }

    byte tag;
    int count = 0;
    while ((tag = readTag()) != endTag) {
      count++;
      Object key = readValue(tag, keyLocation, null);
      Object value = readValue(valueLocation, key);

      if (object != null && value != Undefined) {
        if (key instanceof Number) {
          object.pushObject(String.valueOf(key), value);
        } else if (key instanceof String) {
          if (key == "null") {
            object.pushObject(null, value);
          } else {
            object.pushObject((String) key, value);
          }
        } else {
          throw new AssertionError("Object key is not of String(null) nor Number type");
        }
      }
    }
    return count;
  }

  private HippyMap readJSMap() {
    HippyMap object = new HippyMap();
    assignId(object);
    byte tag;
    int read = 0;
    while ((tag = readTag()) != SerializationTag.END_JS_MAP) {
      read++;
      Object key = readValue(tag, StringLocation.MAP_KEY, null);
      key = key.toString();
      Object value = readValue(StringLocation.MAP_VALUE, key);
      if (value != Undefined) {
        if (key == "null") {
          object.pushObject(null, value);
        } else {
          object.pushObject((String) key, value);
        }
      }
    }
    int expected = (int) reader.getVarint();
    if (2 * read != expected) {
      throw new UnexpectedException("unexpected number of entries");
    }
    return object;
  }

  private HippyArray readJSSet() {
    HippyArray array = new HippyArray();
    assignId(array);
    byte tag;
    int read = 0;
    while ((tag = readTag()) != SerializationTag.END_JS_SET) {
      read++;
      Object value = readValue(tag, StringLocation.SET_ITEM, null);
      array.pushObject(value);
    }
    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of values");
    }
    return array;
  }

  private HippyArray readDenseArray() {
    int length = (int) reader.getVarint();
    if (length < 0) {
      throw new DataCloneOutOfRangeException(length);
    }
    HippyArray array = new HippyArray();
    assignId(array);
    for (int i = 0; i < length; i++) {
      byte tag = readTag();
      if (tag != SerializationTag.THE_HOLE) {
        array.pushObject(readValue(tag, StringLocation.DENSE_ARRAY_ITEM, i));
      }
    }

    int read = readJSProperties(null, SerializationTag.END_DENSE_JS_ARRAY);
    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of properties");
    }
    int length2 = (int) reader.getVarint();
    if (length != length2) {
      throw new AssertionError("length ambiguity");
    }
    return array;
  }

  /**
   * Reads Spare Array from buffer.
   *
   * <h2>Note</h2>
   * Sparse arrays will be serialized as an object-like manner. Normally, it should be representable
   * as {@link HippyMap}, but in order to be compatible with the previous serialization implement,
   * we use {@link HippyArray} to express sparse arrays. <br/> When a hole is encountered, {@link
   * ConstantValue#Null} is used to fill it.
   *
   * @return array
   */
  private HippyArray readSparseArray() {
    long length = reader.getVarint();
    HippyArray array = new HippyArray();
    assignId(array);

    byte tag;
    int read = 0;
    while ((tag = readTag()) != SerializationTag.END_SPARSE_JS_ARRAY) {
      read++;
      Object key = readValue(tag, StringLocation.SPARSE_ARRAY_KEY, null);
      Object value = readValue(StringLocation.SPARSE_ARRAY_ITEM, key);

      int index = -1;
      if (key instanceof Number) {
        index = ((Number) key).intValue();
      } else if (key instanceof String) {
        try {
          index = Integer.parseInt((String) key);
        } catch (NumberFormatException ignored) {
          // ignore not parsable string
        }
      }

      if (index >= 0) {
        int spaceNeeded = (index + 1) - array.size();
        if (spaceNeeded
            == 1) { // Fast path, item are ordered in general ECMAScript(VM) implementation
          array.pushObject(value);
        } else {  // Slow path, universal
          for (int i = 0; i < spaceNeeded; i++) {
            array.pushNull();
          }
          array.setObject(index, value);
        }
      }
    }

    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of properties");
    }
    long length2 = reader.getVarint();
    if (length != length2) {
      throw new AssertionError("length ambiguity");
    }
    return array;
  }

  private void readJSArrayBufferView() {
    byte arrayBufferViewTag = readTag();
    if (arrayBufferViewTag != SerializationTag.ARRAY_BUFFER_VIEW) {
      throw new AssertionError("ArrayBufferViewTag: " + arrayBufferViewTag);
    }
    reader.getVarint();
    reader.getVarint();
    if (getWireFormatVersion() >= 14 || version13BrokenDataMode) {
      reader.getVarint();
    }
    reader.getVarint();

    assignId(Undefined);
  }

  private HippyMap readJSError() {
    String message = null;
    String stack = null;
    String errorType = null;
    boolean done = false;
    while (!done) {
      ErrorTag tag = readErrorTag();
      if (tag == null) {
        break;
      }
      switch (tag) {
        case EVAL_ERROR:
          errorType = "EvalError";
          break;
        case RANGE_ERROR:
          errorType = "RangeError";
          break;
        case REFERENCE_ERROR:
          errorType = "ReferenceError";
          break;
        case SYNTAX_ERROR:
          errorType = "SyntaxError";
          break;
        case TYPE_ERROR:
          errorType = "TypeError";
          break;
        case URI_ERROR:
          errorType = "URIError";
          break;
        case MESSAGE:
          message = readString(StringLocation.ERROR_MESSAGE, null);
          break;
        case STACK:
          stack = readString(StringLocation.ERROR_STACK, null);
          break;
        default:
          if (!(tag == ErrorTag.END)) {
            throw new AssertionError("ErrorTag: " + tag);
          }
          done = true;
          break;
      }
    }

    HippyMap error = new HippyMap();
    error.pushString("message", message);
    error.pushString("stack", stack);
    error.pushString("type", errorType);
    assignId(error);
    return error;
  }

  private Object readHostObject() {
    return assignId(Undefined);
  }

  private Object readSharedObject() {
    reader.getVarint();
    return assignId(Undefined);
  }

  private Object readTransferredJSArrayBuffer() {
    reader.getVarint();
    assignId(Undefined);
    if (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) {
      readJSArrayBufferView();
    }
    return null;
  }

  private Object readSharedArrayBuffer() {
    reader.getVarint();
    assignId(Undefined);
    if (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) {
      readJSArrayBufferView();
    }
    return null;
  }

  private Object readTransferredWasmModule() {
    reader.getVarint();
    assignId(Undefined);
    return null;
  }

  private Object readTransferredWasmMemory() {
    reader.getVarint();
    readSharedArrayBuffer();
    assignId(Undefined);
    return null;
  }
}
