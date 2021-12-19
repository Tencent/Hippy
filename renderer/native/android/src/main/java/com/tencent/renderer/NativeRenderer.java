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

import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.NativeRenderProvider.MeasureParams;
import com.tencent.renderer.component.text.VirtualNode;
import com.tencent.renderer.component.text.VirtualNodeManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicInteger;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.hippy.support.HippyBaseController;
import com.tencent.hippy.support.IFrameworkProxy;
import com.tencent.hippy.support.IJSFrameworkProxy;
import com.tencent.hippy.support.INativeRenderProxy;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

public class NativeRenderer implements INativeRender, INativeRenderProxy, INativeRenderDelegate {

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
    private static final AtomicInteger ID_COUNTER = new AtomicInteger(0);

    private int instanceId;
    private int rootId;
    private boolean isDebugMode;
    private RenderManager renderManager;
    private VirtualNodeManager virtualNodeManager;
    private DomManager domManager;
    private HippyRootView rootView;
    private IFrameworkProxy frameworkProxy;
    private NativeRenderProvider renderProvider;
    volatile CopyOnWriteArrayList<HippyInstanceLifecycleEventListener> instanceLifecycleEventListeners;
    private BlockingQueue<IUITaskExecutor> uiTaskQueue;

    @Override
    public void init(int instanceId, List<Class<? extends HippyBaseController>> controllers,
            boolean isDebugMode, @Nullable ViewGroup rootView) {
        renderManager = new RenderManager(this, controllers);
        virtualNodeManager = new VirtualNodeManager(this);
        domManager = new DomManager(this);
        if (rootView instanceof HippyRootView) {
            rootId = rootView.getId();
            renderManager.createRootNode(rootId);
            renderManager.addRootView(rootView);
            this.rootView = (HippyRootView) rootView;
        } else {
            rootId = ID_COUNTER.addAndGet(ROOT_VIEW_TAG_INCREMENT);
        }
        this.instanceId = instanceId;
        this.isDebugMode = isDebugMode;
        uiTaskQueue = new LinkedBlockingQueue<>(MAX_UITASK_QUEUE_CAPACITY);
        NativeRendererManager.addNativeRendererInstance(instanceId, this);
    }

    @Override
    public Object getCustomViewCreator() {
        if (checkJSFrameworkProxy()) {
            return ((IJSFrameworkProxy) frameworkProxy).getCustomViewCreator();
        }
        return null;
    }

    @Override
    public String getBundlePath() {
        if (checkJSFrameworkProxy()) {
            return ((IJSFrameworkProxy) frameworkProxy).getBundlePath();
        }
        return null;
    }

    @Override
    public IImageLoaderAdapter getImageLoaderAdapter() {
        if (checkJSFrameworkProxy()) {
            Object adapterObj = ((IJSFrameworkProxy) frameworkProxy).getImageLoaderAdapter();
            if (adapterObj instanceof IImageLoaderAdapter) {
                return (IImageLoaderAdapter) adapterObj;
            }
        }
        return null;
    }

    @Override
    public HippyFontScaleAdapter getFontScaleAdapter() {
        if (checkJSFrameworkProxy()) {
            Object adapterObj = ((IJSFrameworkProxy) frameworkProxy).getFontScaleAdapter();
            if (adapterObj instanceof HippyFontScaleAdapter) {
                return (HippyFontScaleAdapter) adapterObj;
            }
        }
        return null;
    }

    @Override
    public boolean isDebugMode() {
        return isDebugMode;
    }

    @Override
    public void handleRenderException(Exception exception) {
        LogUtils.e(TAG, "Received native render exception: " + exception.getMessage());
        reportException(exception);
    }

    @Override
    public void setFrameworkProxy(IFrameworkProxy proxy) {
        frameworkProxy = proxy;
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
        if (renderManager != null) {
            renderManager.destroy();
        }
        if (renderProvider != null) {
            renderProvider.destroy();
            renderProvider = null;
        }
        if (instanceLifecycleEventListeners != null) {
            instanceLifecycleEventListeners.clear();
        }
        rootView = null;
        frameworkProxy = null;
        NativeRendererManager.removeNativeRendererInstance(instanceId);
    }

    @Override
    public ViewGroup createRootView(@NonNull Context context) {
        if (context == null) {
            return null;
        }
        if (rootView == null) {
            rootView = new HippyRootView(context, instanceId, rootId);
            renderManager.createRootNode(rootId);
            renderManager.addRootView(rootView);
        }
        return rootView;
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
        return renderManager;
    }

    @Override
    public DomManager getDomManager() {
        return domManager;
    }

    @Override
    public ViewGroup getRootView() {
        return rootView;
    }

    @Override
    public int getRootId() {
        return rootId;
    }

    @Override
    public void onFirstViewAdded() {
        if (frameworkProxy != null) {
            frameworkProxy.onFirstViewAdded();
        }
    }

    @Override
    public void onSizeChanged(int w, int h, int oldw, int oldh) {
        if (renderProvider != null) {
            LogUtils.d(TAG, "onSizeChanged: w=" + w + ", h=" + h + ", oldw="
                    + oldw + ", oldh=" + oldh);
            renderProvider.onSizeChanged(w, h);
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
            ((IJSFrameworkProxy) frameworkProxy).updateDimension(shouldRevise, dimension,
                    shouldUseScreenDisplay, systemUiVisibilityChanged);
        }
    }

