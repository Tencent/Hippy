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

package com.tencent.mtt.hippy.uimanager;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.ADD_CHILD_VIEW_FAILED_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.REMOVE_CHILD_VIEW_FAILED_ERR;
import static com.tencent.renderer.node.RenderNode.FLAG_ALREADY_UPDATED;
import static com.tencent.renderer.node.RenderNode.FLAG_UPDATE_LAYOUT;

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.openhippy.pool.BasePool.PoolType;
import com.openhippy.pool.Pool;
import com.openhippy.pool.PreCreateViewPool;
import com.openhippy.pool.RecycleViewPool;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewWrapper;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.list.HippyListItemViewController;
import com.tencent.mtt.hippy.views.modal.HippyModalHostManager;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterViewController;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderViewController;
import com.tencent.mtt.hippy.views.refresh.RefreshWrapperController;
import com.tencent.mtt.hippy.views.refresh.RefreshWrapperItemController;
import com.tencent.mtt.hippy.views.scroll.HippyHorizontalScrollView;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewController;
import com.tencent.mtt.hippy.views.text.HippyTextViewController;
import com.tencent.mtt.hippy.views.textinput.HippyTextInputController;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerController;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerItemController;
import com.tencent.mtt.hippy.views.waterfall.HippyWaterfallItemViewController;
import com.tencent.mtt.hippy.views.waterfall.HippyWaterfallViewController;
import com.tencent.mtt.hippy.views.webview.HippyWebViewController;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.Renderer;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.VirtualNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ControllerManager {

    @NonNull
    private final ControllerRegistry mControllerRegistry;
    @NonNull
    private final ControllerUpdateManger<HippyViewController<?>> mControllerUpdateManger;
    @NonNull
    private final Map<Integer, Pool<Integer, View>> mPreCreateViewPools = new HashMap<>();
    @NonNull
    private final Map<Integer, Pool<String, View>> mRecycleViewPools = new HashMap<>();
    @Nullable
    private Renderer mRenderer;
    @Nullable
    private static List<Class<?>> sDefaultControllers;

    public ControllerManager(@NonNull Renderer renderer) {
        mRenderer = renderer;
        mControllerRegistry = new ControllerRegistry(renderer);
        mControllerUpdateManger = new ControllerUpdateManger<>(renderer);
    }

    @Nullable
    public RenderManager getRenderManager() {
        return mRenderer != null ? ((NativeRender) mRenderer).getRenderManager() : null;
    }

    @Nullable
    public NativeRender getNativeRender() {
        return mRenderer != null ? ((NativeRender) mRenderer) : null;
    }

    @NonNull
    public ControllerUpdateManger getControllerUpdateManger() {
        return mControllerUpdateManger;
    }

    private synchronized static void checkDefaultControllers() {
        if (sDefaultControllers != null) {
            return;
        }
        sDefaultControllers = new ArrayList<>();
        sDefaultControllers.add(HippyTextViewController.class);
        sDefaultControllers.add(HippyViewGroupController.class);
        sDefaultControllers.add(HippyImageViewController.class);
        sDefaultControllers.add(HippyRecyclerViewController.class);
        sDefaultControllers.add(HippyListItemViewController.class);
        sDefaultControllers.add(HippyTextInputController.class);
        sDefaultControllers.add(HippyScrollViewController.class);
        sDefaultControllers.add(HippyViewPagerController.class);
        sDefaultControllers.add(HippyViewPagerItemController.class);
        sDefaultControllers.add(HippyModalHostManager.class);
        sDefaultControllers.add(RefreshWrapperController.class);
        sDefaultControllers.add(RefreshWrapperItemController.class);
        sDefaultControllers.add(HippyPullHeaderViewController.class);
        sDefaultControllers.add(HippyPullFooterViewController.class);
        sDefaultControllers.add(HippyWebViewController.class);
        sDefaultControllers.add(HippyCustomPropsController.class);
        sDefaultControllers.add(HippyWaterfallViewController.class);
        sDefaultControllers.add(HippyWaterfallItemViewController.class);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public synchronized void addControllers(@NonNull List<Class<?>> controllers) {
        for (Class cls : controllers) {
            try {
                HippyController controllerAnnotation = (HippyController) cls
                        .getAnnotation(HippyController.class);
                if (controllerAnnotation == null) {
                    continue;
                }
                String name = controllerAnnotation.name();
                String[] names = controllerAnnotation.names();
                boolean lazy = controllerAnnotation.isLazyLoad();
                boolean supportFlatten = controllerAnnotation.supportFlatten();
                ControllerHolder holder = new ControllerHolder(
                        (HippyViewController) cls.newInstance(), lazy, supportFlatten);
                mControllerRegistry.addControllerHolder(name, holder);
                if (names.length > 0) {
                    for (String s : names) {
                        mControllerRegistry.addControllerHolder(s, holder);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void initControllers(@Nullable List<Class<?>> controllers) {
        checkDefaultControllers();
        assert sDefaultControllers != null;
        if (controllers != null) {
            controllers.addAll(0, sDefaultControllers);
        } else {
            controllers = sDefaultControllers;
        }
        addControllers(controllers);
        mControllerRegistry.addControllerHolder(NodeProps.ROOT_NODE,
                new ControllerHolder(new HippyViewGroupController(), false, false));
        mControllerUpdateManger.setCustomPropsController(mControllerRegistry.getViewController(
                HippyCustomPropsController.CLASS_NAME));
    }

    @SuppressWarnings("rawtypes")
    @Nullable
    public HippyCustomPropsController getCustomPropsController() {
        HippyViewController controller = mControllerRegistry.getViewController(
                HippyCustomPropsController.CLASS_NAME);
        return (controller instanceof HippyCustomPropsController)
                ? (HippyCustomPropsController) controller : null;
    }

    public void destroy() {
        mControllerRegistry.clear();
        mControllerUpdateManger.clear();
        for (Pool<Integer, View> pool : mPreCreateViewPools.values()) {
            pool.clear();
        }
        mPreCreateViewPools.clear();
        for (Pool<String, View> pool : mRecycleViewPools.values()) {
            pool.clear();
        }
        mRecycleViewPools.clear();
        int count = mControllerRegistry.getRootViewCount();
        if (count > 0) {
            for (int i = 0; i < count; i++) {
                deleteRootView(mControllerRegistry.getRootIdAt(i));
            }
        }
        mRenderer = null;
    }

    @Nullable
    public View findView(int rootId, int id) {
        return mControllerRegistry.getView(rootId, id);
    }

    public void addView(int rootId, @NonNull View view) {
        if (findView(rootId, view.getId()) == null) {
            mControllerRegistry.addView(view, rootId, view.getId());
        }
    }

    public boolean hasView(int rootId, int id) {
        return findView(rootId, id) != null;
    }

    private void addPreView(@NonNull View view, int rootId) {
        Pool<Integer, View> pool = mPreCreateViewPools.get(rootId);
        if (pool == null) {
            pool = new PreCreateViewPool();
            mPreCreateViewPools.put(rootId, pool);
        }
        pool.release(view);
    }

    @Nullable
    public View getPreView(int rootId, Integer id) {
        Pool<Integer, View> pool = mPreCreateViewPools.get(rootId);
        return (pool == null) ? null : pool.acquire(id);
    }

    public void preCreateView(int rootId, int id, @NonNull String className,
            @Nullable Map<String, Object> props) {
        View view = mControllerRegistry.getView(rootId, id);
        View rootView = mControllerRegistry.getRootView(rootId);
        HippyViewController<?> controller = mControllerRegistry.getViewController(
                className);
        if (view != null || rootView == null || controller == null) {
            return;
        }
        view = controller.createView(rootView, id, mRenderer, className, props);
        if (view != null) {
            addPreView(view, rootId);
        }
    }

    @Nullable
    private View findViewFromRecyclePool(int rootId, String className) {
        Pool<String, View> pool = mRecycleViewPools.get(rootId);
        if (pool == null) {
            return null;
        }
        View view = pool.acquire(className);
        if (view != null) {
            RenderNode node = RenderManager.getRenderNode(view);
            // If the corresponding node non-existent or is deleted, cached views cannot be reused,
            // since the previously node props is lost, we have no way to reset the attributes that don't
            // exist in the new node.
            if (node == null || node.isDeleted()) {
                return null;
            }
        }
        return view;
    }

    @Nullable
    private View findViewFromPool(int rootId, int id, String className, PoolType poolType) {
        switch (poolType) {
            case RECYCLE_VIEW:
                return findViewFromRecyclePool(rootId, className);
            case PRE_CREATE_VIEW:
                Pool<Integer, View> preCreatePool = mPreCreateViewPools.get(rootId);
                return (preCreatePool == null) ? null : preCreatePool.acquire(id);
            default:
                return null;
        }
    }

    @Nullable
    public View createView(@NonNull RenderNode node, PoolType cachePoolType) {
        final int rootId = node.getRootId();
        final int id = node.getId();
        final String className = node.getClassName();
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null) {
            if (cachePoolType != PoolType.NONE) {
                view = findViewFromPool(rootId, id, className, cachePoolType);
            }
            if (view == null) {
                View rootView = mControllerRegistry.getRootView(rootId);
                if (rootView == null) {
                    return null;
                }
                HippyViewController<?> controller = mControllerRegistry.getViewController(className);
                if (controller == null) {
                    return null;
                }
                view = controller.createView(rootView, id, mRenderer, className, node.getProps());
                node.setNodeFlag(FLAG_UPDATE_LAYOUT);
            }
            if (view != null) {
                mControllerRegistry.addView(view, rootId, id);
            }
        }
        return view;
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public void updateProps(@NonNull RenderNode node, @Nullable Map<String, Object> newProps,
            @Nullable Map<String, Object> events, @Nullable Map<String, Object> diffProps,
            boolean skipComponentProps) {
        View view = mControllerRegistry.getView(node.getRootId(), node.getId());
        HippyViewController controller = mControllerRegistry.getViewController(node.getClassName());
        if (controller == null) {
            return;
        }
        Map<String, Object> total = null;
        try {
            if (newProps != null) {
                total = new HashMap<>(newProps);
            }
            if (events != null) {
                if (total == null) {
                    total = new HashMap<>(events);
                } else {
                    total.putAll(events);
                }
            }
        } catch (Exception ignored) {
            // If merge props and events failed, just use empty map
        }
        if (total != null) {
            mControllerUpdateManger.updateProps(node, controller, view, total, skipComponentProps);
            if (view != null) {
                controller.onAfterUpdateProps(view);
                // The purpose of calling the update events interface separately here is to
                // handle those event that are not registered by controller annotation.
                controller.updateEvents(view, events);
            }
            node.setNodeFlag(FLAG_ALREADY_UPDATED);
        }
        if (diffProps != null && node.getHostView() != null) {
            mControllerUpdateManger.updateProps(node, controller, node.getHostView(), diffProps,
                    skipComponentProps);
        }
    }

    @SuppressWarnings("rawtypes")
    public void updateLayout(String name, int rootId, int id, int x, int y, int width, int height) {
        HippyViewController controller = mControllerRegistry.getViewController(name);
        if (controller != null) {
            controller.updateLayout(rootId, id, x, y, width, height, mControllerRegistry);
        }
    }

    public void addRootView(View rootView) {
        mControllerRegistry.addRootView(rootView);
    }

    @Nullable
    public View getRootView(int rootId) {
        return mControllerRegistry.getRootView(rootId);
    }

    public void updateExtra(int rootId, int id, String name, @Nullable Object extra) {
        HippyViewController<?> controller = mControllerRegistry.getViewController(name);
        if (controller != null) {
            View view = mControllerRegistry.getView(rootId, id);
            if (view != null) {
                controller.updateExtra(view, extra);
            }
        }
    }

    public void moveView(int rootId, int id, int oldPid, int newPid, int index) {
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null) {
            return;
        }
        View oldParent = mControllerRegistry.getView(rootId, oldPid);
        if (oldParent instanceof ViewGroup) {
            String className = NativeViewTag.getClassName(oldParent);
            HippyViewController<?> controller = null;
            if (className != null) {
                controller = mControllerRegistry.getViewController(className);
            }
            if (controller != null) {
                controller.deleteChild((ViewGroup) oldParent, view);
            }
        }
        View newParent = mControllerRegistry.getView(rootId, newPid);
        if (newParent instanceof ViewGroup) {
            String className = NativeViewTag.getClassName(newParent);
            HippyViewController<?> controller = null;
            if (className != null) {
                controller = mControllerRegistry.getViewController(className);
            }
            if (controller != null) {
                controller.addView((ViewGroup) newParent, view, index);
            }
        }
    }

    public boolean checkComponentProperty(@NonNull String key) {
        return mControllerUpdateManger.checkComponentProperty(key);
    }

    public boolean checkLazy(@NonNull String className) {
        ControllerHolder holder = mControllerRegistry.getControllerHolder(className);
        return holder != null && holder.isLazy();
    }

    public boolean checkFlatten(@NonNull String className) {
        ControllerHolder holder = mControllerRegistry.getControllerHolder(className);
        return holder != null && holder.supportFlatten();
    }

    public void replaceId(int rootId, @NonNull View view, int newId, boolean shouldRemove) {
        int oldId = view.getId();
        if (oldId == newId) {
            return;
        }
        if (shouldRemove) {
            mControllerRegistry.removeView(rootId, oldId);
        }
        if (view instanceof HippyHorizontalScrollView) {
            ((HippyHorizontalScrollView) view).setContentOffset4Reuse();
        }
        view.setId(newId);
        mControllerRegistry.addView(view, rootId, newId);
    }

    @Nullable
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            String className, boolean isLazy) {
        HippyViewController<?> controller = mControllerRegistry.getViewController(className);
        if (controller != null) {
            return controller.createRenderNode(rootId, id, props, className, this, isLazy);
        }
        return null;
    }

    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @NonNull String className,
            @Nullable Map<String, Object> props) {
        HippyViewController<?> controller = mControllerRegistry.getViewController(className);
        if (controller != null) {
            return controller.createVirtualNode(rootId, id, pid, index, props);
        }
        return null;
    }

    @SuppressWarnings({"rawtypes", "unchecked", "deprecation"})
    public void dispatchUIFunction(int rootId, int id, @NonNull String className,
            @NonNull String functionName,
            @NonNull List<Object> params, @Nullable Promise promise) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null || controller == null) {
            if (promise != null) {
                promise.resolve("view or controller is null");
            }
            return;
        }
        HippyController controllerAnnotation = controller.getClass()
                .getAnnotation(HippyController.class);
        boolean dispatchWithStandardType =
                controllerAnnotation != null && controllerAnnotation.dispatchWithStandardType();
        if (promise == null) {
            if (dispatchWithStandardType) {
                controller.dispatchFunction(view, functionName, params);
            } else {
                controller.dispatchFunction(view, functionName, new HippyArray(params));
            }
        } else {
            if (dispatchWithStandardType) {
                controller.dispatchFunction(view, functionName, params, promise);
            } else {
                controller.dispatchFunction(view, functionName, new HippyArray(params), promise);
            }
        }
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public void onBatchStart(int rootId, int id, String className) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view != null && controller != null) {
            controller.onBatchStart(view);
        }
    }

    public void onBatchEnd(int rootId) {
        Pool<Integer, View> pool = mPreCreateViewPools.get(rootId);
        if (pool != null) {
            pool.clear();
        }
    }

    @SuppressWarnings("rawtypes")
    public void onBatchComplete(int rootId, int id, String className) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view != null && controller != null && !className.equals(NodeProps.ROOT_NODE)) {
            controller.onBatchComplete(view);
        }
    }

    private boolean checkRecyclable(@Nullable HippyViewController controller, boolean recyclable) {
        if (controller == null) {
            return recyclable;
        }
        return controller.isRecyclable() && recyclable;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    public void deleteChildRecursive(int rootId, ViewGroup parent, View child, boolean recyclable) {
        if (child == null) {
            return;
        }
        HippyViewController childController = null;
        String childTag = NativeViewTag.getClassName(child);
        if (childTag != null) {
            childController = mControllerRegistry.getViewController(childTag);
            if (childController != null) {
                childController.onViewDestroy(child);
            }
        }
        if (child instanceof ViewGroup) {
            int count;
            View grandson;
            if (childController != null) {
                count = childController.getChildCount(child);
                for (int i = count - 1; i >= 0; i--) {
                    grandson = childController.getChildAt(child, i);
                    deleteChildRecursive(rootId, (ViewGroup) child, grandson, recyclable);
                }
            } else {
                count = ((ViewGroup) child).getChildCount();
                for (int i = count - 1; i >= 0; i--) {
                    grandson = ((ViewGroup) child).getChildAt(i);
                    deleteChildRecursive(rootId, (ViewGroup) child, grandson, recyclable);
                }
            }
        }
        if (parent != null) {
            String parentTag = NativeViewTag.getClassName(parent);
            if (parentTag != null) {
                HippyViewController parentController = mControllerRegistry.getViewController(
                        parentTag);
                if (parentController != null) {
                    parentController.deleteChild(parent, child);
                }
            } else {
                parent.removeView(child);
            }
        }
        mControllerRegistry.removeView(rootId, child.getId());
        if (checkRecyclable(childController, recyclable) && childTag != null) {
            Pool<String, View> pool = mRecycleViewPools.get(rootId);
            if (pool == null) {
                pool = new RecycleViewPool();
                mRecycleViewPools.put(rootId, pool);
            }
            pool.release(childTag, child);
        }
    }

    public void deleteChild(int rootId, int pId, int childId, boolean recyclable) {
        View parent = mControllerRegistry.getView(rootId, pId);
        View child = mControllerRegistry.getView(rootId, childId);
        if (parent instanceof ViewGroup && child != null) {
            deleteChildRecursive(rootId, (ViewGroup) parent, child, recyclable);
        } else {
            reportRemoveViewException(pId, parent, childId, child);
        }
    }

    public void addChild(int rootId, int pid, @NonNull RenderNode node) {
        View child = mControllerRegistry.getView(rootId, node.getId());
        View parent = mControllerRegistry.getView(rootId, pid);
        if (child != null && parent instanceof ViewGroup && child.getParent() == null) {
            String parentClassName = NativeViewTag.getClassName(parent);
            HippyViewController<?> controller = null;
            if (parentClassName != null) {
                controller = mControllerRegistry.getViewController(parentClassName);
            }
            if (controller != null) {
                controller.addView((ViewGroup) parent, child, node.indexOfDrawingOrder());
            }
        } else {
            reportAddViewException(pid, parent, node.getId(), child);
        }
    }

    public void deleteRootView(int rootId) {
        View view = mControllerRegistry.getRootView(rootId);
        if (view != null) {
            ViewGroup hippyRootView = (ViewGroup) view;
            int count = hippyRootView.getChildCount();
            for (int i = count - 1; i >= 0; i--) {
                deleteChild(rootId, rootId, hippyRootView.getChildAt(i).getId(), false);
            }
        }
        mControllerRegistry.removeRootView(rootId);
    }

    private String getViewOperationExceptionMessage(int pid, View parent, int id, View child,
            String prefix) {
        String parentTag = "";
        String parentClass = "";
        String childTag = "";
        String childClass = "";
        if (parent != null) {
            parentTag = NativeViewTag.getClassName(parent);
            parentClass = parent.getClass().getName();
        }
        if (child != null) {
            childTag = NativeViewTag.getClassName(child);
            childClass = child.getClass().getName();
        }
        return prefix + " id=" + id
                + ", childTag=" + childTag
                + ", childClass=" + childClass
                + ", pid=" + pid
                + ", parentTag=" + parentTag
                + ", parentClass=" + parentClass;
    }

    private void reportRemoveViewException(int pid, View parent, int id, View child) {
        if (mRenderer != null) {
            NativeRenderException exception = new NativeRenderException(
                    REMOVE_CHILD_VIEW_FAILED_ERR,
                    getViewOperationExceptionMessage(pid, parent, id, child,
                            "Remove view failed:"));
            mRenderer.handleRenderException(exception);
        }
    }

    private void reportAddViewException(int pid, View parent, int id, View child) {
        if (mRenderer != null) {
            NativeRenderException exception = new NativeRenderException(ADD_CHILD_VIEW_FAILED_ERR,
                    getViewOperationExceptionMessage(pid, parent, id, child,
                            "Add child to parent failed:"));
            mRenderer.handleRenderException(exception);
        }
    }
}
