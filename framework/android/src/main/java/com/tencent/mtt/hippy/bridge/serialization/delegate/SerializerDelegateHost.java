/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.mtt.hippy.bridge.serialization.delegate;

import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;
import com.tencent.mtt.hippy.serialization.recommend.Serializer;

@SuppressWarnings({"unused"})
public interface SerializerDelegateHost {

  /**
   * Get a {@link JSSharedArrayBuffer} given a clone_id previously provided by {@link
   * SerializerDelegate#getSharedArrayBufferId(Serializer, JSSharedArrayBuffer)} <br/>
   * <em>This method will be called from C++ side.</em>
   *
   * @param clone_id clone id
   * @return JSSharedArrayBuffer
   */
  JSSharedArrayBuffer getSharedArrayBufferFromId(int clone_id);

  /**
   * Get a {@link WasmModule} given a transfer_id previously provided by {@link
   * SerializerDelegate#getWasmModuleTransferId(Serializer, WasmModule)} <br/>
   * <em>This method will be called from C++ side.</em>
   *
   * @param transfer_id clone id
   * @return webAssembly module
   */
  WasmModule getWasmModuleFromId(int transfer_id);
}
