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
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.annotation.CalledByNative;
import com.tencent.renderer.serialization.Deserializer;
import com.tencent.renderer.serialization.Serializer;

import java.nio.ByteBuffer;
import java.util.ArrayList;

/**
 * Implementation of render provider, communicate with native (C++) render manager, deserialize and
 * virtual node operation will run in JS thread, the order of native call is startBatch ->
 * createNode(updateNode or deleteNode) -> measure -> updateGestureEventListener -> updateLayout ->
 * endBatch
 */
public class NativeRenderProvider {

    private final NativeRenderDelegate mRenderDelegate;
    private final Deserializer mDeserializer;
    private final Serializer mSerializer;
    private final int mInstanceId;
    private BinaryReader mSafeHeapReader;
    private SafeHeapWriter mSafeHeapWriter;

    public NativeRenderProvider(@NonNull NativeRenderDelegate renderDelegate) {
        mRenderDelegate = renderDelegate;
        mSerializer = new Serializer();
        mDeserializer = new Deserializer(null, new InternalizedStringTable());
        mInstanceId = onCreateNativeRenderProvider(PixelUtil.getDensity());
    }

    public int getInstanceId() {
        return mInstanceId;
    }

    public void destroy() {
        mDeserializer.getStringTable().release();
        onDestroyNativeRenderProvider(mInstanceId);
    }

    /**
     * Deserialize dom node data wrapped by ByteBuffer, just support heap buffer reader, direct
     * buffer reader not fit for dom data
     *
     * @param buffer the byte array from native (C++) DOM wrapped by {@link ByteBuffer}
     * @return the result {@link ArrayList} of deserialize
     */
    @SuppressWarnings({"rawtypes", "unchecked"})
    @NonNull
    private ArrayList<Object> bytesToArgument(ByteBuffer buffer) {
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
        return (paramsObj instanceof ArrayList) ? (ArrayList) paramsObj : new ArrayList<>();
    }

    /**
     * Serialize UI event params object, and use {@link ByteBuffer} to wrap the result, just support
     * heap buffer writer, direct buffer writer not fit for event data
     *
     * @param params the ui event params object
     * @return the result of serialization wrapped by {@link ByteBuffer}
     * @throws NativeRenderException may throw by {@link Serializer#writeValue(Object)}
     */
    @NonNull
    private ByteBuffer argumentToBytes(@NonNull Object params) throws NativeRenderException {
        if (mSafeHeapWriter == null) {
            mSafeHeapWriter = new SafeHeapWriter();
        } else {
            mSafeHeapWriter.reset();
        }
        mSerializer.setWriter(mSafeHeapWriter);
        mSerializer.reset();
        mSerializer.writeHeader();
        mSerializer.writeValue(params);
        return mSafeHeapWriter.chunked();
    }

    /**
     * Call from native (C++) render manager to create render node
     *
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void createNode(byte[] buffer) {
        try {
            final ArrayList<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.createNode(list);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to update render node
     *
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void updateNode(byte[] buffer) {
        try {
            final ArrayList<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateNode(list);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to delete render node
     *
     * @param ids the node id array list
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void deleteNode(int[] ids) {
        try {
            mRenderDelegate.deleteNode(ids);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to move render node
     *
     * @param ids the node id array list
     * @param newPid the new parent node id
     * @param oldPid the old parent node id
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void moveNode(int[] ids, int newPid, int oldPid) {
        try {
            mRenderDelegate.moveNode(ids, newPid, oldPid);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to update layout of render node
     *
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void updateLayout(byte[] buffer) {
        try {
            final ArrayList<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateLayout(list);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to add or remove event listener
     *
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void updateEventListener(byte[] buffer) {
        try {
            final ArrayList<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.updateEventListener(list);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to measure view location and size in window
     *
     * @param id node id
     * @param callbackId the callback id identifies the caller
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void measureInWindow(int id, long callbackId) {
        try {
            mRenderDelegate.measureInWindow(id, callbackId);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
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
    @SuppressWarnings("unused")
    private long measure(int id, float width, int widthMode, float height, int heightMode) {
        return mRenderDelegate.measure(id, width, widthMode, height, heightMode);
    }

    /**
     * Call from native (C++) render manager to call ui component function
     *
     * @param id node id
     * @param callbackId the callback id identifies the caller
     * @param functionName ui component function name
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void callUIFunction(int id, long callbackId, String functionName, byte[] buffer) {
        try {
            final ArrayList<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
            mRenderDelegate.callUIFunction(id, callbackId, functionName, list);
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    /**
     * Call from native (C++) render manager to mark batch end
     */
    @CalledByNative
    @SuppressWarnings("unused")
    private void endBatch() {
        try {
            mRenderDelegate.endBatch();
        } catch (NativeRenderException e) {
            mRenderDelegate.handleRenderException(e);
        }
    }

