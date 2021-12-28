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

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.serialization.Deserializer;

import java.nio.ByteBuffer;
import java.util.ArrayList;

/**
 * Implementation of render provider, communicate with native (C++) render manager,
 * deserialize and virtual node operation will run in JS thread.
 */
public class NativeRenderProvider {

    private final long mRuntimeId;
    private final NativeRenderDelegate mRenderDelegate;
    private final Deserializer mDeserializer;
    private BinaryReader mSafeHeapReader;

    public NativeRenderProvider(@NonNull NativeRenderDelegate renderDelegate, long runtimeId) {
        mRenderDelegate = renderDelegate;
        mRuntimeId = runtimeId;
        mDeserializer = new Deserializer(null, new InternalizedStringTable());
        onCreateNativeRenderProvider(runtimeId, PixelUtil.getDensity());
    }

    public void destroy() {
        mDeserializer.getStringTable().release();
    }

    /**
     * Deserialize dom node data wrap by ByteBuffer just support heap buffer reader, direct buffer
     * reader not fit for dom data
     *
     * @param buffer The byte array from native (C++) DOM wrap by {@link ByteBuffer}
     * @return The result {@link ArrayList} of deserialize
     */
    private @NonNull
    ArrayList bytesToArgument(ByteBuffer buffer) {
        final BinaryReader binaryReader;
        if (mSafeHeapReader == null) {
            mSafeHeapReader = new SafeHeapReader();
        }
        binaryReader = mSafeHeapReader;
        binaryReader.reset(buffer);
        mDeserializer.setReader(binaryReader);
        mDeserializer.reset();
        mDeserializer.readHeader();
        Object paramsObj = mDeserializer.readValue();
        return (paramsObj instanceof ArrayList) ? (ArrayList) paramsObj : new ArrayList();
    }

    /**
     * This method provide for native (C++) call to create render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    public void createNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.createNode(list);
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * This method provide for native (C++) call to updateNode render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    public void updateNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));

        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * This method provide for native (C++) call to delete render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    public void deleteNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));

        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * This method provide for native (C++) call to update layout of render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    public void updateLayout(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateLayout(list);
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * This method provide for native (C++) call to measure text width and height
     *
     * @param id node id
     * @param width pre setting of text width
     * @param widthMode flex measure mode of width
     * @param height pre setting of text height
     * @param heightMode flex measure mode of height
     * @return the measure result, convert to long type by FlexOutput
     */
    public long measure(int id, float width, int widthMode, float height, int heightMode) {
        return mRenderDelegate.measure(id, width, widthMode, height, heightMode);
    }

    /**
     * This method provide for native (C++) call to mark batch start
     */
    public void startBatch() {
        mRenderDelegate.startBatch();
    }

    /**
     * This method provide for native (C++) call to mark batch end
     */
    public void endBatch() {
        mRenderDelegate.endBatch();
    }

    public void onSizeChanged(int width, int height) {
        onRootSizeChanged(mRuntimeId, PixelUtil.px2dp(width), PixelUtil.px2dp(height));
    }

    public void updateGestureEventListener(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Create provider when renderer init, and should notify native (C++) to build render manager
     *
     * @param runtimeId v8 instance id
     * @param density screen displayMetrics density
     */
    public native void onCreateNativeRenderProvider(long runtimeId, float density);

    /**
     * Call back from Android system when size changed, just like horizontal and vertical screen
     * switching, call this jni interface to invoke dom tree relayout
     *
     * @param runtimeId v8 instance id
     * @param width root view new width use dp unit
     * @param height root view new height use dp unit
     */
    public native void onRootSizeChanged(long runtimeId, float width, float height);
}
