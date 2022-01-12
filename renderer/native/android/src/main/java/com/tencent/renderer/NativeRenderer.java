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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.UI_TASK_QUEUE_ADD_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.UI_TASK_QUEUE_UNAVAILABLE_ERR;

import android.content.Context;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.link_supplier.proxy.framework.FontAdapter;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.framework.JSFrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.NativeRenderProxy;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.component.text.TextRenderSupply;
import com.tencent.renderer.component.text.VirtualNodeManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

public class NativeRenderer implements NativeRender, NativeRenderProxy, NativeRenderDelegate {

    private static final String TAG = "NativeRenderer";
    private static final AtomicInteger sRootIdCounter = new AtomicInteger(0);
    private static final int ROOT_VIEW_ID_INCREMENT = 10;
    private static final String NODE_ID = "id";
    private static final String NODE_PID = "pId";
    private static final String NODE_INDEX = "index";
    private static final String NODE_PROPS = "props";
    private static final String CLASS_NAME = "name";
    private static final String LAYOUT_LEFT = "left";
    private static final String LAYOUT_TOP = "top";
    private static final String LAYOUT_WIDTH = "width";
    private static final String LAYOUT_HEIGHT = "height";
    private static final int MAX_UI_TASK_QUEUE_CAPACITY = 10000;
    private static final int MAX_UI_TASK_QUEUE_EXEC_TIME = 400;
    private int mRootId;
    private boolean mIsDebugMode;
    private RenderManager mRenderManager;
    private VirtualNodeManager mVirtualNodeManager;
    private DomManager domManager;
    private HippyRootView mRootView;
    private FrameworkProxy mFrameworkProxy;
    private final NativeRenderProvider mRenderProvider;
    private volatile CopyOnWriteArrayList<HippyInstanceLifecycleEventListener> mInstanceLifecycleEventListeners;
    private BlockingQueue<UITaskExecutor> mUITaskQueue;

    public NativeRenderer() {
        mRenderProvider = new NativeRenderProvider(this);
        NativeRendererManager.addNativeRendererInstance(mRenderProvider.getInstanceId(), this);
    }

    @Override
    public void init(@Nullable List<Class<?>> controllers,
            boolean isDebugMode, @Nullable ViewGroup rootView) {
        mRenderManager = new RenderManager(this, controllers);
        mVirtualNodeManager = new VirtualNodeManager(this);
        domManager = new DomManager(this);
        if (rootView instanceof HippyRootView) {
            mRootId = rootView.getId();
            mRenderManager.createRootNode(mRootId);
            mRenderManager.addRootView(rootView);
            mRootView = (HippyRootView) rootView;
        } else {
            mRootId = sRootIdCounter.addAndGet(ROOT_VIEW_ID_INCREMENT);
        }
        mIsDebugMode = isDebugMode;
        // Should restrictions the capacity of ui task queue, to avoid js make huge amount of
        // node operation cause OOM.
        mUITaskQueue = new LinkedBlockingQueue<>(MAX_UI_TASK_QUEUE_CAPACITY);
    }

    @Override
    public int getInstanceId() {
        return mRenderProvider.getInstanceId();
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
    @Nullable
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
    public void handleRenderException(@NonNull Exception exception) {
        String msg;
        if (exception instanceof NativeRenderException) {
            msg = "code: " + ((NativeRenderException) exception).mCode + ", message: " + exception
                    .getMessage();
        } else {
            msg = exception.getMessage();
        }
        LogUtils.e(TAG, msg);
        reportException(exception);
    }

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        mFrameworkProxy = proxy;
    }

