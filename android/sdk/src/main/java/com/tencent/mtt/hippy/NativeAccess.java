package com.tencent.mtt.hippy;

import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;

@SuppressWarnings("JavaJniMissingFunction")
public class NativeAccess {
  private NativeAccess() {

  }

  // region bridge.serialization.delegate
  public static native JSSharedArrayBuffer getSharedArrayBufferFromId(int clone_id);
  public static native WasmModule getWasmModuleFromId(int transfer_id);
  // endregion
}
