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

import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_BOTTOM;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_LEFT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_RIGHT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_TOP;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.UI_TASK_QUEUE_ADD_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.UI_TASK_QUEUE_UNAVAILABLE_ERR;

import android.content.Context;
import android.graphics.Rect;
import android.text.Layout;
import android.view.View;
import android.view.ViewGroup;

import android.view.ViewParent;
import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.common.BaseEngineContext;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.LogAdapter;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.text.HippyTextViewController;
import com.tencent.renderer.component.image.ImageDecoderAdapter;
import com.tencent.renderer.component.image.ImageLoader;
import com.tencent.renderer.component.image.ImageLoaderAdapter;
import com.tencent.renderer.component.text.FontAdapter;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.node.ListItemRenderNode;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.RootRenderNode;
import com.tencent.renderer.node.TextRenderNode;
import com.tencent.renderer.node.VirtualNode;
import com.tencent.renderer.node.VirtualNodeManager;

import com.tencent.renderer.serialization.Deserializer;
import com.tencent.renderer.serialization.Serializer;
import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.ChoreographerUtils;
import com.tencent.renderer.utils.DisplayUtils;
import com.tencent.renderer.utils.EventUtils.EventType;

import com.tencent.renderer.utils.MapUtils;
import com.tencent.vfs.VfsManager;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.renderer.utils.FlexUtils;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;
import java.util.concurrent.atomic.AtomicInteger;

public class NativeRenderer extends Renderer implements NativeRender, NativeRenderDelegate {

    /**
     * This specific ID is used to identify the root view of snapshot restore
     */
    public static final int SCREEN_SNAPSHOT_ROOT_ID = 10000;
    public static final String NODE_ID = "id";
    public static final String NODE_INDEX = "index";
    public static final String NODE_PROPS = "props";
    private static final String TAG = "NativeRenderer";
    private static final String NODE_PID = "pId";
    private static final String NODE_DELETE_PROPS = "deleteProps";
    private static final String CLASS_NAME = "name";
    private static final String LAYOUT_LEFT = "left";
    private static final String LAYOUT_TOP = "top";
    private static final String LAYOUT_WIDTH = "width";
    private static final String LAYOUT_HEIGHT = "height";
    private static final String EVENT_PREFIX = "on";
    private static final String SNAPSHOT_CREATE_NODE = "createNode";
    private static final String SNAPSHOT_UPDATE_LAYOUT = "updateLayout";
    private static final String PAINT_TYPE_KEY = "paintType";
    private static final String FCP_VALUE = "fcp";
    /**
     * The max capacity of UI task queue
     */
    private static final int MAX_UI_TASK_QUEUE_CAPACITY = 1000;
    private static final int ROOT_VIEW_ID_INCREMENT = 10;
    private static final int INVALID_NODE_ID = -1;
    private static final AtomicInteger sRootIdCounter = new AtomicInteger(0);
    private FCPBatchState mFcpBatchState = FCPBatchState.WATCHING;
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
    @Nullable
    private ExecutorService mBackgroundExecutor;
    @Nullable
    private ImageLoaderAdapter mImageLoader;

    public enum FCPBatchState {
        WATCHING,
        DETECTED,
        MARKED,
    }

    public NativeRenderer() {
        mRenderProvider = new NativeRenderProvider(this);
        // Should restrictions the capacity of ui task queue, to avoid js make huge amount of
        // node operation cause OOM.
        mUITaskQueue = new LinkedBlockingQueue<>(MAX_UI_TASK_QUEUE_CAPACITY);
        mRenderManager = new RenderManager(this);
        mVirtualNodeManager = new VirtualNodeManager(this);
    }

    public float getDensity() {
        return PixelUtil.getDensity();
    }

    public NativeRenderProvider getRenderProvider() {
        return mRenderProvider;
    }

    public Object[] getPropsRegisterForRender() {
        ArrayList<String> props = mRenderManager.getControllerManager().getControllerUpdateManger()
                .getPropsRegisterForRender();
        return props.toArray();
    }

    public void setId(int instanceId) {
        mRenderProvider.setInstanceId(instanceId);
    }

