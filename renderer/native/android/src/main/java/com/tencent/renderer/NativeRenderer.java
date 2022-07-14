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
import android.text.Layout;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.framework.FontAdapter;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.JSFrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.NativeRenderProxy;
import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.views.modal.HippyModalHostManager;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.component.text.VirtualNode;
import com.tencent.renderer.component.text.VirtualNodeManager;

import com.tencent.renderer.utils.DisplayUtils;

import com.tencent.renderer.utils.EventUtils.EventType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.renderer.utils.FlexUtils;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;

public class NativeRenderer extends Renderer implements NativeRender, NativeRenderProxy,
        NativeRenderDelegate {

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
    @Nullable
    private FrameworkProxy mFrameworkProxy;
    @Nullable
    private List<HippyInstanceLifecycleEventListener> mInstanceLifecycleEventListeners;
    @NonNull
    private final NativeRenderProvider mRenderProvider;
    @NonNull
    private final BlockingQueue<UITaskExecutor> mUITaskQueue;
    @NonNull
    private final RenderManager mRenderManager;
    @NonNull
    private final VirtualNodeManager mVirtualNodeManager;

    public NativeRenderer() {
        mRenderProvider = new NativeRenderProvider(this);
        NativeRendererManager.addNativeRendererInstance(mRenderProvider.getInstanceId(), this);
        // Should restrictions the capacity of ui task queue, to avoid js make huge amount of
        // node operation cause OOM.
        mUITaskQueue = new LinkedBlockingQueue<>(MAX_UI_TASK_QUEUE_CAPACITY);
        mRenderManager = new RenderManager(this);
        mVirtualNodeManager = new VirtualNodeManager(this);
    }

    @Override
    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        mRenderManager.init(controllers);
        if (rootView instanceof HippyRootView) {
            mRenderManager.createRootNode(rootView.getId());
            mRenderManager.addRootView(rootView);
            Context context = rootView.getContext();
            if (context instanceof NativeRenderContext) {
                // Render provider instance id has changed, should reset instance id
                // store in root view context.
                ((NativeRenderContext) context).setInstanceId(mRenderProvider.getInstanceId());
            }
        }
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
    @Nullable
    public ImageLoaderAdapter getImageLoaderAdapter() {
        if (mFrameworkProxy != null) {
            return mFrameworkProxy.getImageLoaderAdapter();
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
    public void postInvalidateDelayed(int roodId, int id, long delayMilliseconds) {
        if (UIThreadUtils.isOnUiThread()) {
            mRenderManager.postInvalidateDelayed(roodId, id, delayMilliseconds);
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
        mRenderManager.destroy();
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.clear();
        }
        mFrameworkProxy = null;
        NativeRendererManager.removeNativeRendererInstance(mRenderProvider.getInstanceId());
    }

    @Override
    @NonNull
    public View createRootView(@NonNull Context context, int rootId) {
        View rootView = mRenderManager.getRootView(rootId);
        if (rootView == null) {
            rootView = new HippyRootView(context, mRenderProvider.getInstanceId(), rootId);
            mRenderManager.createRootNode(rootId);
            mRenderManager.addRootView(rootView);
        }
        return rootView;
    }

    @Override
    @NonNull
    public RenderManager getRenderManager() {
        return mRenderManager;
    }

    @Override
    @Nullable
    public View getRootView(int rootId) {
        return mRenderManager.getRootView(rootId);
    }

    @Override
    @Nullable
    public View getRootView(@NonNull View view) {
        Context context = view.getContext();
        if (context instanceof NativeRenderContext) {
            int rootId = ((NativeRenderContext) context).getRootId();
            return getRootView(rootId);
        }
        return null;
    }

    @Override
    public void onFirstViewAdded() {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.onFirstViewAdded();
        }
    }

    @Override
    public void onRuntimeInitialized(final int rootId) {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                View rootView = getRootView(rootId);
                if (rootView != null) {
                    final int width = rootView.getWidth();
                    final int height = rootView.getHeight();
                    if (width > 0 && height > 0) {
                        onSizeChanged(rootId, width, height);
                    }
                }
            }
        });
    }

    @Override
    public void onSizeChanged(int rootId, int w, int h) {
        mRenderProvider.onSizeChanged(rootId, w, h);
    }

    @Override
    public void onSizeChanged(int rootId, int nodeId, int width, int height, boolean isSync) {
        mRenderProvider.onSizeChanged(rootId, nodeId, width, height, isSync);
    }

    @Override
    public void updateDimension(int width, int height, boolean shouldUseScreenDisplay,
            boolean systemUiVisibilityChanged) {
        if (checkJSFrameworkProxy()) {
            ((JSFrameworkProxy) mFrameworkProxy).updateDimension(width, height,
                    shouldUseScreenDisplay, systemUiVisibilityChanged);
        }
    }

    /**
     * Dispatch UI component event, such as onLayout, onScroll, onInitialListReady.
     *
     * @param rootId root node id
     * @param nodeId target node id
     * @param eventName target event name
     * @param params event extra params object
     * @param eventType event type {@link EventType}
     */
    @Override
    public void dispatchEvent(int rootId, int nodeId, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble, EventType eventType) {
        // Because the native(C++) DOM use lowercase names, convert to lowercase here before call JNI.
        String lowerCaseEventName = eventName.toLowerCase();
        if (eventType != EventType.EVENT_TYPE_GESTURE && !mRenderManager.checkRegisteredEvent(
                rootId,
                nodeId, lowerCaseEventName)) {
            return;
        }
        mRenderProvider.dispatchEvent(rootId, nodeId, lowerCaseEventName, params, useCapture,
                useBubble);
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

    @MainThread
    @Override
    public void onRootDestroy(int rootId) {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceDestroy(rootId);
            }
        }
        mRenderManager.deleteNode(rootId, rootId);
        mRenderManager.batch(rootId);
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

    private UITaskExecutor getMassTaskExecutor(@NonNull final List<UITaskExecutor> taskList) {
        return new UITaskExecutor() {
            @Override
            public void exec() {
                for (UITaskExecutor task : taskList) {
                    task.exec();
                }
            }
        };
    }

    @SuppressWarnings("rawtypes")
    @Override
    public void createNode(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>();
        for (int i = 0; i < nodeList.size(); i++) {
            Object element = nodeList.get(i);
            if (!(element instanceof Map)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: invalid node object");
            }
            Map node = (Map) element;
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
            mVirtualNodeManager.createNode(rootId, nodeId, nodePid, nodeIndex, className, props);
            if (mVirtualNodeManager.hasVirtualParent(rootId, nodeId)) {
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
                    mRenderManager.createNode(rootId, id, pid, index, name, props);
                }
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @SuppressWarnings("rawtypes")
    @Override
    public void updateNode(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>();
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
            mVirtualNodeManager.updateNode(rootId, nodeId, props);
            if (mVirtualNodeManager.hasVirtualParent(rootId, nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so don't add update task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.updateNode(rootId, id, props);
                }
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public void deleteNode(final int rootId, @NonNull int[] ids) throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>();
        for (final int nodeId : ids) {
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": deleteNode: invalid negative id=" + nodeId);
            }
            if (mVirtualNodeManager.hasVirtualParent(rootId, nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // just delete the virtual node, not need to add UI delete task.
                mVirtualNodeManager.deleteNode(rootId, nodeId);
                continue;
            }
            mVirtualNodeManager.deleteNode(rootId, nodeId);
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    mRenderManager.deleteNode(rootId, nodeId);
                }
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public void moveNode(final int rootId, final int[] ids, final int newPid, final int oldPid)
            throws NativeRenderException {
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.moveNode(rootId, ids, newPid, oldPid);
            }
        };
        addUITask(task);
    }

    @SuppressWarnings("rawtypes")
    @Override
    public void updateLayout(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>();
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
            if (mVirtualNodeManager.hasVirtualParent(rootId, nodeId)) {
                // If the node has a virtual parent, no corresponding render node exists,
                // so don't add update task to the ui task queue.
                continue;
            }
            final int id = nodeId;
            final int left = Math.round(layoutLeft);
            final int top = Math.round(layoutTop);
            final int width = Math.round(layoutWidth);
            final int height = Math.round(layoutHeight);
            final TextRenderSupplier supplier = mVirtualNodeManager
                    .updateLayout(rootId, nodeId, layoutWidth, layoutInfo);
            UITaskExecutor task = new UITaskExecutor() {
                @Override
                public void exec() {
                    if (supplier != null) {
                        mRenderManager.updateExtra(rootId, id, supplier);
                    }
                    mRenderManager.updateLayout(rootId, id, left, top, width, height);
                }
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @SuppressWarnings("rawtypes")
    @Override
    public void updateEventListener(final int rootId, @NonNull List<Object> eventList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>();
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
            boolean hasUpdate = mVirtualNodeManager.updateEventListener(rootId, nodeId, eventProps);
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
                    mRenderManager.updateEventListener(rootId, id, props);
                }
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public long measure(int rootId, int nodeId, float width, int widthMode, float height,
            int heightMode) {
        try {
            FlexMeasureMode flexMeasureMode = FlexMeasureMode.fromInt(widthMode);
            return mVirtualNodeManager.measure(rootId, nodeId, width, flexMeasureMode);
        } catch (NativeRenderException e) {
            handleRenderException(e);
        }
        return FlexUtils.makeSizeToLong(width, height);
    }

    @Override
    public void callUIFunction(final int rootId, final int nodeId, final long callbackId,
            @NonNull final String functionName,
            @NonNull final List<Object> params) throws NativeRenderException {
        // The node id should not be negative number.
        if (nodeId < 0) {
            throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                    TAG + ": callUIFunction: invalid negative id=" + nodeId);
        }
        // If callbackId equal to 0 mean this call does not need to callback.
        final UIPromise promise =
                (callbackId == 0) ? null : new UIPromise(callbackId, functionName, rootId, nodeId,
                        mRenderProvider.getInstanceId());
        // Because call ui function will not follow with end batch,
        // can be directly post to the UI thread do execution.
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mRenderManager.dispatchUIFunction(rootId, nodeId, functionName, params, promise);
            }
        });
    }

    @Override
    public void doPromiseCallBack(int result, long callbackId, @NonNull String functionName,
            int rootId, int nodeId, @Nullable Object params) {
        mRenderProvider.doPromiseCallBack(result, callbackId, functionName, rootId, nodeId, params);
    }

    @Override
    public void endBatch(final int rootId) throws NativeRenderException {
        Map<Integer, Layout> layoutToUpdate = mVirtualNodeManager.endBatch(rootId);
        if (layoutToUpdate != null) {
            for (Entry<Integer, Layout> entry : layoutToUpdate.entrySet()) {
                final int id = entry.getKey();
                final Layout layout = entry.getValue();
                UITaskExecutor task = new UITaskExecutor() {
                    @Override
                    public void exec() {
                        mRenderManager.updateExtra(rootId, id, layout);
                    }
                };
                addUITask(task);
            }
        }
        UITaskExecutor task = new UITaskExecutor() {
            @Override
            public void exec() {
                mRenderManager.batch(rootId);
            }
        };
        addUITask(task);
        executeUITask();
    }

    @Override
    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @NonNull String className,
            @Nullable Map<String, Object> props) {
        return mRenderManager.createVirtualNode(rootId, id, pid, index, className, props);
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
        final int size = mUITaskQueue.size();
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                long start = System.currentTimeMillis();
                int count = size;
                while (count > 0) {
                    UITaskExecutor task = mUITaskQueue.poll();
                    if (task != null) {
                        task.exec();
                    }
                    count--;
                }
                LogUtils.d(TAG,
                        "executeUITask: size " + size + ", time " + (System.currentTimeMillis()
                                - start));
            }
        });
    }

    private boolean checkJSFrameworkProxy() {
        return mFrameworkProxy instanceof JSFrameworkProxy;
    }
}
