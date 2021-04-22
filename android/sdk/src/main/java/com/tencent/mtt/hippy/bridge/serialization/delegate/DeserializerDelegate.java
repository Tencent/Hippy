package com.tencent.mtt.hippy.bridge.serialization.delegate;

import com.tencent.mtt.hippy.NativeAccess;
import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.exception.DataCloneDeserializationException;
import com.tencent.mtt.hippy.serialization.recommend.Deserializer;

public class DeserializerDelegate implements Deserializer.Delegate {
  private static final DeserializerDelegate instance = new DeserializerDelegate();

  public static DeserializerDelegate getInstance() {
    return instance;
  }

  private DeserializerDelegate() {

  }

  @Override
  public Object readHostObject(Deserializer deserializer) {
    throw new DataCloneDeserializationException();
  }

  @Override
  public JSSharedArrayBuffer getSharedArrayBufferFromId(Deserializer deserializer, int clone_id) {
    return NativeAccess.getSharedArrayBufferFromId(clone_id);
  }

  @Override
  public WasmModule getWasmModuleFromId(Deserializer deserializer, int transfer_id) {
    return NativeAccess.getWasmModuleFromId(transfer_id);
  }
}
