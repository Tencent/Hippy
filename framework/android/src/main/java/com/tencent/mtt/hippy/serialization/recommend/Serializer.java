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

import android.util.Pair;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.runtime.builtins.JSRegExp;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import com.tencent.mtt.hippy.runtime.builtins.array.JSAbstractArray;
import com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.ArrayBufferViewTag;
import com.tencent.mtt.hippy.serialization.JSSerializationTag;
import com.tencent.mtt.hippy.serialization.exception.DataCloneException;
import com.tencent.mtt.hippy.serialization.ErrorTag;
import com.tencent.mtt.hippy.serialization.utils.IntegerPolyfill;
import com.tencent.mtt.hippy.serialization.PrimitiveValueSerializer;
import com.tencent.mtt.hippy.runtime.builtins.JSArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSError;
import com.tencent.mtt.hippy.runtime.builtins.JSMap;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.JSSet;
import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSDataView;
import com.tencent.mtt.hippy.runtime.builtins.JSOddball;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBigintObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBooleanObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSNumberObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSStringObject;
import com.tencent.mtt.hippy.serialization.nio.writer.BinaryWriter;

import java.nio.ByteBuffer;
import java.util.IdentityHashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
@SuppressWarnings({"unused"})
public class Serializer extends PrimitiveValueSerializer {

  public interface Delegate {

    /**
     * Implement this method to write some kind of host object, if possible. If not, return value
     * will be false.
     *
     * @param serializer current serializer
     * @param object     host object
     * @return whether the serialization is successful
     */
    @SuppressWarnings("SameReturnValue")
    boolean writeHostObject(Serializer serializer, Object object);

    /**
     * Called when the Serializer is going to serialize a {@link JSSharedArrayBuffer} object.
     * Implement must return an ID for the object, using the same ID if this {@link
     * JSSharedArrayBuffer} has already been serialized in this buffer. <br/> When deserializing,
     * this ID will be passed to Deserializer.Delegate#getSharedArrayBufferFromId as |clone_id|.
     * <br/> If the object cannot be serialized, an exception {@link DataCloneException} should be
     * thrown.
     *
     * @param serializer        current serializer
     * @param sharedArrayBuffer SharedArrayBuffer
     * @return ID
     */
    int getSharedArrayBufferId(Serializer serializer, JSSharedArrayBuffer sharedArrayBuffer);

    /**
     * Called when the Serializer is going to serialize a {@link WasmModule} object. Implement must
     * return an ID for the object, using the same ID if this {@link WasmModule} has already been
     * serialized in this buffer. <br/> When deserializing, this ID will be passed to
     * Deserializer.Delegate#getWasmModuleFromId as |transfer_id|. <br/> If the object cannot be
     * serialized, an exception {@link DataCloneException} should be thrown.
     *
     * @param serializer current serializer
     * @param module     WebAssembly Module
     * @return ID
     */
    int getWasmModuleTransferId(Serializer serializer, WasmModule module);

    /**
     * Called when the first shared value is serialized. All subsequent shared
     * values will use the same conveyor.
     *
     * The implement must ensure the lifetime of the conveyor matches the
     * lifetime of the serialized data.
     *
     * This method is called at most once per serializer.
     *
     * @param serializer current serializer
     * @param conveyor   SharedValueConveyor
     * @return return true if supports serializing shared values, otherwise return false.
     */
    boolean adoptSharedValueConveyor(Serializer serializer, SharedValueConveyor conveyor);
  }

  /**
   * Implement for Delegate interface
   */
  private final Delegate delegate;
  /**
   * Maps a transferred {@link JSArrayBuffer} to its transfer ID.
   */
  private Map<JSArrayBuffer, Integer> arrayBufferTransferMap;
  /**
   * Determines whether {@link JSArrayBuffer}s should be serialized as host objects.
   */
  private boolean treatArrayBufferViewsAsHostObjects;
  /**
   * Shared value conveyors to keep JS shared values alive in transit when serialized.
   */
  private SharedValueConveyor sharedObjectConveyor;

  public Serializer() {
    this(null, null, 13);
  }

  public Serializer(BinaryWriter writer, Delegate delegate, int version) {
    super(writer, version);
    this.delegate = delegate;
  }

