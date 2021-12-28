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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;

import android.content.Context;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.hippy.support.FontAdapter;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.component.text.TextRenderSupply;
import com.tencent.renderer.component.text.VirtualNode;
import com.tencent.renderer.component.text.VirtualNodeManager;

import com.tencent.renderer.serialization.Serializer;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.hippy.support.FrameworkProxy;
import com.tencent.hippy.support.JSFrameworkProxy;
import com.tencent.hippy.support.NativeRenderProxy;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

public class NativeRenderer implements NativeRender, NativeRenderProxy, NativeRenderDelegate {

    public static final String TAG = "NativeRenderer";

    private final String NODE_ID = "id";
    private final String NODE_PID = "pId";
    private final String NODE_INDEX = "index";
    private final String NODE_PROPS = "props";
    private final String CLASS_NAME = "name";
    private final String LAYOUT_LEFT = "left";
    private final String LAYOUT_TOP = "top";
    private final String LAYOUT_WIDTH = "width";
    private final String LAYOUT_HEIGHT = "height";
    private final int MAX_UITASK_QUEUE_CAPACITY = 10000;
    private final int MAX_UITASK_QUEUE_EXEC_TIME = 400;
    private static final int ROOT_VIEW_TAG_INCREMENT = 10;
    private static final AtomicInteger sCounter = new AtomicInteger(0);
    private int mInstanceId;
    private int mRootId;
    private boolean mIsDebugMode;
    private RenderManager mRenderManager;
    private VirtualNodeManager mVirtualNodeManager;
    private DomManager domManager;
    private HippyRootView mRootView;
    private FrameworkProxy mFrameworkProxy;
    private NativeRenderProvider mRenderProvider;
    private volatile CopyOnWriteArrayList<HippyInstanceLifecycleEventListener> mInstanceLifecycleEventListeners;
    private BlockingQueue<UITaskExecutor> mUITaskQueue;
    private SafeHeapWriter mSafeHeapWriter;
    private Serializer mSerializer;

    @Override
    public void init(int instanceId, @Nullable List<Class> controllers,
            boolean isDebugMode, @Nullable ViewGroup rootView) {
        mRenderManager = new RenderManager(this, controllers);
        mVirtualNodeManager = new VirtualNodeManager(this);
        domManager = new DomManager(this);
        if (rootView instanceof HippyRootView) {
            mRootId = rootView.getId();
            mRenderManager.createRootNode(mRootId);
            mRenderManager.addRootView(rootView);
            this.mRootView = (HippyRootView) rootView;
        } else {
            mRootId = sCounter.addAndGet(ROOT_VIEW_TAG_INCREMENT);
        }
        mInstanceId = instanceId;
        mIsDebugMode = isDebugMode;
        // Should restrictions the capacity of ui task queue, to avoid js make huge amount of
        // node operation cause OOM.
        mUITaskQueue = new LinkedBlockingQueue<>(MAX_UITASK_QUEUE_CAPACITY);
        mSerializer = new Serializer();
        NativeRendererManager.addNativeRendererInstance(instanceId, this);
    }

    @Override
    public Object getCustomViewCreator() {
        if (checkJSFrameworkProxy()) {
            return ((JSFrameworkProxy) mFrameworkProxy).getCustomViewCreator();
        }
        return null;
    }

    @Override
    public String getBundlePath() {
        if (checkJSFrameworkProxy()) {
            return ((JSFrameworkProxy) mFrameworkProxy).getBundlePath();
        }
        return null;
    }

    @Override
    public IImageLoaderAdapter getImageLoaderAdapter() {
        if (checkJSFrameworkProxy()) {
            Object adapterObj = ((JSFrameworkProxy) mFrameworkProxy).getImageLoaderAdapter();
            if (adapterObj instanceof IImageLoaderAdapter) {
                return (IImageLoaderAdapter) adapterObj;
            }
        }
        return null;
    }

    @Override
    public FontAdapter getFontAdapter() {
        if (mFrameworkProxy != null) {
            return mFrameworkProxy.getFontAdapter();
        }
        return null;
    }

    @Override
    public boolean isDebugMode() {
        return mIsDebugMode;
    }

    @Override
    public void handleRenderException(Exception exception) {
        LogUtils.e(TAG, "Received native render exception: " + exception.getMessage());
        reportException(exception);
    }

    @Override
    public void setFrameworkProxy(FrameworkProxy proxy) {
        mFrameworkProxy = proxy;
    }

