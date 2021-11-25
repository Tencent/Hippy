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
package com.tencent.renderer;


import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.serialization.Deserializer;
import java.nio.ByteBuffer;

public class NativeRendererDelegate {
  private INativeRenderer nativeRenderer;
  private BinaryReader safeHeapReader;
  private Deserializer deserializer;

  public NativeRendererDelegate(INativeRenderer nativeRenderer) {
    this.nativeRenderer = nativeRenderer;
    deserializer = new Deserializer(null, new InternalizedStringTable());
    onCreateNativeRendererDelegate();
  }

  public void destroy() {
    deserializer.getStringTable().release();
  }

  private HippyArray bytesToArgument(ByteBuffer buffer) {
    Object paramsObj = null;
    try {
      final BinaryReader binaryReader;
      if (safeHeapReader == null) {
        safeHeapReader = new SafeHeapReader();
      }
      binaryReader = safeHeapReader;
      binaryReader.reset(buffer);
      deserializer.setReader(binaryReader);
      deserializer.reset();
      deserializer.readHeader();
      paramsObj = deserializer.readValue();
    } catch (Throwable throwable) {
      throwable.printStackTrace();
      LogUtils.e("compatible.Deserializer", "Error Parsing Buffer", throwable);
      if (nativeRenderer != null) {
        nativeRenderer.handleNativeException(new RuntimeException(throwable), true);
      }
    }

    return (paramsObj instanceof HippyArray) ? (HippyArray)paramsObj : new HippyArray();
  }
  
  public void createNode(byte[] buffer) {
    final HippyArray hippyArray = bytesToArgument(ByteBuffer.wrap(buffer));
    UIThreadUtils.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (nativeRenderer != null) {
          nativeRenderer.createNode(hippyArray);
        }
      }
    });
  }

  public void updateNode(byte[] buffer) {
    final HippyArray hippyArray = bytesToArgument(ByteBuffer.wrap(buffer));
    UIThreadUtils.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (nativeRenderer != null) {
          nativeRenderer.updateNode(hippyArray);
        }
      }
    });
  }

  public void deleteNode(byte[] buffer) {
    final HippyArray hippyArray = bytesToArgument(ByteBuffer.wrap(buffer));
    UIThreadUtils.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (nativeRenderer != null) {
          nativeRenderer.deleteNode(hippyArray);
        }
      }
    });
  }

  public native void onCreateNativeRendererDelegate();
}
