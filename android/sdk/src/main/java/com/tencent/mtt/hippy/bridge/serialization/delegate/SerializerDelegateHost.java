package com.tencent.mtt.hippy.bridge.serialization.delegate;

import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.recommend.Serializer;

@SuppressWarnings({"unused"})
public interface SerializerDelegateHost {
  /**
   * Get a {@link JSSharedArrayBuffer} given a clone_id previously provided by {@link SerializerDelegate#getSharedArrayBufferId(Serializer, JSSharedArrayBuffer)}
   * <br/>
   * <em>This method will be called from C++ side.</em>
   *
   * @param clone_id clone id
   * @return JSSharedArrayBuffer
   */
  JSSharedArrayBuffer getSharedArrayBufferFromId(int clone_id);

  /**
   * Get a {@link WasmModule} given a transfer_id previously provided by {@link SerializerDelegate#getWasmModuleTransferId(Serializer, WasmModule)}
   * <br/>
   * <em>This method will be called from C++ side.</em>
   *
   * @param transfer_id clone id
   * @return webAssembly module
   */
  WasmModule getWasmModuleFromId(int transfer_id);
}
