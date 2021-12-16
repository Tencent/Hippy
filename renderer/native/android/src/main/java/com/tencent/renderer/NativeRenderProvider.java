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

import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.serialization.Deserializer;
import java.nio.ByteBuffer;
import java.util.ArrayList;

public class NativeRenderProvider {
    private final long runtimeId;
    private final INativeRenderDelegate renderDelegate;
    private final Deserializer deserializer;
    private BinaryReader safeHeapReader;

    public NativeRenderProvider(INativeRenderDelegate renderDelegate, long runtimeId) {
        this.renderDelegate = renderDelegate;
        this.runtimeId = runtimeId;
        deserializer = new Deserializer(null, new InternalizedStringTable());
        onCreateNativeRenderProvider(runtimeId);
    }

    public void destroy() {
        deserializer.getStringTable().release();
    }

    /**
     * Deserialize dom node data wrap by ByteBuffer just support heap buffer reader, direct buffer
     * reader not fit for dom data
     *
     * @param buffer The byte array from c DOM wrap by ByteBuffer
     * @return The ArrayList of deserialize result
     */
    private ArrayList bytesToArgument(ByteBuffer buffer) {
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
        } catch (Exception exception) {
            exception.printStackTrace();
            if (renderDelegate != null) {
                renderDelegate.handleRenderException(exception);
            }
        }

        return (paramsObj instanceof ArrayList) ? (ArrayList) paramsObj : new ArrayList();
    }

    public void createNode(byte[] buffer) {
        final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    renderDelegate.createNode(list);
                } catch (Exception exception) {
                    exception.printStackTrace();
                    renderDelegate.handleRenderException(exception);
                }
            }
        });
    }

    public void updateNode(byte[] buffer) {
        final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    renderDelegate.updateNode(list);
                } catch (Exception exception) {
                    exception.printStackTrace();
                    renderDelegate.handleRenderException(exception);
                }
            }
        });
    }

    public void deleteNode(byte[] buffer) {
        final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    renderDelegate.deleteNode(list);
                } catch (Exception exception) {
                    exception.printStackTrace();
                    renderDelegate.handleRenderException(exception);
                }
            }
        });
    }

    public void updateLayout(byte[] buffer) {
        final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    renderDelegate.updateLayout(list);
                } catch (Exception exception) {
                    exception.printStackTrace();
                    renderDelegate.handleRenderException(exception);
                }
            }
        });
    }

    public void startBatch() {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (renderDelegate != null) {
                    renderDelegate.startBatch();
                }
            }
        });
    }

    public void endBatch() {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (renderDelegate != null) {
                    renderDelegate.endBatch();
                }
            }
        });
    }

    public void onSizeChanged(int width, int height) {
        onRootSizeChanged(runtimeId, width, height);
    }

    /**
     * Create render provider when native renderer init, should call this jni interface to notify c
     * adadpter
     *
     * @param runtimeId v8 instance id
     */
    public native void onCreateNativeRenderProvider(long runtimeId);

    /**
     * Call from Android system call back when size changed, just like horizontal and vertical
     * screen switching call this jni interface to invoke dom tree relayout
     *
     * @param runtimeId v8 instance id
     * @param width root view new width
     * @param height root view new height
     */
    public native void onRootSizeChanged(long runtimeId, int width, int height);
}