    @Override
    public void destroy() {
        if (mRenderManager != null) {
            mRenderManager.destroy();
        }
        if (mRenderProvider != null) {
            mRenderProvider.destroy();
        }
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.clear();
        }
        mRootView = null;
        mFrameworkProxy = null;
        NativeRendererManager.removeNativeRendererInstance(mRenderProvider.getInstanceId());
    }

    @Override
    @NonNull
    public ViewGroup createRootView(@NonNull Context context) {
        if (mRootView == null) {
            mRootView = new HippyRootView(context, mRenderProvider.getInstanceId(), mRootId);
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

    }

    @Override
    public void updateDimension(boolean shouldRevise, HashMap<String, Object> dimension,
            boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).updateDimension(shouldRevise, dimension,
                    shouldUseScreenDisplay, systemUiVisibilityChanged);
        }
    }

    /**
     * Dispatch UI component event, such as onLayout, onScroll, onInitialListReady.
     *
     * @param id target node id
     * @param eventName target event name
     * @param params event extra params object
     */
    @Override
    public void dispatchUIComponentEvent(int id, String eventName, @Nullable Object params) {
        if (mRenderProvider != null) {
            // UI component event default disable capture and bubble phase,
            // can not enable both in native and js.
            mRenderProvider.dispatchEvent(id, eventName, params, false, false);
        }
    }

    /**
     * Dispatch gesture event, such as onClick, onLongClick, onPressIn, onPressOut, onTouchDown,
     * onTouchMove, onTouchEnd, onTouchCancel.
     *
     * @param id target node id
     * @param eventName target event name
     * @param params event extra params object
     */
    @Override
    public void dispatchNativeGestureEvent(int id, String eventName, @Nullable Object params) {
        if (mRenderProvider != null) {
            // Gesture event default enable capture and bubble phase, can not disable in native,
            // but can stop propagation in js.
            mRenderProvider.dispatchEvent(id, eventName, params, true, true);
        }
    }

    /**
     * Dispatch custom event which capture and bubble state can set by user
     *
     * @param id target node id
     * @param eventName target event name
     * @param params event extra params object
     * @param useCapture enable event capture
     * @param useBubble enable event bubble
     */
    @Override
    @SuppressWarnings("unused")
    public void dispatchCustomEvent(int id, String eventName, @Nullable Object params,
            boolean useCapture,
            boolean useBubble) {
        if (mRenderProvider != null) {
            mRenderProvider.dispatchEvent(id, eventName, params, useCapture, useBubble);
        }
    }

    @Override
    public void onResume() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceResume();
            }
        }
    }

    @Override
    public void onPause() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstancePause();
            }
        }
    }

    @Override
    public void onRootDestroy() {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceDestroy();
            }
        }
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
                long start = System.currentTimeMillis();
                UITaskExecutor task = mUITaskQueue.poll();
                while (task != null) {
                    task.exec();
                    // If there has large number node operation task in queue,
                    // it is possible cause ANR because of takes a lot of time to handle the task,
                    // so we should interrupt it and re-run in next event cycle again.
                    if (System.currentTimeMillis() - start > MAX_UI_TASK_QUEUE_EXEC_TIME) {
                        LogUtils.e(TAG, "execute ui task exceed 400ms!!!");
                        break;
                    }
                    task = mUITaskQueue.poll();
                }
                if (!mUITaskQueue.isEmpty()) {
                    executeUIOperation();
                }
            }
        });
    }

    @Override
    public void createNode(@NonNull ArrayList<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: invalid node object");
            }
            HashMap<String, Object> node = (HashMap) object;
            int nodeId;
            int nodePid;
            int nodeIndex;
            String className;
            try {
                nodeId = ((Number) Objects.requireNonNull(node.get(NODE_ID))).intValue();
                nodePid = ((Number) Objects.requireNonNull(node.get(NODE_PID))).intValue();
                nodeIndex = ((Number) Objects.requireNonNull(node.get(NODE_INDEX))).intValue();
                className = (String) Objects.requireNonNull(node.get(CLASS_NAME));
            } catch (NullPointerException e) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR, e);
            }
            // The node id, pid and index should not be negative number.
            if (nodeId < 0 || nodePid < 0 || nodeIndex < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: id=" + nodeId + ", pId=" + nodePid + ", index="
                                + nodeIndex);
            }
            final HashMap<String, Object> props = (HashMap) node.get(NODE_PROPS);
            mVirtualNodeManager.createNode(nodeId, nodePid, nodeIndex, className, props);
            if (mVirtualNodeManager.hasVirtualParent(nodeId)) {
                // If the node has a virtual parent, no need to create corresponding render node,
                // so don't add create task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            final int pid = nodePid;
            final int index = nodeIndex;
            final String name = className;
            try {
                // It is generally preferable to use add here, just focus the exception
                // when add failed, don't need to handle the return value.
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.createNode(mRootView, id, pid, index, name, props);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
                throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
            } catch (IllegalStateException e) {
                // If the element cannot be added at this time due to capacity restrictions,
                // the main thread may blocked, serious error!!!
                mUITaskQueue.clear();
                throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
            }
        }
        executeUIOperation();
    }

    @Override
    public void updateNode(@NonNull ArrayList<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateNode: invalid node object");
            }
            HashMap<String, Object> node = (HashMap) object;
            int nodeId;
            try {
                nodeId = ((Number) Objects.requireNonNull(node.get(NODE_ID))).intValue();
            } catch (NullPointerException e) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR, e);
            }
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateNode: invalid negative id=" + nodeId);
            }
            final HashMap<String, Object> props = (HashMap) node.get(NODE_PROPS);
            mVirtualNodeManager.updateNode(nodeId, props);
            if (mVirtualNodeManager.hasVirtualParent(nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so don't add update task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            try {
                // It is generally preferable to use add here, just focus the exception
                // when add failed, don't need to handle the return value.
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.updateNode(id, props);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
                throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
            } catch (IllegalStateException e) {
                // If the element cannot be added at this time due to capacity restrictions,
                // the main thread may blocked, serious error!!!
                mUITaskQueue.clear();
                throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
            }
        }
        executeUIOperation();
    }

    @Override
    public void deleteNode(@NonNull int[] ids) throws NativeRenderException {
        for (final int id : ids) {
            // The node id should not be negative number.
            if (id < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": deleteNode: invalid negative id=" + id);
            }
            if (mVirtualNodeManager.hasVirtualParent(id)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so just delete the virtual node, .
                mVirtualNodeManager.deleteNode(id);
                continue;
            }
            mVirtualNodeManager.deleteNode(id);
            try {
                // It is generally preferable to use add here, just focus the exception
                // when add failed, don't need to handle the return value.
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.deleteNode(id);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
                throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
            } catch (IllegalStateException e) {
                // If the element cannot be added at this time due to capacity restrictions,
                // the main thread may blocked, serious error!!!
                mUITaskQueue.clear();
                throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
            }
        }
        executeUIOperation();
    }

    @Override
    public void updateLayout(@NonNull ArrayList<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: invalid node object");
            }
            HashMap<String, Object> layoutInfo = (HashMap) object;
            int nodeId;
            float layoutLeft;
            float layoutTop;
            float layoutWidth;
            float layoutHeight;
            try {
                nodeId = ((Number) Objects.requireNonNull(layoutInfo.get(NODE_ID))).intValue();
                layoutLeft = ((Number) Objects.requireNonNull(layoutInfo.get(LAYOUT_LEFT)))
                        .floatValue();
                layoutTop = ((Number) Objects.requireNonNull(layoutInfo.get(LAYOUT_TOP)))
                        .floatValue();
                layoutWidth = ((Number) Objects.requireNonNull(layoutInfo.get(LAYOUT_WIDTH)))
                        .floatValue();
                layoutHeight = ((Number) Objects.requireNonNull(layoutInfo.get(LAYOUT_HEIGHT)))
                        .floatValue();
            } catch (NullPointerException e) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR, e);
            }
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: invalid negative id=" + nodeId);
            }
            if (mVirtualNodeManager.hasVirtualParent(nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so don't add update task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            final int left = Math.round(layoutLeft);
            final int top = Math.round(layoutTop);
            final int width = Math.round(layoutWidth);
            final int height = Math.round(layoutHeight);
            final TextRenderSupply supply = mVirtualNodeManager
                    .updateLayout(nodeId, layoutWidth, layoutInfo);
            try {
                // It is generally preferable to use add here, just focus the exception
                // when add failed, don't need to handle the return value.
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        if (supply != null) {
                            mRenderManager.updateExtra(id, supply);
                        }
                        mRenderManager.updateLayout(id, left, top, width, height);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
                throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
            } catch (IllegalStateException e) {
                // If the element cannot be added at this time due to capacity restrictions,
                // the main thread may blocked, serious error!!!
                mUITaskQueue.clear();
                throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
            }
        }
        executeUIOperation();
    }

    @Override
    public void updateEventListener(@NonNull ArrayList<Object> eventList)
            throws NativeRenderException {
        for (int i = 0; i < eventList.size(); i++) {
            Object object = eventList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateEventListener: invalid event object");
            }
            HashMap<String, Object> events = (HashMap) object;
            HashMap<String, Object> eventProps;
            int nodeId;
            try {
                nodeId = ((Number) Objects.requireNonNull(events.get(NODE_ID))).intValue();
                eventProps = (HashMap) Objects.requireNonNull(events.get(NODE_PROPS));
            } catch (NullPointerException e) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR, e);
            }
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateEventListener: invalid negative id=" + nodeId);
            }
            boolean hasUpdate = mVirtualNodeManager.updateEventListener(nodeId, eventProps);
            if (hasUpdate) {
                // Virtual node gesture event listener add by itself, no need to
                // update render node.
                continue;
            }
            final int id = nodeId;
            final HashMap<String, Object> props = eventProps;
            try {
                // It is generally preferable to use add here, just focus the exception
                // when add failed, don't need to handle the return value.
                mUITaskQueue.add(new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.updateEventListener(id, props);
                    }
                });
            } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
                throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
            } catch (IllegalStateException e) {
                // If the element cannot be added at this time due to capacity restrictions,
                // the main thread may blocked, serious error!!!
                mUITaskQueue.clear();
                throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
            }
        }
        executeUIOperation();
    }

    @Override
    public long measure(int id, float width, int widthMode, float height, int heightMode) {
        try {
            FlexMeasureMode flexMeasureMode = FlexMeasureMode.fromInt(widthMode);
            return mVirtualNodeManager.measure(id, width, flexMeasureMode);
        } catch (NativeRenderException e) {
            handleRenderException(e);
        }
        return FlexOutput.make(width, height);
    }

    @Override
    public void callUIFunction(final int id, final String functionName,
            @NonNull final ArrayList<Object> params) throws NativeRenderException {
        // The node id should not be negative number.
        if (id < 0) {
            throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                    TAG + ": callUIFunction: invalid negative id=" + id);
        }
        final NativeRenderPromise promise = new NativeRenderPromise(functionName, id,
                mRenderProvider.getInstanceId());
        try {
            // It is generally preferable to use add here, just focus the exception
            // when add failed, don't need to handle the return value.
            mUITaskQueue.add(new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.dispatchUIFunction(id, functionName, params, promise);
                }
            });
        } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
            throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
        } catch (IllegalStateException e) {
            // If the element cannot be added at this time due to capacity restrictions,
            // the main thread may blocked, serious error!!!
            mUITaskQueue.clear();
            throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
        }
    }

    @Override
    public void doPromiseCallBack(int result, String functionName, int nodeId, Object params) {
        if (mRenderProvider != null) {
            mRenderProvider.doPromiseCallBack(result, functionName, nodeId, params);
        }
    }

    @Override
    public void startBatch() {
        // TODO: Just keep this method even if it don't do anything.
    }

    @Override
    public void endBatch() {
        try {
            // It is generally preferable to use add here, just focus the exception
            // when add failed, don't need to handle the return value.
            mUITaskQueue.add(new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.batch();
                }
            });
            executeUIOperation();
        } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
            throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
        } catch (IllegalStateException e) {
            // If the element cannot be added at this time due to capacity restrictions,
            // the main thread may blocked, serious error!!!
            mUITaskQueue.clear();
            throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
        }
    }

    public void reportException(Exception exception) {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.handleNativeException(exception, true);
        }
    }

    private boolean checkJSFrameworkProxy() {
        return mFrameworkProxy instanceof JSFrameworkProxy;
    }
}
