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

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.annotation.CalledByNative;
import com.tencent.renderer.serialization.Deserializer;
import com.tencent.renderer.serialization.Serializer;

import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of render provider, communicate with native (C++) render manager, deserialize and
 * virtual node operation will run in JS thread, the order of native call is startBatch ->
 * createNode(updateNode or deleteNode) -> measure -> updateGestureEventListener -> updateLayout ->
 * endBatch
 */
public class NativeRenderProvider {

    @NonNull
    private final Deserializer mDeserializer;
    @NonNull
    private final Serializer mSerializer;
    @NonNull
    private final WeakReference<NativeRenderDelegate> mRenderDelegateRef;
    @Nullable
    private BinaryReader mSafeHeapReader;
    @Nullable
    private SafeHeapWriter mSafeHeapWriter;
    private int mInstanceId;

    public NativeRenderProvider(@NonNull NativeRenderDelegate renderDelegate) {
        mRenderDelegateRef = new WeakReference<>(renderDelegate);
        mSerializer = new Serializer();
        mDeserializer = new Deserializer(null, new InternalizedStringTable());
    }

    public void setInstanceId(int instanceId) {
        // Call set id follows the create native renderer, so RenderDelegate should not be null here.
        assert mRenderDelegateRef.get() != null;
        NativeRendererManager.addNativeRendererInstance(instanceId,
                (NativeRender) (mRenderDelegateRef.get()));
        mInstanceId = instanceId;
    }

    public int getInstanceId() {
        return mInstanceId;
    }