    @Override
    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        mRenderManager.getControllerManager().initControllers(controllers);
        if (rootView instanceof HippyRootView) {
            mRenderManager.createRootNode(rootView.getId(), getInstanceId());
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
    public void addControllers(@NonNull List<Class<?>> controllers) {
        mRenderManager.getControllerManager().addControllers(controllers);
    }

    @Override
    public int getInstanceId() {
        return mRenderProvider.getInstanceId();
    }

    @Override
    @Nullable
    public Object getCustomViewCreator() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getCustomViewCreator() : null;
    }

    @Override
    @Nullable
    public String getBundlePath() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getBundlePath() : null;
    }

    @Override
    @Nullable
    public ImageLoaderAdapter getImageLoader() {
        if (mImageLoader == null && getVfsManager() != null) {
            mImageLoader = new ImageLoader(getVfsManager(), getImageDecoderAdapter());
        }
        return mImageLoader;
    }

    @Override
    @Nullable
    public VfsManager getVfsManager() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getVfsManager() : null;
    }

    @Override
    @Nullable
    public ImageDecoderAdapter getImageDecoderAdapter() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getImageDecoderAdapter() : null;
    }

    @Override
    @Nullable
    public FontAdapter getFontAdapter() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getFontAdapter() : null;
    }

    @Nullable
    public LogAdapter getLogAdapter() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getLogAdapter() : null;
    }

    @Override
    @Nullable
    public Executor getBackgroundExecutor() {
        if (mFrameworkProxy != null && mFrameworkProxy.getBackgroundExecutor() != null) {
            return mFrameworkProxy.getBackgroundExecutor();
        }
        if (mBackgroundExecutor == null) {
            mBackgroundExecutor = Executors.newFixedThreadPool(4);
        }
        return mBackgroundExecutor;
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
    public void onReceiveRenderLogMessage(int level, @NonNull String tag, @NonNull String msg) {
        LogAdapter logAdapter = getLogAdapter();
        if (logAdapter != null) {
            logAdapter.onReceiveLogMessage(level, tag, msg);
        }
    }

    @Override
    @Nullable
    public BaseEngineContext getEngineContext() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getEngineContext() : null;
    }

    @Override
    public int getEngineId() {
        return (mFrameworkProxy != null) ? mFrameworkProxy.getEngineId() : -1;
    }

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        mFrameworkProxy = proxy;
    }

    @Override
    public void destroy() {
        if (mBackgroundExecutor != null) {
            if (!mBackgroundExecutor.isShutdown()) {
                mBackgroundExecutor.shutdown();
            }
            mBackgroundExecutor = null;
        }
        mRenderProvider.destroy();
        mRenderManager.destroy();
        if (mInstanceLifecycleEventListeners != null) {
            mInstanceLifecycleEventListeners.clear();
        }
        if (mImageLoader != null) {
            mImageLoader.destroy();
        }
        mFrameworkProxy = null;
        NativeRendererManager.removeNativeRendererInstance(mRenderProvider.getInstanceId());
    }

    @Override
    @NonNull
    public View createRootView(@NonNull Context context) {
        int rootId = sRootIdCounter.addAndGet(ROOT_VIEW_ID_INCREMENT);
        HippyRootView rootView = new HippyRootView(context, mRenderProvider.getInstanceId(),
                rootId);
        mRenderManager.createRootNode(rootId, getInstanceId());
        mRenderManager.addRootView(rootView);
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
        return mRenderManager.getControllerManager().getRootView(rootId);
    }

    @Override
    @Nullable
    public View findViewById(int rootId, int nodeId) {
        return mRenderManager.getControllerManager().findView(rootId, nodeId);
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
    public void onFirstPaint() {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.onFirstPaint();
        }
    }

    @Override
    public void onFirstContentfulPaint() {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.onFirstContentfulPaint();
        }
    }

    @Override
    public void onRuntimeInitialized(final int rootId) {
        UIThreadUtils.runOnUiThread(() -> {
            View rootView = getRootView(rootId);
            if (rootView != null) {
                final int width = rootView.getWidth();
                final int height = rootView.getHeight();
                if (width > 0 && height > 0) {
                    onSizeChanged(rootId, width, height);
                }
            }
        });
    }

    private void onSizeChanged(int rootId, int w, int h) {
        mRenderProvider.onSizeChanged(rootId, w, h);
    }

    @Override
    public void onSizeChanged(int rootId, int w, int h, int ow, int oh) {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.onSizeChanged(rootId, w, h, ow, oh);
        }
        onSizeChanged(rootId, w, h);
    }

    @Override
    public void onSizeChanged(int rootId, int nodeId, int width, int height, boolean isSync) {
        mRenderProvider.onSizeChanged(rootId, nodeId, width, height, isSync);
    }

    @Override
    public void updateDimension(int width, int height, boolean shouldUseScreenDisplay,
            boolean systemUiVisibilityChanged) {
        if (mFrameworkProxy != null) {
            mFrameworkProxy.updateDimension(width, height, shouldUseScreenDisplay,
                    systemUiVisibilityChanged);
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
        // Compatible with events prefixed with on in old version
        if (lowerCaseEventName.startsWith(EVENT_PREFIX)) {
            lowerCaseEventName = lowerCaseEventName.substring(EVENT_PREFIX.length());
        }
        if (eventType != EventType.EVENT_TYPE_GESTURE
                && !mRenderManager.checkRegisteredEvent(rootId, nodeId, lowerCaseEventName)
                && !mVirtualNodeManager.checkRegisteredEvent(rootId, nodeId, lowerCaseEventName)) {
            return;
        }
        if (LogUtils.isDebugMode() && !eventName.equals(ChoreographerUtils.DO_FRAME)) {
            LogUtils.d(TAG, "dispatchEvent: id " + nodeId + ", eventName " + eventName
                    + ", eventType " + eventType + ", params " + params + "\n ");
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
    public void destroyRoot(int rootId) {
        if (mInstanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : mInstanceLifecycleEventListeners) {
                listener.onInstanceDestroy(rootId);
            }
        }
        ChoreographerUtils.unregisterDoFrameListener(getInstanceId(), rootId);
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
        return () -> {
            for (UITaskExecutor task : taskList) {
                task.exec();
            }
        };
    }

    private void updateFcpStateIfNeeded(int rootId, @Nullable Map<String, Object> props) {
        if (mFcpBatchState == FCPBatchState.WATCHING && props != null && rootId != SCREEN_SNAPSHOT_ROOT_ID) {
            if (MapUtils.getStringValue(props, PAINT_TYPE_KEY, "").equalsIgnoreCase(FCP_VALUE)) {
                mFcpBatchState = FCPBatchState.DETECTED;
            }
        }
    }

    @SuppressWarnings({"unchecked"})
    @Override
    public void createNode(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> createNodeTaskList = new ArrayList<>(nodeList.size());
        final List<UITaskExecutor> createViewTaskList = new ArrayList<>(nodeList.size());
        for (int i = 0; i < nodeList.size(); i++) {
            final Map<String, Object> node = ArrayUtils.getMapValue(nodeList, i);
            if (node == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: invalid node object");
            }
            final int nodeId = MapUtils.getIntValue(node, NODE_ID, INVALID_NODE_ID);
            final int nodePid = MapUtils.getIntValue(node, NODE_PID, INVALID_NODE_ID);
            final int nodeIndex = MapUtils.getIntValue(node, NODE_INDEX, INVALID_NODE_ID);
            final String className = MapUtils.getStringValue(node, CLASS_NAME);
            // The node id, pid and index should not be negative number.
            if (nodeId < 0 || nodePid < 0 || nodeIndex < 0 || className == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": createNode: id " + nodeId + ", pId " + nodePid + ", index "
                                + nodeIndex + ", className " + className);
            }
            final Map<String, Object> props = MapUtils.getMapValue(node, NODE_PROPS);
            if (LogUtils.isDebugMode()) {
                LogUtils.d(TAG, "createNode: id " + nodeId + ", pid " + nodePid
                        + ", index " + nodeIndex + ", name " + className + "\n  props " + props
                        + "\n ");
            }
            updateFcpStateIfNeeded(rootId, props);
            mVirtualNodeManager.createNode(rootId, nodeId, nodePid, nodeIndex, className, props);
            // If multiple level are nested, the parent is outermost text node.
            VirtualNode parent = mVirtualNodeManager.checkVirtualParent(rootId, nodeId);
            // If restoring snapshots, create node is called directly on the UI thread,
            // and do not need to use the UI task
            if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
                if (parent == null) {
                    mRenderManager.createNode(rootId, nodeId, nodePid, nodeIndex, className, props);
                }
                continue;
            }
            if (parent != null) {
                final int pid = parent.getId();
                // If the node has a virtual parent, no need to create corresponding render node,
                // but need set the node data to the parent, for render node snapshot.
                createNodeTaskList.add(
                        () -> mRenderManager.onCreateVirtualNode(rootId, nodeId, pid, nodeIndex,
                                node));
            } else {
                createNodeTaskList.add(
                        () -> mRenderManager.createNode(rootId, nodeId, nodePid, nodeIndex,
                                className,
                                props));
                // Because image and text may be rendered flat, it is not necessary to pre create a view.
                if (!className.equals(HippyImageViewController.CLASS_NAME) && !className.equals(
                        HippyTextViewController.CLASS_NAME)) {
                    createViewTaskList.add(
                            () -> mRenderManager.preCreateView(rootId, nodeId, nodePid, className,
                                    props));
                }
            }
        }
        if (!createNodeTaskList.isEmpty()) {
            addUITask(getMassTaskExecutor(createNodeTaskList));
        }
        if (!createViewTaskList.isEmpty()) {
            // The task of creating render nodes will not be executed until batch end,
            // so we can pre create view, reduce render time by creating in parallel.
            final UITaskExecutor task = getMassTaskExecutor(createViewTaskList);
            UIThreadUtils.runOnUiThread(task::exec);
        }
    }

    @SuppressWarnings({"unchecked"})
    @Override
    public void updateNode(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>(nodeList.size());
        for (int i = 0; i < nodeList.size(); i++) {
            final Map<String, Object> node = ArrayUtils.getMapValue(nodeList, i);
            if (node == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateNode: invalid node object");
            }
            final int nodeId = MapUtils.getIntValue(node, NODE_ID, INVALID_NODE_ID);
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateNode: invalid negative id=" + nodeId);
            }
            final Map<String, Object> diffProps = MapUtils.getMapValue(node, NODE_PROPS);
            final List<Object> delProps = MapUtils.getListValue(node, NODE_DELETE_PROPS);
            if (LogUtils.isDebugMode()) {
                LogUtils.d(TAG,
                        "updateNode: id " + nodeId + ", diff " + diffProps + ", delete " + delProps
                                + "\n ");
            }
            updateFcpStateIfNeeded(rootId, diffProps);
            mVirtualNodeManager.updateNode(rootId, nodeId, diffProps, delProps);
            // If multiple level are nested, the parent is outermost text node.
            VirtualNode parent = mVirtualNodeManager.checkVirtualParent(rootId, nodeId);
            if (parent != null) {
                final int pid = parent.getId();
                taskList.add(
                        () -> mRenderManager.onUpdateVirtualNode(rootId, nodeId, pid, diffProps,
                                delProps));
            } else {
                taskList.add(() -> mRenderManager.updateNode(rootId, nodeId, diffProps, delProps));
            }
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public void deleteNode(final int rootId, @NonNull int[] ids) throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>(ids.length);
        if (LogUtils.isDebugMode()) {
            LogUtils.d(TAG, "deleteNode " + Arrays.toString(ids) + "\n ");
        }
        for (final int nodeId : ids) {
            // The node id should not be negative number.
            if (nodeId < 0) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": deleteNode: invalid negative id=" + nodeId);
            }
            // If multiple level are nested, the parent is outermost text node.
            VirtualNode parent = mVirtualNodeManager.checkVirtualParent(rootId, nodeId);
            mVirtualNodeManager.deleteNode(rootId, nodeId);
            if (parent != null) {
                final int pid = parent.getId();
                taskList.add(() -> mRenderManager.onDeleteVirtualNode(rootId, nodeId, pid));
            } else {
                taskList.add(() -> mRenderManager.deleteNode(rootId, nodeId));
            }
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public void moveNode(final int rootId, final int[] ids, final int newPid, final int oldPid,
            final int insertIndex) throws NativeRenderException {
        if (LogUtils.isDebugMode()) {
            LogUtils.d(TAG, "moveNode: ids " + Arrays.toString(ids) + ", newPid " +
                    newPid + ", oldPid " + oldPid + ", insertIndex " + insertIndex + "\n ");
        }
        addUITask(() -> mRenderManager.moveNode(rootId, ids, newPid, oldPid, insertIndex));
    }

    @Override
    public void moveNode(final int rootId, final int pid, @NonNull final List<Object> list) {
        if (LogUtils.isDebugMode()) {
            LogUtils.d(TAG, "moveNode: pid " + pid + ", node list " + list + "\n ");
        }
        VirtualNode parent = mVirtualNodeManager.getVirtualNode(rootId, pid);
        if (parent == null) {
            addUITask(() -> mRenderManager.moveNode(rootId, pid, list));
        } else {
            mVirtualNodeManager.moveNode(rootId, parent, list);
            addUITask(() -> mRenderManager.onMoveVirtualNode(rootId, pid, list));
        }
    }

    @SuppressWarnings({"unchecked"})
    @Override
    public void updateLayout(final int rootId, @NonNull List<Object> nodeList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>(nodeList.size());
        for (int i = 0; i < nodeList.size(); i++) {
            final Map<String, Object> layoutInfo = ArrayUtils.getMapValue(nodeList, i);
            if (layoutInfo == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: invalid node object");
            }
            final int nodeId = MapUtils.getIntValue(layoutInfo, NODE_ID, INVALID_NODE_ID);
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
            final int left = Math.round(MapUtils.getFloatValue(layoutInfo, LAYOUT_LEFT));
            final int top = Math.round(MapUtils.getFloatValue(layoutInfo, LAYOUT_TOP));
            final int width = Math.round(MapUtils.getFloatValue(layoutInfo, LAYOUT_WIDTH));
            final int height = Math.round(MapUtils.getFloatValue(layoutInfo, LAYOUT_HEIGHT));
            final TextRenderSupplier supplier = mVirtualNodeManager
                    .updateLayout(rootId, nodeId, width, layoutInfo);
            // If restoring snapshots, update layout is called directly on the UI thread,
            // and do not need to use the UI task
            if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
                if (supplier != null) {
                    mRenderManager.updateExtra(rootId, nodeId, supplier);
                }
                mRenderManager.updateLayout(rootId, nodeId, left, top, width, height);
                continue;
            }
            UITaskExecutor task = () -> {
                if (supplier != null) {
                    mRenderManager.updateExtra(rootId, nodeId, supplier);
                }
                mRenderManager.updateLayout(rootId, nodeId, left, top, width, height);
            };
            taskList.add(task);
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @SuppressWarnings({"unchecked"})
    @Override
    public void updateEventListener(final int rootId, @NonNull List<Object> eventList)
            throws NativeRenderException {
        final List<UITaskExecutor> taskList = new ArrayList<>(eventList.size());
        for (int i = 0; i < eventList.size(); i++) {
            final Map<String, Object> events = ArrayUtils.getMapValue(eventList, i);
            if (events == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateEventListener: invalid node object");
            }
            final int nodeId = MapUtils.getIntValue(events, NODE_ID, INVALID_NODE_ID);
            final Map<String, Object> eventProps = MapUtils.getMapValue(events, NODE_PROPS);
            // The node id should not be negative number.
            if (nodeId < 0 || eventProps == null) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateEventListener: invalid negative id=" + nodeId);
            }
            if (LogUtils.isDebugMode()) {
                LogUtils.d(TAG,
                        "updateEventListener: id " + nodeId + ", eventProps " + eventProps + "\n ");
            }
            mVirtualNodeManager.updateEventListener(rootId, nodeId, eventProps);
            taskList.add(() -> mRenderManager.updateEventListener(rootId, nodeId, eventProps));
        }
        if (!taskList.isEmpty()) {
            addUITask(getMassTaskExecutor(taskList));
        }
    }

    @Override
    public long measure(int rootId, int nodeId, float width, int widthMode, float height,
            int heightMode) {
        try {
            FlexMeasureMode wm = FlexMeasureMode.fromInt(widthMode);
            FlexMeasureMode hm = FlexMeasureMode.fromInt(heightMode);
            return mVirtualNodeManager.measure(rootId, nodeId, width, wm, height, hm);
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
        if (LogUtils.isDebugMode()) {
            LogUtils.d(TAG,
                    "callUIFunction: id " + nodeId + ", functionName " + functionName + ", params"
                            + params + "\n ");
        }
        // If callbackId equal to 0 mean this call does not need to callback.
        final UIPromise promise =
                (callbackId == 0) ? null : new UIPromise(callbackId, functionName, rootId, nodeId,
                        mRenderProvider.getInstanceId());
        // Because call ui function will not follow with end batch,
        // can be directly post to the UI thread do execution.
        UIThreadUtils.runOnUiThread(
                () -> mRenderManager.dispatchUIFunction(rootId, nodeId, functionName, params,
                        promise));
    }

    @Override
    public void doPromiseCallBack(int result, long callbackId, @NonNull String functionName,
            int rootId, int nodeId, @Nullable Object params) {
        mRenderProvider.doPromiseCallBack(result, callbackId, functionName, rootId, nodeId, params);
    }

    @Override
    public void endBatch(final int rootId) throws NativeRenderException {
        if (LogUtils.isDebugMode()) {
            LogUtils.d(TAG, "=============================endBatch " + rootId);
        }
        Map<Integer, Layout> layoutToUpdate = mVirtualNodeManager.endBatch(rootId);
        if (layoutToUpdate != null) {
            for (Entry<Integer, Layout> entry : layoutToUpdate.entrySet()) {
                final int id = entry.getKey();
                final Layout layout = entry.getValue();
                if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
                    mRenderManager.updateExtra(rootId, id, layout);
                } else {
                    addUITask(() -> mRenderManager.updateExtra(rootId, id, layout));
                }
            }
        }
        if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
            mRenderManager.batch(rootId);
        } else {
            final boolean isFcp = (mFcpBatchState == FCPBatchState.DETECTED);
            addUITask(() -> {
                mRenderManager.batch(rootId);
                if (isFcp) {
                    onFirstContentfulPaint();
                }
            });
            if (isFcp) {
                mFcpBatchState = FCPBatchState.MARKED;
            }
            executeUITask();
        }
    }

    @Override
    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @NonNull String className, @Nullable Map<String, Object> props) {
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
        UIThreadUtils.runOnUiThread(() -> {
            //long start = System.currentTimeMillis();
            int count = size;
            while (count > 0) {
                UITaskExecutor task = mUITaskQueue.poll();
                if (task != null) {
                    task.exec();
                }
                count--;
            }
            //LogUtils.d(TAG,"executeUITask: size " + size + ", time " + (System.currentTimeMillis() - start));
        });
    }

    /**
     * Decode snapshot buffer, can be called without waiting for the engine initialization to
     * complete
     *
     * <p>
     * As the decoding time will increase with large number of nodes, it is recommended to call this
     * method in the sub thread
     * <p/>
     *
     * @param buffer the byte array of snapshot that save by host
     * @return the snapshot map {@link HashMap} of deserialize
     */
    @Nullable
    public static Map<String, Object> decodeSnapshot(@NonNull byte[] buffer) {
        try {
            final BinaryReader binaryReader = new SafeHeapReader();
            Deserializer deserializer = new Deserializer(null, new InternalizedStringTable());
            binaryReader.reset(ByteBuffer.wrap(buffer));
            deserializer.setReader(binaryReader);
            deserializer.reset();
            deserializer.readHeader();
            Object paramsObj = deserializer.readValue();
            deserializer.getStringTable().release();
            return (paramsObj instanceof HashMap) ? (HashMap<String, Object>) paramsObj : null;
        } catch (Exception e) {
            LogUtils.e(TAG, "decodeSnapshot: " + e.getMessage());
            return null;
        }
    }

    /**
     * Replay snapshot with map of render node tree.
     *
     * @param context android system {@link Context} that use to create root view
     * @param snapshotMap the render node tree represented by hash map
     * @return the root view replay by snapshot, will return null if the replay failed
     */
    @SuppressWarnings("unchecked")
    @Override
    @Nullable
    public synchronized View replaySnapshot(@NonNull Context context,
            @NonNull Map<String, Object> snapshotMap) {
        View rootView;
        List<Object> nodeList;
        List<Object> layoutList;
        try {
            nodeList = (List<Object>) Objects.requireNonNull(snapshotMap.get(SNAPSHOT_CREATE_NODE));
            layoutList = (List<Object>) Objects.requireNonNull(
                    snapshotMap.get(SNAPSHOT_UPDATE_LAYOUT));
            rootView = new HippyRootView(context, mRenderProvider.getInstanceId(),
                    SCREEN_SNAPSHOT_ROOT_ID);
            mRenderManager.createRootNode(SCREEN_SNAPSHOT_ROOT_ID, getInstanceId());
            mRenderManager.addRootView(rootView);
            createNode(SCREEN_SNAPSHOT_ROOT_ID, nodeList);
            updateLayout(SCREEN_SNAPSHOT_ROOT_ID, layoutList);
            endBatch(SCREEN_SNAPSHOT_ROOT_ID);
        } catch (Exception e) {
            LogUtils.e(TAG, "replaySnapshot: " + e.getMessage());
            return null;
        }
        return rootView;
    }

    /**
     * Replay snapshot with byte buffer of render node tree.
     *
     * @param context android system {@link Context} that use to create root view
     * @param buffer the render node tree represented by byte buffer
     * @return the root view replay by snapshot, will return null if the replay failed
     */
    @Override
    @Nullable
    public View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer) {
        final Map<String, Object> snapshotMap = decodeSnapshot(buffer);
        if (snapshotMap != null) {
            return replaySnapshot(context, snapshotMap);
        }
        return null;
    }

    /**
     * Record snapshot to byte buffer.
     *
     * <p>
     * Hippy SDK does not store the buffer generated by recording, because the policy of buffer
     * invalidation needs to be defined by the business itself, the implementation of storage needs
     * to be completed by the host itself
     * <p/>
     *
     * @param rootId the root view id
     * @param callback return the result of record by {@link Callback}
     */
    @Override
    public void recordSnapshot(int rootId, @NonNull final Callback<byte[]> callback) {
        RenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootNode == null) {
            return;
        }
        List<Map<String, Object>> nodeInfoList = new ArrayList<>(80);
        List<Map<String, Object>> layoutInfoList = new ArrayList<>(80);
        int displayWidth = DisplayUtils.getScreenWidth();
        int displayHeight = DisplayUtils.getScreenHeight();
        View rootView = mRenderManager.getControllerManager().getRootView(rootId);
        if (rootView != null && rootView.getWidth() > 0 && rootView.getHeight() > 0) {
            displayWidth = rootView.getWidth();
            displayHeight = rootView.getHeight();
        }
        Rect displayArea = new Rect(0, 0, displayWidth, displayHeight);
        performNodeTreeTraversals(rootNode, 0, 0, displayArea, nodeInfoList, layoutInfoList);
        final Map<String, Object> snapshot = new HashMap<>();
        snapshot.put(SNAPSHOT_CREATE_NODE, nodeInfoList);
        snapshot.put(SNAPSHOT_UPDATE_LAYOUT, layoutInfoList);
        try {
            ByteBuffer buffer = encodeSnapshot(snapshot);
            callback.callback(buffer.array(), null);
        } catch (Exception e) {
            callback.callback(null, e);
        }
    }

    /**
     * Remove snapshot view and render node.
     */
    @MainThread
    @Override
    public void removeSnapshotView() {
        final View snapshotRootView = getRootView(SCREEN_SNAPSHOT_ROOT_ID);
        if (snapshotRootView == null) {
            return;
        }
        ViewParent parent = snapshotRootView.getParent();
        if (parent instanceof ViewGroup) {
            ((ViewGroup) parent).removeView(snapshotRootView);
        }
        mRenderManager.getControllerManager().deleteRootView(SCREEN_SNAPSHOT_ROOT_ID);
        mRenderManager.deleteSnapshotNode(SCREEN_SNAPSHOT_ROOT_ID);
    }

    private ByteBuffer encodeSnapshot(@NonNull Map<String, Object> snapshot)
            throws NativeRenderException {
        SafeHeapWriter safeHeapWriter = new SafeHeapWriter();
        Serializer serializer = new Serializer();
        serializer.setWriter(safeHeapWriter);
        serializer.reset();
        serializer.writeHeader();
        serializer.writeValue(snapshot);
        return safeHeapWriter.chunked();
    }

    private void performNodeTreeTraversals(@NonNull RenderNode parent, int left, int top,
            Rect displayArea, @NonNull List<Map<String, Object>> nodeInfoList,
            @NonNull List<Map<String, Object>> layoutInfoList) {
        int childCount = parent.getChildCount();
        int pid = (parent instanceof RootRenderNode) ? SCREEN_SNAPSHOT_ROOT_ID : parent.getId();
        for (int i = 0; i < childCount; i++) {
            RenderNode child = parent.getChildAt(i);
            if (child == null) {
                continue;
            }
            // If the parent node display area is no longer in the screen, do not need to
            // traverse the child node
            if (collectNodeInfo(child, pid, left, top, displayArea, nodeInfoList, layoutInfoList)) {
                performNodeTreeTraversals(child, left + child.getX(), top + child.getY(),
                        displayArea, nodeInfoList, layoutInfoList);
            }
        }
    }

    private boolean collectNodeInfo(@NonNull RenderNode child, int pid, int outerLeft, int outerTop,
            Rect displayArea, @NonNull List<Map<String, Object>> nodeInfoList,
            @NonNull List<Map<String, Object>> layoutInfoList) {
        int left = (child instanceof ListItemRenderNode) ? ((ListItemRenderNode) child).getLeft()
                : child.getX();
        int top = (child instanceof ListItemRenderNode) ? ((ListItemRenderNode) child).getTop()
                : child.getY();
        int width = child.getWidth() == 0 ? displayArea.width() : child.getWidth();
        int height = child.getHeight() == 0 ? displayArea.height() : child.getHeight();
        if (!displayArea.intersects(left + outerLeft, top + outerTop,
                left + outerLeft + width, top + outerTop + height)) {
            // If the display area of this node is no longer in the screen,
            // do not need to cache the node information.
            return false;
        }
        Map<String, Object> layoutInfo = new HashMap<>();
        layoutInfo.put(NODE_ID, child.getId());
        layoutInfo.put(LAYOUT_WIDTH, child.getWidth());
        layoutInfo.put(LAYOUT_HEIGHT, child.getHeight());
        layoutInfo.put(LAYOUT_LEFT, left);
        layoutInfo.put(LAYOUT_TOP, top);
        if (child instanceof TextRenderNode) {
            layoutInfo.put(PADDING_LEFT, ((TextRenderNode) child).getPaddingLeft());
            layoutInfo.put(PADDING_RIGHT, ((TextRenderNode) child).getPaddingRight());
            layoutInfo.put(PADDING_TOP, ((TextRenderNode) child).getPaddingTop());
            layoutInfo.put(PADDING_BOTTOM, ((TextRenderNode) child).getPaddingBottom());
        }
        layoutInfoList.add(layoutInfo);

        Map<String, Object> nodeInfo = new HashMap<>();
        nodeInfo.put(NODE_ID, child.getId());
        nodeInfo.put(NODE_PID, pid);
        nodeInfo.put(NODE_INDEX, child.indexFromParent());
        nodeInfo.put(CLASS_NAME, child.getClassName());
        Map<String, Object> props = child.getProps();
        if (props != null && !props.isEmpty()) {
            nodeInfo.put(NODE_PROPS, props);
        }
        nodeInfoList.add(nodeInfo);
        if (child instanceof TextRenderNode) {
            ((TextRenderNode) child).recordVirtualChildren(nodeInfoList);
        }
        return true;
    }

    private interface UITaskExecutor {

        void exec();
    }
}