    @Override
    public void dispatchUIComponentEvent(int id, String eventName, Object params) {
        if (checkJSFrameworkProxy()) {
            ((IJSFrameworkProxy) frameworkProxy).dispatchUIComponentEvent(id, eventName, params);
        }
    }

    @Override
    public void dispatchNativeGestureEvent(HippyMap params) {
        if (checkJSFrameworkProxy()) {
            ((IJSFrameworkProxy) frameworkProxy).dispatchNativeGestureEvent(params);
        }
    }

    @Override
    public void onInstanceLoad() {

    }

    @Override
    public void onInstanceResume() {
        if (instanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
                listener.onInstanceResume();
            }
        }
    }

    @Override
    public void onInstancePause() {
        if (instanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
                listener.onInstancePause();
            }
        }
    }

    @Override
    public void onInstanceDestroy() {
        if (instanceLifecycleEventListeners != null) {
            for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
                listener.onInstanceDestroy();
            }
        }
    }

    @Override
    public void onRuntimeInitialized(long runtimeId) {
        renderProvider = new NativeRenderProvider(this, runtimeId);
    }

    @Override
    public void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
        if (instanceLifecycleEventListeners == null) {
            instanceLifecycleEventListeners = new CopyOnWriteArrayList<>();
        }
        instanceLifecycleEventListeners.add(listener);
    }

    @Override
    public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
        if (instanceLifecycleEventListeners != null) {
            instanceLifecycleEventListeners.remove(listener);
        }
    }

    private void executeUIOperation() {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                LogUtils.d(TAG, "UI task queue size=" + uiTaskQueue.size());
                try {
                    long start = System.currentTimeMillis();
                    IUITaskExecutor task = uiTaskQueue.poll();
                    while (task != null) {
                        task.exec();
                        // If there has large number node operation task in queue,
                        // it is possible cause ANR because of takes a lot of time to handle the task,
                        // so we should interrupt it and re-run in next event cycle again.
                        if (System.currentTimeMillis() - start > MAX_UITASK_QUEUE_EXEC_TIME) {
                            LogUtils.e(TAG, "execute ui task exceed 400ms!!!");
                            break;
                        }
                        task = uiTaskQueue.poll();
                    }
                } catch (Exception exception) {
                    handleRenderException(exception);
                }
                if (!uiTaskQueue.isEmpty()) {
                    executeUIOperation();
                }
            }
        });
    }

    @Override
    public void createNode(@NonNull ArrayList nodeList) throws Exception {
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
            VirtualNode virtualParent = virtualNodeManager.getVirtualNode(pid);
            if (className.equals(NodeProps.TEXT_CLASS_NAME) || virtualParent != null) {
                virtualNodeManager.createVirtualNode(id, pid, index, className, props);
            }
            if (virtualParent != null) {
                continue;
            }
            uiTaskQueue.add(new IUITaskExecutor() {
                @Override
                public void exec() {
                    renderManager.createNode(rootView, id, pid, index, className, props);
                }
            });
        }
        executeUIOperation();
    }

    @Override
    public void updateNode(@NonNull ArrayList nodeList) throws Exception {

    }

    @Override
    public void deleteNode(ArrayList nodeList) {

    }

    @Override
    public void updateLayout(@NonNull ArrayList nodeList) throws Exception {
        for (int i = 0; i < nodeList.size(); i++) {
            Object object = nodeList.get(i);
            if (!(object instanceof HashMap)) {
                throw new NativeRenderException(INVALID_NODE_DATA_ERR,
                        TAG + ": updateLayout: " + "object=" + object);
            }
            HashMap<String, Object> node = (HashMap) object;
            final int id = ((Number) node.get(NODE_ID)).intValue();
            final int left = ((Number) node.get(LAYOUT_LEFT)).intValue();
            final int top = ((Number) node.get(LAYOUT_TOP)).intValue();
            final int width = ((Number) node.get(LAYOUT_WIDTH)).intValue();
            final int height = ((Number) node.get(LAYOUT_HEIGHT)).intValue();
            boolean needDoUpdate = virtualNodeManager.updateLayoutIfNeeded(id, width);
            if (needDoUpdate) {
                uiTaskQueue.add(new IUITaskExecutor() {
                    @Override
                    public void exec() {
                        renderManager.updateLayout(id, left, top, width, height);
                    }
                });
            }
        }
        executeUIOperation();
    }

    @Override
    public long measure(MeasureParams params) {
        try {
            return virtualNodeManager.measure(params);
        } catch (Exception exception) {
            handleRenderException(exception);
        }
        return FlexOutput.make(params.width, params.height);
    }

    @Override
    public void startBatch() {

    }

    @Override
    public void endBatch() {
        try {
            uiTaskQueue.add(new IUITaskExecutor() {
                @Override
                public void exec() {
                    renderManager.batch();
                }
            });
        } catch (Exception exception) {
            handleRenderException(exception);
        }
        executeUIOperation();
    }

    public void reportException(Exception exception) {
        if (frameworkProxy != null) {
            frameworkProxy.handleNativeException(exception, true);
        }
    }

    public ThreadExecutor getJSEngineThreadExecutor() {
        if (!checkJSFrameworkProxy()) {
            return null;
        }
        return ((IJSFrameworkProxy) frameworkProxy).getJSEngineThreadExecutor();
    }

    private boolean checkJSFrameworkProxy() {
        if (!(frameworkProxy instanceof IJSFrameworkProxy)) {
            return false;
        }
        return true;
    }
}
