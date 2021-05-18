package com.tencent.mtt.hippy.bridge.serialization.delegate;

import com.tencent.mtt.hippy.exception.UnexpectedTypeException;
import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.recommend.Serializer;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@SuppressWarnings({"unused"})
public class SerializerDelegate implements Serializer.Delegate, SerializerDelegateHost {
  private static final Map<Integer, Object> objectMap = new ConcurrentHashMap<>();
  private static final AtomicInteger nextId = new AtomicInteger(0);
  private static final SerializerDelegate instance = new SerializerDelegate();

  private SerializerDelegate() {

  }

  public static SerializerDelegate getInstance() {
    return instance;
  }

  @Override
  public boolean writeHostObject(Serializer serializer, Object object) {
    return false;
  }

  // region set & set
  private <T extends JSValue> int getObjectId(T object) {
    int id = nextId.incrementAndGet();
    objectMap.put(id, object);
    return id;
  }

  private <T extends JSValue> T getObjectFromId(int id, Class<T> type) {
    Object object = objectMap.get(id);
    if (type.isInstance(object)) {
      objectMap.remove(id);
      return type.cast(object);
    } else if (object == null) {
      return null;
    }
    throw new UnexpectedTypeException(type, object);
  }
  // endregion

  // region SharedArrayBuffer
  @Override
  public int getSharedArrayBufferId(Serializer serializer, JSSharedArrayBuffer sharedArrayBuffer) {
    return getObjectId(sharedArrayBuffer);
  }

  @Override
  public JSSharedArrayBuffer getSharedArrayBufferFromId(int clone_id) {
    return getObjectFromId(clone_id, JSSharedArrayBuffer.class);
  }
  // endregion

  // region WasmModule
  @Override
  public int getWasmModuleTransferId(Serializer serializer, WasmModule module) {
    return getObjectId(module);
  }

  @Override
  public WasmModule getWasmModuleFromId(int transfer_id) {
    return getObjectFromId(transfer_id, WasmModule.class);
  }
  // endregion
}
