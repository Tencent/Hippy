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
package com.tencent.mtt.hippy.serialization.recommend;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfValueException;
import com.tencent.mtt.hippy.exception.UnexpectedException;
import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.runtime.builtins.JSRegExp;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmMemory;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.exception.DataCloneDeserializationException;
import com.tencent.mtt.hippy.serialization.ErrorTag;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.runtime.builtins.JSArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSDataView;
import com.tencent.mtt.hippy.runtime.builtins.JSError;
import com.tencent.mtt.hippy.runtime.builtins.JSMap;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.JSOddball;
import com.tencent.mtt.hippy.runtime.builtins.JSSet;
import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBigintObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBooleanObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSNumberObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSStringObject;
import com.tencent.mtt.hippy.serialization.StringLocation;
import com.tencent.mtt.hippy.serialization.exception.DataCloneException;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.StringTable;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueDeserializer}.
 */
@SuppressWarnings("unused")
public class Deserializer extends PrimitiveValueDeserializer {

  public interface Delegate {

    /**
     * Implement this method to read some kind of host object, if possible. If not, a {@link
     * DataCloneException} exception should be thrown.
     *
     * @param deserializer current deserializer
     * @return host object
     */
    Object readHostObject(Deserializer deserializer);

    /**
     * Get a {@link JSSharedArrayBuffer} given a clone_id previously provided by
     * Serializer.Delegate#getSharedArrayBufferId
     *
     * @param deserializer current deserializer
     * @param clone_id     clone id
     * @return JSSharedArrayBuffer
     */
    JSSharedArrayBuffer getSharedArrayBufferFromId(Deserializer deserializer, int clone_id);

    /**
     * Get a {@link WasmModule} given a transfer_id previously provided by
     * erializer.Delegate#getWasmModuleTransferId
     *
     * @param deserializer current deserializer
     * @param transfer_id  transfer id
     * @return WebAssembly Module
     */
    WasmModule getWasmModuleFromId(Deserializer deserializer, int transfer_id);
  }

  /**
   * Implement for Delegate interface
   */
  private final Delegate delegate;
  /**
   * Maps transfer ID to the transferred {@link JSArrayBuffer}s.
   */
  private Map<Integer, Object> arrayBufferTransferMap;

  public Deserializer(BinaryReader reader) {
    this(reader, null, null);
  }

  public Deserializer(BinaryReader reader, StringTable stringTable) {
    this(reader, stringTable, null);
  }

  public Deserializer(BinaryReader reader, Delegate delegate) {
    this(reader, null, delegate);
  }

  public Deserializer(BinaryReader reader, StringTable stringTable, Delegate delegate) {
    super(reader, stringTable);
    this.delegate = delegate;
  }

  @Override
  protected Object getHole() {
    return JSOddball.Hole;
  }

  @Override
  protected Object getUndefined() {
    return JSOddball.Undefined;
  }

  @Override
  protected Object getNull() {
    return JSOddball.Null;
  }

  @Override
  protected Object readJSBoolean(boolean value) {
    return assignId(value ? JSBooleanObject.True : JSBooleanObject.False);
  }

  @Override
  protected JSNumberObject readJSNumber() {
    double value = reader.getDouble();
    return assignId(new JSNumberObject(value));
  }

  @Override
  protected JSBigintObject readJSBigInt() {
    BigInteger value = readBigInt();
    return assignId(new JSBigintObject(value));
  }

  @Override
  protected JSStringObject readJSString(StringLocation location, Object relatedKey) {
    String value = readString(location, relatedKey);
    return assignId(new JSStringObject(value));
  }

  @Override
  protected Object readJSArrayBuffer() {
    int byteLength = (int) reader.getVarint();
    if (byteLength < 0) {
      throw new DataCloneOutOfRangeException(byteLength);
    }
    JSArrayBuffer arrayBufferObject = JSArrayBuffer.allocate(byteLength);
    ByteBuffer arrayBuffer = arrayBufferObject.getBuffer();
    arrayBuffer.put(reader.getBytes(byteLength));
    assignId(arrayBufferObject);
    return (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) ? readJSArrayBufferView(
        arrayBufferObject) : arrayBuffer;
  }

  @Override
  protected JSRegExp readJSRegExp() {
    String pattern = readString(StringLocation.REGEXP, null);
    int flags = (int) reader.getVarint();
    if (flags < 0) {
      throw new DataCloneOutOfValueException(flags);
    }
    return assignId(new JSRegExp(pattern, flags));
  }