    public void destroy() {
        mDeserializer.getStringTable().release();
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
    List<Object> bytesToArgument(ByteBuffer buffer) {
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
     * @param rootId the root node id
     * @param buffer The byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void createNode(int rootId, byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.createNode(rootId, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to update render node
     *
     * @param rootId the root node id
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void updateNode(int rootId, byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.updateNode(rootId, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to delete render node
     *
     * @param rootId the root node id
     * @param ids the node id array list
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void deleteNode(int rootId, int[] ids) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                renderDelegate.deleteNode(rootId, ids);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to move render node
     *
     * <p>
     * Move the child node to the new parent node </>
     *
     * @param rootId the root node id
     * @param ids the node id array list
     * @param newPid the new parent node id
     * @param oldPid the old parent node id
     * @param insertIndex the index of child node insert to new parent
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void moveNode(int rootId, int[] ids, int newPid, int oldPid, int insertIndex) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                renderDelegate.moveNode(rootId, ids, newPid, oldPid, insertIndex);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to move render node
     *
     * <p>
     * Adjust the order of child nodes under the same parent node </>
     *
     * @param rootId the root node id
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void moveNode(int rootId, byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.moveNode(rootId, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to update layout of render node
     *
     * @param rootId the root node id
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void updateLayout(int rootId, byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.updateLayout(rootId, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to add or remove event listener
     *
     * @param rootId the root node id
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void updateEventListener(int rootId, byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.updateEventListener(rootId, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to measure text width and height
     *
     * @param rootId the root node id
     * @param nodeId the target node id
     * @param width pre setting of text width
     * @param widthMode flex measure mode of width
     * @param height pre setting of text height
     * @param heightMode flex measure mode of height
     * @return the measure result, convert to long type by FlexOutput
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public long measure(int rootId, int nodeId, float width, int widthMode, float height,
            int heightMode) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            return renderDelegate.measure(rootId, nodeId, width, widthMode, height, heightMode);
        }
        return 0;
    }

    /**
     * Call from native (C++) render manager to call ui component function
     *
     * @param rootId the root node id
     * @param nodeId the target node id
     * @param callbackId the callback id identifies the caller
     * @param functionName ui component function name
     * @param buffer the byte array serialize by native (C++)
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void callUIFunction(int rootId, int nodeId, long callbackId, String functionName,
            byte[] buffer) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                final List<Object> list = bytesToArgument(ByteBuffer.wrap(buffer));
                renderDelegate.callUIFunction(rootId, nodeId, callbackId, functionName, list);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    /**
     * Call from native (C++) render manager to mark batch end
     *
     * @param rootId the root node id
     */
    @CalledByNative
    @SuppressWarnings("unused")
    public void endBatch(int rootId) {
        NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
        if (renderDelegate != null) {
            try {
                renderDelegate.endBatch(rootId);
            } catch (NativeRenderException e) {
                renderDelegate.handleRenderException(e);
            }
        }
    }

    public void onSizeChanged(int rootId, int width, int height) {
        updateRootSize(mInstanceId, rootId, PixelUtil.px2dp(width), PixelUtil.px2dp(height));
    }

    public void freshWindow(int rootId) {
        freshWindow(mInstanceId, rootId);
    }

    public void onSizeChanged(int rootId, int nodeId, int width, int height, boolean isSync) {
        updateNodeSize(mInstanceId, rootId, nodeId, PixelUtil.px2dp(width), PixelUtil.px2dp(height),
                isSync);
    }

    /**
     * After handle call ui function, return the result to js through promise.
     *
     * @param result resolve {@link UIPromise#PROMISE_CODE_RESOLVE} reject {@link
     * UIPromise#PROMISE_CODE_REJECT}
     * @param callbackId call back id of js function
     * @param functionName call back function name
     * @param nodeId the dom node id
     * @param params parameters to be return to js
     */
    public void doPromiseCallBack(final int result, final long callbackId, @NonNull final String functionName,
            final int rootId, final int nodeId, @Nullable final Object params) {
        if (UIThreadUtils.isOnUiThread()) {
            doPromiseCallBackImpl(result, callbackId, functionName, rootId, nodeId, params);
        } else {
            UIThreadUtils.runOnUiThread(
                    () -> doPromiseCallBackImpl(result, callbackId, functionName, rootId, nodeId, params));
        }
    }

    @MainThread
    private void doPromiseCallBackImpl(int result, long callbackId, @NonNull String functionName,
            int rootId, int nodeId, @Nullable Object params) {
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
                NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
                if (renderDelegate != null) {
                    renderDelegate.handleRenderException(e);
                }
                return;
            }
        }
        doCallBack(mInstanceId, result, functionName, rootId, nodeId, callbackId, bytes, offset,
                length);
    }

    public void dispatchEvent(final int rootId, final int nodeId, @NonNull final String eventName,
            @Nullable final Object params, final boolean useCapture, final boolean useBubble) {
        if (UIThreadUtils.isOnUiThread()) {
            dispatchEventImpl(rootId, nodeId, eventName, params, useCapture, useBubble);
        } else {
            UIThreadUtils.runOnUiThread(
                    () -> dispatchEventImpl(rootId, nodeId, eventName, params, useCapture, useBubble));
        }
    }

    private void dispatchEventImpl(int rootId, int nodeId, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble) {
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
                NativeRenderDelegate renderDelegate = mRenderDelegateRef.get();
                if (renderDelegate != null) {
                    renderDelegate.handleRenderException(e);
                }
                return;
            }
        }
        onReceivedEvent(mInstanceId, rootId, nodeId, eventName, bytes, offset, length, useCapture,
                useBubble);
    }

    /**
     * Call back from Android system when size changed, just like horizontal and vertical screen
     * switching, call this jni interface to invoke dom tree relayout.
     *
     * @param rootId the root node id
     * @param instanceId the unique id of native (C++) render manager
     * @param width new width of root view, use dp unit
     * @param height new height of root view, use dp unit
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void updateRootSize(int instanceId, int rootId, float width, float height);

    /**
     * Call back from Android system when size changed, just like horizontal and vertical screen
     * switching, call this jni interface to invoke dom tree relayout.
     *
     * @param rootId the root node id
     * @param instanceId the unique id of native (C++) render manager
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void freshWindow(int instanceId, int rootId);

    /**
     * Call back from Android system when size changed, just like horizontal and vertical screen
     * switching, call this jni interface to invoke dom tree relayout.
     *
     * @param rootId the root node id
     */
    @SuppressWarnings("JavaJniMissingFunction")
    public native void markTextNodeDirty(int rootId);

    /**
     * Updates the size to the specified node, such as modal node, should set new window size before
     * layout.
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param rootId the root node id
     * @param nodeId the dom node id
     * @param width new width of node, use dp unit
     * @param height new height of node, use dp unit
     * @param isSync {@code true} call from create node on dom thread {@code false} call from
     * onSizeChanged on UI thread
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void updateNodeSize(int instanceId, int rootId, int nodeId, float width,
            float height, boolean isSync);

    /**
     * Dispatch event generated by native renderer to (C++) dom manager.
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param rootId the root node id
     * @param nodeId the target node id
     * @param eventName target event name
     * @param params params buffer encoded by serializer
     * @param offset start position of params buffer
     * @param length available total length of params buffer
     * @param useCapture enable event capture
     * @param useBubble enable event bubble
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void onReceivedEvent(int instanceId, int rootId, int nodeId, String eventName,
            byte[] params, int offset, int length, boolean useCapture, boolean useBubble);

    /**
     * Do promise call back to js after handle call ui function by native renderer,
     *
     * @param instanceId the unique id of native (C++) render manager
     * @param result {@code PROMISE_CODE_RESOLVE} {@link UIPromise} {@code PROMISE_CODE_REJECT}
     * {@link UIPromise}
     * @param functionName ui function name
     * @param rootId the root node id
     * @param nodeId the dom node id
     * @param callbackId the callback id identifies the caller
     * @param params params buffer encoded by serializer
     * @param offset start position of params buffer
     * @param length available total length of params buffer
     */
    @SuppressWarnings("JavaJniMissingFunction")
    private native void doCallBack(int instanceId, int result, String functionName, int rootId,
            int nodeId, long callbackId, byte[] params, int offset, int length);
}