    @Override
    public void destroy() {
        if (domManager != null) {
            ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
            if (threadExecutor != null) {
                threadExecutor.postOnDomThread(new Runnable() {
                    @Override
                    public void run() {
                        domManager.destroy();
                    }
                });
            }
        }
        if (mRenderManager != null) {
            mRenderManager.destroy();
        }
        if (mRenderProvider != null) {
            mRenderProvider.destroy();
            mRenderProvider = null;
        }
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.clear();
        }
        mRootView = null;
        mFrameworkProxy = null;
        NativeRendererManager.removeNativeRendererInstance(mInstanceId);
    }

    @Override
    public @NonNull
    ViewGroup createRootView(@NonNull Context context) {
        if (mRootView == null) {
            mRootView = new HippyRootView(context, mInstanceId, mRootId);
            mRenderManager.createRootNode(mRootId);
            mRenderManager.addRootView(mRootView);
        }
        return mRootView;
    }

    @Override
    public Object getDomManagerObject() {
        return getDomManager();
    }

    @Override
    public Object getRenderManagerObject() {
        return getRenderManager();
    }

    @Override
    public RenderManager getRenderManager() {
        return mRenderManager;
    }

    @Override
    public DomManager getDomManager() {
        return domManager;
    }

    @Override
    public ViewGroup getRootView() {
        return mRootView;
    }

    @Override
    public int getRootId() {
        return mRootId;
    }

    @Override
    public void onFirstViewAdded() {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.onFirstViewAdded();
        }
    }

    @Override
    public void onSizeChanged(int w, int h, int oldw, int oldh) {
        if (mRenderProvider != null) {
            LogUtils.d(TAG, "onSizeChanged: w=" + w + ", h=" + h + ", oldw="
                    + oldw + ", oldh=" + oldh);
            mRenderProvider.onSizeChanged(w, h);
        }
    }

    @Override
    public void updateModalHostNodeSize(final int id, final int width, final int height) {
        ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
        if (threadExecutor != null) {
            threadExecutor.postOnDomThread(new Runnable() {
                @Override
                public void run() {
                    getDomManager().updateNodeSize(id, width, height);
                }
            });
        }
    }

    @Override
    public void updateDimension(boolean shouldRevise, HippyMap dimension,
            boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).updateDimension(shouldRevise, dimension,
                    shouldUseScreenDisplay, systemUiVisibilityChanged);
        }
    }

    private @NonNull ByteBuffer argumentToBytes(@NonNull Object params) {
        if (mSafeHeapWriter == null) {
            mSafeHeapWriter = new SafeHeapWriter();
        } else {
            mSafeHeapWriter.reset();
        }
        mSerializer.setWriter(mSafeHeapWriter);
        mSerializer.reset();
        mSerializer.writeHeader();
        mSerializer.writeValue(params);
        ByteBuffer buffer = mSafeHeapWriter.chunked();
        return buffer;
    }

    @Override
    public void dispatchUIComponentEvent(int id, String eventName, Object params) {
        if (mRenderProvider == null) {
            return;
        }
        try {
            ByteBuffer buffer = argumentToBytes(params);
            if (buffer == null || buffer.limit() == 0) {
                return;
            }
            mRenderProvider.dispatchUIComponentEvent(id, eventName, buffer);
        } catch (Exception exception) {
            handleRenderException(exception);
        }
    }

    @Override
    public void dispatchNativeGestureEvent(int domId, String eventName, Object params) {
        if (mRenderProvider == null) {
            return;
        }
        try {
            ByteBuffer buffer = argumentToBytes(params);
            if (buffer == null || buffer.limit() == 0) {
                return;
            }
            mRenderProvider.dispatchNativeGestureEvent(domId, eventName, buffer);
        } catch (Exception exception) {
            handleRenderException(exception);
        }
    }

    @Override
    public void onInstanceLoad() {

    }

    @Override
    public void onInstanceResume() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceResume();
            }
        }
    }

    @Override
    public void onInstancePause() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstancePause();
            }
        }
    }

    @Override
    public void onInstanceDestroy() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceDestroy();
            }
        }
    }

    @Override
    public void onRuntimeInitialized(long runtimeId) {
        mRenderProvider = new NativeRenderProvider(this, runtimeId);
    }

    @Override
    public void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
        if (mInstanceLifecycleEventListeners == null) {
            mInstanceLifecycleEventListeners = new CopyOnWriteArrayList<>();
        }
        mInstanceLifecycleEventListeners.add(listener);
    }

    @Override
    public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.remove(listener);
        }
    }

    private void executeUIOperation() {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                LogUtils.d(TAG, "UI task queue size=" + mUITaskQueue.size());
                try {
                    long start = System.currentTimeMillis();
                    UITaskExecutor task = mUITaskQueue.poll();
                    while (task != null) {
                        task.exec();
                        // If there has large number node operation task in queue,
                        // it is possible cause ANR because of takes a lot of time to handle the task,
                        // so we should interrupt it and re-run in next event cycle again.
                        if (System.currentTimeMillis() - start > MAX_UITASK_QUEUE_EXEC_TIME) {
                            LogUtils.e(TAG, "execute ui task exceed 400ms!!!");
                            break;
                        }
                        task = mUITaskQueue.poll();
                    }
                } catch (Exception exception) {
                    handleRenderException(exception);
                }
                if (!mUITaskQueue.isEmpty()) {
                    executeUIOperation();
                }
            }
        });
    }

    @Override
    public void createNode(@NonNull ArrayList nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: invalid object");
            }
            HashMap<String, Object> node = (HashMap) object;
            final int id = ((Number) node.get(NODE_ID)).intValue();
            final int pid = ((Number) node.get(NODE_PID)).intValue();
            final int index = ((Number) node.get(NODE_INDEX)).intValue();
            if (id < 0 || pid < 0 || index < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: " + "id=" + id + ", pId=" + pid + ", index="
                                + index);
            }
            final String className = (String) node.get(CLASS_NAME);
            final HashMap<String, Object> props = (HashMap) node.get(NODE_PROPS);
            VirtualNode virtualParent = mVirtualNodeManager.getVirtualNode(pid);
            if (className.equals(NodeProps.TEXT_CLASS_NAME) || virtualParent != null) {
                mVirtualNodeManager.createVirtualNode(id, pid, index, className, props);
            }
            // If the node has virtual parent, not need to create render node.
            if (virtualParent != null) {
                continue;
            }
            try {
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.createNode(mRootView, id, pid, index, className, props);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException exception) {
                // If the element can not being added to this queue, just try next.
                handleRenderException(exception);
            } catch (IllegalStateException illegalStateException) {
                // If the element cannot be added at this time due to capacity restrictions,
                // when this unexpected happened, should break right now.
                handleRenderException(illegalStateException);
                break;
            }
        }
        executeUIOperation();
    }

    @Override
    public void updateNode(@NonNull ArrayList nodeList) {

    }

    @Override
    public void deleteNode(ArrayList nodeList) {

    }

    @Override
    public void updateLayout(@NonNull ArrayList nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: " + "object=" + object);
            }
            HashMap<String, Object> layoutInfo = (HashMap) object;
            final int id = ((Number) layoutInfo.get(NODE_ID)).intValue();
            final int left = ((Number) layoutInfo.get(LAYOUT_LEFT)).intValue();
            final int top = ((Number) layoutInfo.get(LAYOUT_TOP)).intValue();
            final int width = ((Number) layoutInfo.get(LAYOUT_WIDTH)).intValue();
            final int height = ((Number) layoutInfo.get(LAYOUT_HEIGHT)).intValue();
            boolean invisible = mVirtualNodeManager.isInvisibleNode(id);
            // If the node is invisible, there is no corresponding render node,
            // also no need to update layout.
            if (invisible) {
                continue;
            }
            final TextRenderSupply supply = mVirtualNodeManager
                    .updateLayout(id, width, layoutInfo);
            try {
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        if (supply != null) {
                            mRenderManager.updateExtra(id, supply);
                        }
                        mRenderManager.updateLayout(id, left, top, width, height);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException exception) {
                // If the element can not being added to this queue, just try next.
                handleRenderException(exception);
            } catch (IllegalStateException illegalStateException) {
                // If the element cannot be added at this time due to capacity restrictions,
                // when this unexpected happened, should return right now.
                handleRenderException(illegalStateException);
                return;
            }
        }
        executeUIOperation();
    }

    @Override
    public void updateGestureEventListener(@NonNull ArrayList eventList) {
        for (int i = 0; i < eventList.size(); i++) {
            Object object = eventList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: " + "object=" + object);
            }
            HashMap<String, Object> events = (HashMap) object;
            final int id = ((Number) events.get(NODE_ID)).intValue();
            final HashMap<String, Object> props = (HashMap) events.get(NODE_PROPS);
            boolean hasUpate = mVirtualNodeManager.updateGestureEventListener(id, props);
            // Gesture event status of virtual node update by itself, no need to update render node.
            if (hasUpate) {
                continue;
            }
            try {
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.updateGestureEventListener(id, props);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException exception) {
                // If the element can not being added to this queue, just try next.
                handleRenderException(exception);
            } catch (IllegalStateException illegalStateException) {
                // If the element cannot be added at this time due to capacity restrictions,
                // when this unexpected happened, should return right now.
                handleRenderException(illegalStateException);
                return;
            }
        }
        executeUIOperation();
    }

    @Override
    public long measure(int id, float width, int widthMode, float height, int heightMode) {
        try {
            FlexMeasureMode flexMeasureMode = FlexMeasureMode.fromInt(widthMode);
            return mVirtualNodeManager.measure(id, width, flexMeasureMode);
        } catch (IllegalStateException | IllegalArgumentException exception) {
            handleRenderException(exception);
        }
        return FlexOutput.make(width, height);
    }

    @Override
    public void startBatch() {

    }

    @Override
    public void endBatch() {
        try {
            mUITaskQueue.add(new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.batch();
                }
            });
            executeUIOperation();
        } catch (IllegalStateException | ClassCastException
                | NullPointerException | IllegalArgumentException exception) {
            handleRenderException(exception);
        }
    }

    public void reportException(Exception exception) {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.handleNativeException(exception, true);
        }
    }

    public ThreadExecutor getJSEngineThreadExecutor() {
        if (!checkJSFrameworkProxy()) {
            return null;
        }
        return ((JSFrameworkProxy) mFrameworkProxy).getJSEngineThreadExecutor();
    }

    private boolean checkJSFrameworkProxy() {
        if (!(mFrameworkProxy instanceof JSFrameworkProxy)) {
            return false;
        }
        return true;
    }
}