    public void onSizeChanged(int width, int height) {
        onRootSizeChanged(mInstanceId, PixelUtil.px2dp(width), PixelUtil.px2dp(height));
    }

    public void doPromiseCallBack(int result, long callbackId, @NonNull String functionName,
            int nodeId, @Nullable Object params) {
        byte[] bytes = null;
        int offset = 0;
        int length = 0;
        if (params != null) {
            try {
                ByteBuffer buffer = argumentToBytes(params);
                offset = buffer.position();
                length = buffer.limit() - buffer.position();
                offset += buffer.arrayOffset();
                bytes = buffer.array();
            } catch (Exception e) {
                mRenderDelegate.handleRenderException(e);
                return;
            }
        }
        doCallBack(mInstanceId, result, functionName, nodeId, callbackId, bytes, offset, length);
    }

    public void dispatchEvent(int nodeId, @NonNull String eventName, @Nullable Object params,
            boolean useCapture, boolean useBubble) {
        byte[] bytes = null;
        int offset = 0;
        int length = 0;
        if (params != null) {
            try {
                ByteBuffer buffer = argumentToBytes(params);
                offset = buffer.position();
                length = buffer.limit() - buffer.position();
                offset += buffer.arrayOffset();
                bytes = buffer.array();
            } catch (Exception e) {
                mRenderDelegate.handleRenderException(e);
                return;
            }
        }
        onReceivedEvent(mInstanceId, nodeId, eventName, bytes, offset, length, useCapture,
                useBubble);
    }

    /**
     * Notify native (C++) to build render manager when build provider instance.
     *
     * @param density screen displayMetrics density
     * @return the unique id of native (C++) render manager
     */
    private native int onCreateNativeRenderProvider(float density);

    /**
     * Notify native (C++) to destroy render manager when release provider instance.
     *
     * @param instanceId the unique id of native (C++) render manager
     */
    private native void onDestroyNativeRenderProvider(int instanceId);

    /**
     * Call back from Android system when size changed, just like horizontal and vertical screen
     * switching, call this jni interface to invoke dom tree relayout.
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param width root view new width use dp unit
     * @param height root view new height use dp unit
     */
    private native void onRootSizeChanged(int instanceId, float width, float height);

    /**
     * Dispatch event generated by native renderer to (C++) dom manager.
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param nodeId target node id
     * @param eventName target event name
     * @param params params buffer encoded by serializer
     * @param offset start position of params buffer
     * @param length available total length of params buffer
     * @param useCapture enable event capture
     * @param useBubble enable event bubble
     */
    private native void onReceivedEvent(int instanceId, int nodeId, String eventName,
            byte[] params, int offset, int length, boolean useCapture, boolean useBubble);

    /**
     * Do promise call back to js after handle call ui function by native renderer,
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param result {@code PROMISE_CODE_RESOLVE} {@link UIPromise} {@code PROMISE_CODE_REJECT}
     * {@link UIPromise}
     * @param functionName ui function name
     * @param nodeId the dom node id
     * @param callbackId the callback id identifies the caller
     * @param params params buffer encoded by serializer
     * @param offset start position of params buffer
     * @param length available total length of params buffer
     */
    private native void doCallBack(int instanceId, int result, String functionName, int nodeId,
            long callbackId, byte[] params, int offset, int length);
}