  @Override
  protected JSObject readJSObject() {
    JSObject object = new JSObject();
    assignId(object);
    int read = readJSProperties(object, SerializationTag.END_JS_OBJECT);
    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of properties");
    }
    return object;
  }

  private int readJSProperties(@NonNull JSObject object, SerializationTag endTag) {
    final StringLocation keyLocation, valueLocation;
    switch (endTag) {
      case END_DENSE_JS_ARRAY: {
        keyLocation = StringLocation.DENSE_ARRAY_KEY;
        valueLocation = StringLocation.DENSE_ARRAY_ITEM;
        break;
      }
      case END_SPARSE_JS_ARRAY: {
        keyLocation = StringLocation.SPARSE_ARRAY_KEY;
        valueLocation = StringLocation.SPARSE_ARRAY_ITEM;
        break;
      }
      case END_JS_OBJECT: {
        keyLocation = StringLocation.OBJECT_KEY;
        valueLocation = StringLocation.OBJECT_VALUE;
        break;
      }
      default: {
        throw new UnreachableCodeException();
      }
    }

    SerializationTag tag;
    int count = 0;
    while ((tag = readTag()) != endTag) {
      count++;
      Object key = readValue(tag, keyLocation, null);
      if (key instanceof Integer) {
        Object value = readValue(valueLocation, key);
        if (endTag == SerializationTag.END_SPARSE_JS_ARRAY) {
          ((JSSparseArray) object).set((int) key, value);
        } else {
          object.set(String.valueOf(key), value);
        }
      } else if (key instanceof String) {
        Object value = readValue(valueLocation, key);
        object.set((String) key, value);
      } else {
        throw new AssertionError("Object key is not of String nor Integer type");
      }
    }
    return count;
  }

  @Override
  protected JSMap readJSMap() {
    JSMap map = new JSMap();
    assignId(map);
    SerializationTag tag;
    int read = 0;
    HashMap<Object, Object> internalMap = map.getInternalMap();
    while ((tag = readTag()) != SerializationTag.END_JS_MAP) {
      read++;
      Object key = readValue(tag, StringLocation.MAP_KEY, null);
      Object value = readValue(StringLocation.MAP_VALUE, key);
      internalMap.put(key, value);
    }
    int expected = (int) reader.getVarint();
    if (2 * read != expected) {
      throw new UnexpectedException("unexpected number of entries");
    }
    return map;
  }

  @Override
  protected JSSet readJSSet() {
    JSSet set = new JSSet();
    assignId(set);
    SerializationTag tag;
    int read = 0;
    HashSet<Object> internalSet = set.getInternalSet();
    while ((tag = readTag()) != SerializationTag.END_JS_SET) {
      read++;
      Object value = readValue(tag, StringLocation.SET_ITEM, null);
      internalSet.add(value);
    }
    int expected = (int) reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of values");
    }
    return set;
  }

  @Override
  protected JSDenseArray readDenseArray() {
    int length = (int) reader.getVarint();
    if (length < 0) {
      throw new DataCloneOutOfRangeException(length);
    }
    JSDenseArray array = new JSDenseArray(length);
    assignId(array);
    for (int i = 0; i < length; i++) {
      SerializationTag tag = readTag();
      array.push(readValue(tag, StringLocation.DENSE_ARRAY_ITEM, i));
    }

    int read = readJSProperties(array, SerializationTag.END_DENSE_JS_ARRAY);
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

  @Override
  protected JSSparseArray readSparseArray() {
    long length = reader.getVarint();
    JSSparseArray array = new JSSparseArray();
    assignId(array);
    int read = readJSProperties(array, SerializationTag.END_SPARSE_JS_ARRAY);
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

  private JSDataView<JSArrayBuffer> readJSArrayBufferView(JSArrayBuffer arrayBuffer) {
    SerializationTag arrayBufferViewTag = readTag();
    if (arrayBufferViewTag != SerializationTag.ARRAY_BUFFER_VIEW) {
      throw new AssertionError("ArrayBufferViewTag: " + arrayBufferViewTag);
    }
    int offset = (int) reader.getVarint();
    if (offset < 0) {
      throw new DataCloneOutOfValueException(offset);
    }
    int byteLength = (int) reader.getVarint();
    if (byteLength < 0) {
      throw new DataCloneOutOfValueException(byteLength);
    }
    JSDataView.DataViewKind kind;
    switch (readArrayBufferViewTag()) {
      case DATA_VIEW: {
        kind = JSDataView.DataViewKind.DATA_VIEW;
        break;
      }
      case FLOAT32_ARRAY: {
        kind = JSDataView.DataViewKind.FLOAT32_ARRAY;
        break;
      }
      case FLOAT64_ARRAY: {
        kind = JSDataView.DataViewKind.FLOAT64_ARRAY;
        break;
      }
      case INT8_ARRAY: {
        kind = JSDataView.DataViewKind.INT8_ARRAY;
        break;
      }
      case INT16_ARRAY: {
        kind = JSDataView.DataViewKind.INT16_ARRAY;
        break;
      }
      case INT32_ARRAY: {
        kind = JSDataView.DataViewKind.INT32_ARRAY;
        break;
      }
      case UINT8_ARRAY: {
        kind = JSDataView.DataViewKind.UINT8_ARRAY;
        break;
      }
      case UINT8_CLAMPED_ARRAY: {
        kind = JSDataView.DataViewKind.UINT8_CLAMPED_ARRAY;
        break;
      }
      case UINT16_ARRAY: {
        kind = JSDataView.DataViewKind.UINT16_ARRAY;
        break;
      }
      case UINT32_ARRAY: {
        kind = JSDataView.DataViewKind.UINT32_ARRAY;
        break;
      }
      default: {
        throw new UnreachableCodeException();
      }
    }
    JSDataView<JSArrayBuffer> view = new JSDataView<>(arrayBuffer, kind, offset, byteLength);
    assignId(view);
    return view;
  }

  @Override
  protected JSError readJSError() {
    JSError.ErrorType errorType = JSError.ErrorType.Error;
    String message = null;
    String stack = null;
    boolean done = false;
    while (!done) {
      ErrorTag tag = readErrorTag();
      if (tag == null) {
        break;
      }
      switch (tag) {
        case EVAL_ERROR: {
          errorType = JSError.ErrorType.EvalError;
          break;
        }
        case RANGE_ERROR: {
          errorType = JSError.ErrorType.RangeError;
          break;
        }
        case REFERENCE_ERROR: {
          errorType = JSError.ErrorType.ReferenceError;
          break;
        }
        case SYNTAX_ERROR: {
          errorType = JSError.ErrorType.SyntaxError;
          break;
        }
        case TYPE_ERROR: {
          errorType = JSError.ErrorType.TypeError;
          break;
        }
        case URI_ERROR: {
          errorType = JSError.ErrorType.URIError;
          break;
        }
        case MESSAGE: {
          message = readString(StringLocation.ERROR_MESSAGE, null);
          break;
        }
        case STACK: {
          stack = readString(StringLocation.ERROR_STACK, null);
          break;
        }
        default: {
          if (!(tag == ErrorTag.END)) {
            throw new AssertionError("ErrorTag: " + tag);
          }
          done = true;
          break;
        }
      }
    }

    JSError error = new JSError(errorType, message, stack);
    assignId(error);
    return error;
  }

  @Override
  protected Object readHostObject() {
    if (delegate == null) {
      throw new DataCloneDeserializationException();
    }
    return assignId(delegate.readHostObject(this));
  }

  /**
   * Accepts the {@link JSArrayBuffer} corresponding to the one passed previously to {@link
   * Serializer#transferArrayBuffer(int, JSArrayBuffer)}
   *
   * @param transferId  transfer id
   * @param arrayBuffer JSArrayBuffer
   */
  public void transferArrayBuffer(int transferId, @NonNull JSArrayBuffer arrayBuffer) {
    if (arrayBufferTransferMap == null) {
      arrayBufferTransferMap = new HashMap<>();
    }
    arrayBufferTransferMap.put(transferId, arrayBuffer);
  }

  @Override
  protected Object readTransferredJSArrayBuffer() {
    int id = (int) reader.getVarint();
    if (id < 0) {
      throw new DataCloneOutOfValueException(id);
    }
    if (arrayBufferTransferMap == null) {
      throw new AssertionError("Call |transferArrayBuffer(int, JSArrayBuffer)| first.");
    }
    JSArrayBuffer arrayBuffer = (JSArrayBuffer) arrayBufferTransferMap.get(id);
    if (arrayBuffer == null) {
      throw new AssertionError("Invalid transfer id " + id);
    }
    assignId(arrayBuffer);
    return (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) ? readJSArrayBufferView(arrayBuffer)
        : arrayBuffer;
  }

  @Override
  protected Object readSharedArrayBuffer() {
    if (delegate == null) {
      throw new DataCloneDeserializationException();
    }
    int id = (int) reader.getVarint();
    if (id < 0) {
      throw new DataCloneOutOfValueException(id);
    }
    JSSharedArrayBuffer sharedArrayBuffer = delegate.getSharedArrayBufferFromId(this, id);
    assignId(sharedArrayBuffer);
    return (peekTag() == SerializationTag.ARRAY_BUFFER_VIEW) ? readJSArrayBufferView(
        sharedArrayBuffer) : sharedArrayBuffer;
  }

  @Override
  protected Object readTransferredWasmModule() {
    if (delegate == null) {
      throw new DataCloneDeserializationException();
    }
    int id = (int) reader.getVarint();
    if (id < 0) {
      throw new DataCloneOutOfValueException(id);
    }
    WasmModule wasmModule = delegate.getWasmModuleFromId(this, id);
    return assignId(wasmModule);
  }

  @Override
  protected Object readTransferredWasmMemory() {
    long maximumPages = reader.getVarint();
    JSValue memory = (JSValue) readSharedArrayBuffer();
    if (!memory.isSharedArrayBuffer()) {
      throw new UnexpectedException("expected SharedArrayBuffer");
    }
    WasmMemory wasmMemory = new WasmMemory(maximumPages, (JSSharedArrayBuffer) memory);
    return assignId(wasmMemory);
  }
}