  /**
   * Indicate whether to treat {@link JSDataView} objects as host objects, i.e. pass them to
   * Delegate#WriteHostObject. This should not be called when no Delegate was passed. <br/> The
   * default is not to treat ArrayBufferViews as host objects.
   *
   * @param mode treat mode
   */
  public void setTreatArrayBufferViewsAsHostObjects(boolean mode) {
    treatArrayBufferViewsAsHostObjects = mode;
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
  public boolean writeValue(Object object) {
    if (super.writeValue(object)) {
      return true;
    }

    if (getVersion() >= 15 && object instanceof SharedValueConveyor.SharedValue) {
      assignId(object);
      writeSharedObject((SharedValueConveyor.SharedValue) object);
      return true;
    }

    if (!treatArrayBufferViewsAsHostObjects && JSValue.is(object) && ((JSValue) object)
        .isDataView()) {
      JSDataView<?> view = (JSDataView<?>) object;
      assignId(view);
      if (view.getBufferObject() instanceof JSArrayBuffer) {
        writeJSSharedArrayBuffer((JSSharedArrayBuffer) view.getBufferObject());
      } else {
        writeJSArrayBuffer(view.getBufferObject());
      }
    }

    if (JSValue.is(object)) {
      assignId(object);
      JSValue value = (JSValue) object;

      if (value.isArray()) {
        writeJSArray((JSAbstractArray) value);
      } else if (value.isDataView()) {
        writeJSArrayBufferView((JSDataView<?>) value);
      } else if (value.isError()) {
        writeJSError((JSError) value);
      } else if (value.isRegExp()) {
        writeJSRegExp((JSRegExp) value);
      } else if (value.isObject()) {
        writeJSObject((JSObject) value);
      } else if (value.isMap()) {
        writeJSMap((JSMap) value);
      } else if (value.isSet()) {
        writeJSSet((JSSet) value);
      } else if (value.isSharedArrayBuffer()) {
        writeJSSharedArrayBuffer((JSSharedArrayBuffer) value);
      } else if (value.isArrayBuffer()) {
        writeJSArrayBuffer((JSArrayBuffer) value);
      } else if (value.isBooleanObject()) {
        writeJSBoolean((JSBooleanObject) value);
      } else if (value.isBigIntObject()) {
        writeTag(JSSerializationTag.BIG_INT_OBJECT);
        writeJSBigIntContents((JSBigintObject) value);
      } else if (value.isNumberObject()) {
        writeJSNumber((JSNumberObject) value);
      } else if (value.isStringObject()) {
        writeJSString((JSStringObject) value);
      } else {
        throw new UnreachableCodeException();
      }
    } else {
      if (writeHostObject(object)) {
        assignId(object);
      } else {
        return false;
      }
    }
    return true;
  }

  private void writeTag(ArrayBufferViewTag tag) {
    writer.putVarint(tag.getTag());
  }

  private void writeTag(ErrorTag tag) {
    writer.putVarint(tag.getTag());
  }

  private void writeJSBoolean(@NonNull JSBooleanObject value) {
    writeTag(value.isTrue() ? JSSerializationTag.TRUE_OBJECT : JSSerializationTag.FALSE_OBJECT);
  }

  private void writeJSBigIntContents(@NonNull JSBigintObject value) {
    writeBigIntContents(value.getValue());
  }

  private void writeJSNumber(@NonNull JSNumberObject value) {
    writeTag(JSSerializationTag.NUMBER_OBJECT);
    writeDouble(value.getValue().doubleValue());
  }

  private void writeJSString(@NonNull JSStringObject value) {
    writeTag(JSSerializationTag.STRING_OBJECT);
    writeString(value.getValue().toString());
  }

  private void writeJSRegExp(@NonNull JSRegExp value) {
    writeTag(JSSerializationTag.REGEXP);
    writeString(value.getSource());
    writer.putVarint(value.getFlags());
  }

  private void writeJSArrayBuffer(@NonNull JSArrayBuffer value) {
    if (arrayBufferTransferMap == null) {
      arrayBufferTransferMap = new IdentityHashMap<>();
    }

    Integer id = arrayBufferTransferMap.get(value);
    if (id == null) {
      ByteBuffer source = value.getBuffer();
      int byteLength = source.limit();
      writeTag(JSSerializationTag.ARRAY_BUFFER);
      writer.putVarint(byteLength);
      for (int i = 0; i < byteLength; i++) {
        writer.putByte(source.get(i));
      }
    } else {
      writeTag(JSSerializationTag.ARRAY_BUFFER_TRANSFER);
      writer.putVarint(IntegerPolyfill.toUnsignedLong(id));
    }
  }

  private void writeJSSharedArrayBuffer(@NonNull JSSharedArrayBuffer value) {
    if (delegate == null) {
      throw new DataCloneException(value);
    }
    int id = delegate.getSharedArrayBufferId(this, value);
    writeTag(JSSerializationTag.SHARED_ARRAY_BUFFER);
    writer.putVarint(id);
  }

  private void writeJSObject(JSObject value) {
    writeTag(JSSerializationTag.BEGIN_JS_OBJECT);
    writeJSObjectProperties(value.entries());
    writeTag(JSSerializationTag.END_JS_OBJECT);
    writer.putVarint(value.size());
  }

  private void writeJSObjectProperties(@NonNull Set<Pair<String, Object>> props) {
    for (Pair<String, Object> prop : props) {
      writeString(prop.first);
      writeValue(prop.second);
    }
  }

  private void writeJSMap(@NonNull JSMap value) {
    writeTag(JSSerializationTag.BEGIN_JS_MAP);
    Iterator<Map.Entry<Object, Object>> entries = value.getInternalMap().entrySet().iterator();
    int count = 0;
    while (entries.hasNext()) {
      count++;
      Map.Entry<Object, Object> entry = entries.next();
      writeValue(entry.getKey());
      writeValue(entry.getValue());
    }
    writeTag(JSSerializationTag.END_JS_MAP);
    writer.putVarint(2L * count);
  }

  private void writeJSSet(@NonNull JSSet value) {
    writeTag(JSSerializationTag.BEGIN_JS_SET);
    Iterator<Object> entries = value.getInternalSet().iterator();
    int count = 0;
    while (entries.hasNext()) {
      count++;
      writeValue(entries.next());
    }
    writeTag(JSSerializationTag.END_JS_SET);
    writer.putVarint(count);
  }

  private void writeJSArray(@NonNull JSAbstractArray value) {
    int length = value.size();
    if (value.isDenseArray()) {
      writeTag(JSSerializationTag.BEGIN_DENSE_JS_ARRAY);
      writer.putVarint(length);
      for (int i = 0; i < length; i++) {
        writeValue(value.get(i));
      }
      writeJSObjectProperties(JSObject.entries(value));
      writeTag(JSSerializationTag.END_DENSE_JS_ARRAY);
    } else if (value.isSparseArray()) {
      writeTag(JSSerializationTag.BEGIN_SPARSE_JS_ARRAY);
      writer.putVarint(length);
      for (Pair<Integer, Object> item : ((JSSparseArray) value).items()) {
        writer.putVarint(item.first);
        writeValue(item.second);
      }
      writeJSObjectProperties(JSObject.entries(value));
      writeTag(JSSerializationTag.END_SPARSE_JS_ARRAY);
    } else {
      throw new UnreachableCodeException();
    }
    writer.putVarint(JSObject.size(value));
    writer.putVarint(length);
  }

  private void writeJSArrayBufferView(@NonNull JSDataView<?> value) {
    if (treatArrayBufferViewsAsHostObjects) {
      if (!writeHostObject(value)) {
        throw new DataCloneException(value);
      }
    } else {
      writeTag(JSSerializationTag.ARRAY_BUFFER_VIEW);
      ArrayBufferViewTag tag;
      switch (value.getKind()) {
        case DATA_VIEW: {
          tag = ArrayBufferViewTag.DATA_VIEW;
          break;
        }
        case BIGINT64_ARRAY: {
          tag = ArrayBufferViewTag.BIGINT64_ARRAY;
          break;
        }
        case BIGUINT64_ARRAY: {
          tag = ArrayBufferViewTag.BIGUINT64_ARRAY;
          break;
        }
        case FLOAT32_ARRAY: {
          tag = ArrayBufferViewTag.FLOAT32_ARRAY;
          break;
        }
        case FLOAT64_ARRAY: {
          tag = ArrayBufferViewTag.FLOAT64_ARRAY;
          break;
        }
        case INT8_ARRAY: {
          tag = ArrayBufferViewTag.INT8_ARRAY;
          break;
        }
        case INT16_ARRAY: {
          tag = ArrayBufferViewTag.INT16_ARRAY;
          break;
        }
        case INT32_ARRAY: {
          tag = ArrayBufferViewTag.INT32_ARRAY;
          break;
        }
        case UINT8_ARRAY: {
          tag = ArrayBufferViewTag.UINT8_ARRAY;
          break;
        }
        case UINT8_CLAMPED_ARRAY: {
          tag = ArrayBufferViewTag.UINT8_CLAMPED_ARRAY;
          break;
        }
        case UINT16_ARRAY: {
          tag = ArrayBufferViewTag.UINT16_ARRAY;
          break;
        }
        case UINT32_ARRAY: {
          tag = ArrayBufferViewTag.UINT32_ARRAY;
          break;
        }
        default: {
          throw new UnreachableCodeException();
        }
      }
      writeTag(tag);
      writer.putVarint(value.getByteOffset());
      writer.putVarint(value.getByteLength());
      if (getVersion() >= 14) {
        writer.putVarint(value.getFlags());
      }
    }
  }

  private void writeJSError(@NonNull JSError error) {
    writeTag(JSSerializationTag.ERROR);
    writeErrorTypeTag(error);

    String message = error.getMessage();
    if (!message.isEmpty()) {
      writeTag(ErrorTag.MESSAGE);
      writeString(message);
    }

    String stack = error.getStack();
    if (!stack.isEmpty()) {
      writeTag(ErrorTag.STACK);
      writeString(stack);
    }

    writeTag(ErrorTag.END);
  }

  private void writeErrorTypeTag(@NonNull JSError error) {
    JSError.ErrorType errorType = error.getType();
    ErrorTag tag;
    switch (errorType) {
      case EvalError: {
        tag = ErrorTag.EVAL_ERROR;
        break;
      }
      case RangeError: {
        tag = ErrorTag.RANGE_ERROR;
        break;
      }
      case ReferenceError: {
        tag = ErrorTag.REFERENCE_ERROR;
        break;
      }
      case SyntaxError: {
        tag = ErrorTag.SYNTAX_ERROR;
        break;
      }
      case TypeError: {
        tag = ErrorTag.TYPE_ERROR;
        break;
      }
      case URIError: {
        tag = ErrorTag.URI_ERROR;
        break;
      }
      default: {
        tag = null;
        if (errorType != JSError.ErrorType.Error && errorType != JSError.ErrorType.AggregateError) {
          throw new UnreachableCodeException();
        }
        break;
      }
    }
    if (tag != null) {
      writeTag(tag);
    }
  }

  private boolean writeHostObject(Object object) {
    writeTag(JSSerializationTag.HOST_OBJECT);
    if (delegate == null) {
      throw new DataCloneException(object);
    }
    return delegate.writeHostObject(this, object);
  }

  private void writeSharedObject(SharedValueConveyor.SharedValue object) {
    if (delegate == null) {
      throw new DataCloneException(object);
    }
    if (sharedObjectConveyor == null) {
      sharedObjectConveyor = new SharedValueConveyor();
      if (!delegate.adoptSharedValueConveyor(this, sharedObjectConveyor)) {
        sharedObjectConveyor = null;
        return;
      }
    }
    writeTag(JSSerializationTag.SHARED_OBJECT);
    writer.putVarint(sharedObjectConveyor.persist(object));
  }

  /**
   * Marks an {@link JSArrayBuffer} as having its contents transferred out of band. Pass the
   * corresponding {@link JSArrayBuffer} in the deserializing context to {@link
   * Deserializer#transferArrayBuffer(int, JSArrayBuffer)}.
   *
   * @param transferId  transfer id
   * @param arrayBuffer JSArrayBuffer
   */
  public void transferArrayBuffer(int transferId, @NonNull JSArrayBuffer arrayBuffer) {
    if (arrayBufferTransferMap == null) {
      arrayBufferTransferMap = new IdentityHashMap<>();
    }
    arrayBufferTransferMap.put(arrayBuffer, transferId);
  }
}
