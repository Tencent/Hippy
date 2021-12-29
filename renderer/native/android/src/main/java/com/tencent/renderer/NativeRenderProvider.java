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

import android.text.TextUtils;
import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.annotation.CalledByNative;
import com.tencent.renderer.serialization.Deserializer;

import java.nio.ByteBuffer;
import java.util.ArrayList;

/**
 * Implementation of render provider, communicate with native (C++) render manager,
 * deserialize and virtual node operation will run in JS thread, the order of native call is
 * startBatch -> createNode(updateNode or deleteNode) -> measure -> updateGestureEventListener ->
 * updateLayout -> endBatch
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
     * @param buffer The byte array from native (C++) DOM wrapped by {@link ByteBuffer}
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
     * Call from native (C++) render manager to create render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    private void createNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.createNode(list);
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Call from native (C++) render manager to updateNode render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    private void updateNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));

        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Call from native (C++) render manager to delete render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    private void deleteNode(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));

        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Call from native (C++) render manager to update layout of render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    private void updateLayout(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateLayout(list);
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Call from native (C++) render manager to add or remove gesture event listener
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    private void updateGestureEventListener(byte[] buffer) {
        try {
            final ArrayList list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateGestureEventListener(list);
        } catch (NativeRenderException exception) {
            mRenderDelegate.handleRenderException(exception);
        }
    }

    /**
     * Call from native (C++) render manager to measure text width and height
     *
     * @param id node id
     * @param width pre setting of text width
     * @param widthMode flex measure mode of width
     * @param height pre setting of text height
     * @param heightMode flex measure mode of height
     * @return the measure result, convert to long type by FlexOutput
     */
    @CalledByNative
    private long measure(int id, float width, int widthMode, float height, int heightMode) {
        return mRenderDelegate.measure(id, width, widthMode, height, heightMode);
    }

    /**
     * Call from native (C++) render manager to mark batch start
     */
    @CalledByNative
    private void startBatch() {
        mRenderDelegate.startBatch();
    }

    /**
     * Call from native (C++) render manager to mark batch end
     */
    @CalledByNative
    private void endBatch() {
        mRenderDelegate.endBatch();
    }

    public void onSizeChanged(int width, int height) {
        onRootSizeChanged(mRuntimeId, PixelUtil.px2dp(width), PixelUtil.px2dp(height));
    }

    public void dispatchUIComponentEvent(@NonNull ByteBuffer buffer, int offset, int length) {
        //onReceivedUIComponentEvent(mRuntimeId, buffer.array(), offset, length);
    }

    public void dispatchNativeGestureEvent(@NonNull ByteBuffer buffer, int offset, int length) {
        //onReceivedNativeGestureEvent(mRuntimeId, buffer.array(), offset, length);
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

    /**
     * Dispatch ui component event generated by native renderer to (C++) dom manager,
     *
     * @param runtimeId v8 instance id
     * @param buffer params encoded by serializer
     * @param offset available offset of buffer
     * @param length available total length of buffer
     */
    //public native void onReceivedUIComponentEvent(long runtimeId, byte[] buffer, int offset, int length);

    /**
     * Dispatch ui gesture event generated by native renderer to (C++) dom manager,
     *
     * @param runtimeId v8 instance id
     * @param buffer params encoded by serializer
     * @param offset available offset of buffer
     * @param length available total length of buffer
     */
    //public native void onReceivedNativeGestureEvent(long runtimeId, byte[] buffer, int offset, int length);
}
