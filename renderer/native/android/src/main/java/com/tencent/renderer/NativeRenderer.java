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

import androidx.annotation.MainThread;
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
import java.util.Map;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

public class NativeRenderer implements NativeRender, NativeRenderProxy, NativeRenderDelegate {

    private static final String TAG = "NativeRenderer";
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
    private RenderManager mRenderManager;
    private VirtualNodeManager mVirtualNodeManager;
    private DomManager domManager;
    private HippyRootView mRootView;
    private FrameworkProxy mFrameworkProxy;
    private final NativeRenderProvider mRenderProvider;
    private final BlockingQueue<UITaskExecutor> mUITaskQueue;
    private List<HippyInstanceLifecycleEventListener> mInstanceLifecycleEventListeners;

    public NativeRenderer() {
        mRenderProvider = new NativeRenderProvider(this);
        NativeRendererManager.addNativeRendererInstance(mRenderProvider.getInstanceId(), this);
        // Should restrictions the capacity of ui task queue, to avoid js make huge amount of
        // node operation cause OOM.
        mUITaskQueue = new LinkedBlockingQueue<>(MAX_UI_TASK_QUEUE_CAPACITY);
    }

    @Override
    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        mRenderManager = new RenderManager(this, controllers);
        mVirtualNodeManager = new VirtualNodeManager(this);
        domManager = new DomManager(this);
        if (rootView instanceof HippyRootView) {
            mRenderManager.createRootNode(mRootId);
            mRenderManager.addRootView(rootView);
            mRootView = (HippyRootView) rootView;
            Context context = rootView.getContext();
            if (context instanceof NativeRenderContext) {
                // Render provider instance id has changed, should reset instance id
                // store in root view context.
                ((NativeRenderContext) context).setInstanceId(mRenderProvider.getInstanceId());
            }
        }
    }

    @Override
    public void setRootId(int rootId) {
        mRootId = rootId;
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

    @MainThread
    @Override
    public void postInvalidateDelayed(int id, long delayMilliseconds) {
        if (UIThreadUtils.isOnUiThread()) {
            mRenderManager.postInvalidateDelayed(id, delayMilliseconds);
        }
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
        if (mFrameworkProxy != null) {
            mFrameworkProxy.handleNativeException(exception);
        }
    }

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        mFrameworkProxy = proxy;
    }

    @Override
    public void destroy() {
        mRenderProvider.destroy();
        if (mRenderManager != null) {
            mRenderManager.destroy();
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
    public void updateDimension(boolean shouldRevise, Map<String, Object> dimension,
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
            boolean useCapture, boolean useBubble) {
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
            mInstanceLifecycleEventListeners = new ArrayList<>();
        }
        mInstanceLifecycleEventListeners.add(listener);
    }

    @Override
    public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.remove(listener);
        }
    }

    @Override
    public void createNode(@NonNull List<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object element = nodeList.get(i);
            if (!(element instanceof Map)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: invalid node object");
            }
            Map<String, Object> node = (Map) element;
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
            element = node.get(NODE_PROPS);
            final Map<String, Object> props =
                    (element instanceof HashMap) ? (Map) element : new HashMap<String, Object>();
            // Props may reset by framework modules, such as js AnimationModule,
            // key={animationId=xxx} => key=value
            onCreateNode(nodeId, props);
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
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.createNode(mRootView, id, pid, index, name, props);
                }
            };
            addUITask(task);
        }
        executeUITask();
    }

    @Override
    public void updateNode(@NonNull List<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object element = nodeList.get(i);
            if (!(element instanceof Map)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateNode: invalid node object");
            }
            Map<String, Object> node = (Map) element;
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
            element = node.get(NODE_PROPS);
            final Map<String, Object> props =
                    (element instanceof HashMap) ? (Map) element : new HashMap<String, Object>();
            // Props may reset by framework modules, such as js AnimationModule,
            // key={animationId=xxx} => key=value
            onUpdateNode(nodeId, props);
            mVirtualNodeManager.updateNode(nodeId, props);
            if (mVirtualNodeManager.hasVirtualParent(nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so don't add update task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.updateNode(id, props);
                }
            };
            addUITask(task);
        }
        executeUITask();
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
                // just delete the virtual node, not need to add UI delete task.
                mVirtualNodeManager.deleteNode(id);
                continue;
            }
            onDeleteNode(id);
            mVirtualNodeManager.deleteNode(id);
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.deleteNode(id);
                }
            };
            addUITask(task);
        }
        executeUITask();
    }

    @Override
    public void moveNode(final int[] ids, final int newPid, final int oldPid)
            throws NativeRenderException {
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.moveNode(ids, newPid, oldPid);
            }
        };
        addUITask(task);
        executeUITask();
    }

    @Override
    public void updateLayout(@NonNull List<Object> nodeList) throws NativeRenderException {
        for (int i = 0; i < nodeList.size(); i++) {
            Object element = nodeList.get(i);
            if (!(element instanceof Map)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: invalid node object");
            }
            Map<String, Object> layoutInfo = (Map) element;
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
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    if (supply != null) {
                        mRenderManager.updateExtra(id, supply);
                    }
                    mRenderManager.updateLayout(id, left, top, width, height);
                }
            };
            addUITask(task);
        }
        executeUITask();
    }

    @Override
    public void updateEventListener(@NonNull List<Object> eventList)
            throws NativeRenderException {
        for (int i = 0; i < eventList.size(); i++) {
            Object element = eventList.get(i);
            if (!(element instanceof Map)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateEventListener: invalid event object");
            }
            Map<String, Object> events = (Map) element;
            Map<String, Object> eventProps;
            int nodeId;
            try {
                nodeId = ((Number) Objects.requireNonNull(events.get(NODE_ID))).intValue();
                eventProps = (Map) Objects.requireNonNull(events.get(NODE_PROPS));
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
            final Map<String, Object> props = eventProps;
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.updateEventListener(id, props);
                }
            };
            addUITask(task);
        }
        executeUITask();
    }

    @Override
    public void measureInWindow(final int id, long callbackId) {
        if (callbackId == 0) {
            return;
        }
        final UIPromise promise = new UIPromise(callbackId, null, id,
                        mRenderProvider.getInstanceId());
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.measureInWindow(id, promise);
            }
        };
        addUITask(task);
        executeUITask();
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
    public void callUIFunction(final int id, final long callbackId,
            @NonNull final String functionName,
            @NonNull final List<Object> params) throws NativeRenderException {
        // The node id should not be negative number.
        if (id < 0) {
            throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                    TAG + ": callUIFunction: invalid negative id=" + id);
        }
        // If callbackId equal to 0 mean this call does not need to callback.
        final UIPromise promise =
                (callbackId == 0) ? null : new UIPromise(callbackId, functionName, id,
                        mRenderProvider.getInstanceId());
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.dispatchUIFunction(id, functionName, params, promise);
            }
        };
        addUITask(task);
        executeUITask();
    }

    @Override
    public void doPromiseCallBack(int result, long callbackId, @NonNull String functionName,
            int nodeId, @Nullable Object params) {
        if (mRenderProvider != null) {
            mRenderProvider.doPromiseCallBack(result, callbackId, functionName, nodeId, params);
        }
    }

    @Override
    public void endBatch() throws NativeRenderException {
        onEndBatch();
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.batch();
            }
        };
        addUITask(task);
        executeUITask();
    }

    private void onCreateNode(int nodeId, @NonNull final Map<String, Object> props) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).onCreateNode(nodeId, props);
        }
    }

    private void onUpdateNode(int nodeId, @NonNull final Map<String, Object> props) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).onUpdateNode(nodeId, props);
        }
    }

    private void onDeleteNode(int nodeId) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).onDeleteNode(nodeId);
        }
    }

    private void onEndBatch() {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).onEndBatch();
        }
    }

    private void addUITask(@NonNull UITaskExecutor task) throws NativeRenderException {
        try {
            // It is generally preferable to use add here, just focus the exception
            // when add failed, don't need to handle the return value.
            mUITaskQueue.add(task);
        } catch (ClassCastException | NullPointerException | IllegalArgumentException e) {
            throw new NativeRenderException(UI_TASK_QUEUE_ADD_ERR, e);
        } catch (IllegalStateException e) {
            // If the element cannot be added at this time due to capacity restrictions,
            // the main thread may blocked, serious error!!!
            mUITaskQueue.clear();
            throw new NativeRenderException(UI_TASK_QUEUE_UNAVAILABLE_ERR, e);
        }
    }

    private void executeUITask() {
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
                    executeUITask();
                }
            }
        });
    }

    private boolean checkJSFrameworkProxy() {
        return mFrameworkProxy instanceof JSFrameworkProxy;
    }
}
