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

import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.list.HippyListItemViewController;
import com.tencent.mtt.hippy.views.list.HippyRecycler;
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
import com.tencent.mtt.hippy.views.waterfalllist.HippyWaterfallItemViewController;
import com.tencent.mtt.hippy.views.waterfalllist.HippyWaterfallViewController;
import com.tencent.mtt.hippy.views.webview.HippyWebViewController;
import com.tencent.renderer.NativeRender;

import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.component.text.VirtualNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("rawtypes")
public class ControllerManager {

    private static final String TAG = "ControllerManager";
    @NonNull
    private final Renderer mRenderer;
    @NonNull
    private final ControllerRegistry mControllerRegistry;
    @NonNull
    final ControllerUpdateManger<HippyViewController, View> mControllerUpdateManger;

    public ControllerManager(@NonNull Renderer renderer) {
        mRenderer = renderer;
        mControllerRegistry = new ControllerRegistry(renderer);
        mControllerUpdateManger = new ControllerUpdateManger(renderer);
    }

    public void init(@Nullable List<Class<?>> controllers) {
        processControllers(controllers);
        mControllerUpdateManger.setCustomPropsController(mControllerRegistry.getViewController(
                HippyCustomPropsController.CLASS_NAME));
    }

    public RenderManager getRenderManager() {
        return ((NativeRender) mRenderer).getRenderManager();
    }

    @NonNull
    private List<Class<?>> getDefaultControllers() {
        List<Class<?>> controllers = new ArrayList<>();
        controllers.add(HippyTextViewController.class);
        controllers.add(HippyViewGroupController.class);
        controllers.add(HippyImageViewController.class);
        controllers.add(HippyRecyclerViewController.class);
        controllers.add(HippyListItemViewController.class);
        controllers.add(HippyTextInputController.class);
        controllers.add(HippyScrollViewController.class);
        controllers.add(HippyViewPagerController.class);
        controllers.add(HippyViewPagerItemController.class);
        controllers.add(HippyModalHostManager.class);
        controllers.add(RefreshWrapperController.class);
        controllers.add(RefreshWrapperItemController.class);
        controllers.add(HippyPullHeaderViewController.class);
        controllers.add(HippyPullFooterViewController.class);
        controllers.add(HippyWebViewController.class);
        controllers.add(HippyCustomPropsController.class);
        controllers.add(HippyWaterfallViewController.class);
        controllers.add(HippyWaterfallItemViewController.class);
        return controllers;
    }

    private void processControllers(@Nullable List<Class<?>> controllers) {
        List<Class<?>> defaultControllers = getDefaultControllers();
        if (controllers != null) {
            controllers.addAll(0, defaultControllers);
        } else {
            controllers = defaultControllers;
        }
        for (Class cls : controllers) {
            if (!HippyViewController.class.isAssignableFrom(cls)) {
                continue;
            }
            HippyController controllerAnnotation = (HippyController) cls
                    .getAnnotation(HippyController.class);
            String name = controllerAnnotation.name();
            String[] names = controllerAnnotation.names();
            boolean lazy = controllerAnnotation.isLazyLoad();
            try {
                ControllerHolder holder = new ControllerHolder(
                        (HippyViewController) cls.newInstance(), lazy);
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
        mControllerRegistry.addControllerHolder(NodeProps.ROOT_NODE,
                new ControllerHolder(new HippyViewGroupController(), false));
    }

    public void destroy() {
        int count = mControllerRegistry.getRootViewCount();
        if (count > 0) {
            for (int i = 0; i < count; i++) {
                deleteRootView(mControllerRegistry.getRootIdAt(i));
            }
        }
    }

    @Nullable
    public View findView(int rootId, int id) {
        return mControllerRegistry.getView(rootId, id);
    }

    public boolean hasView(int rootId, int id) {
        return findView(rootId, id) != null;
    }

    public View createView(int rootId, int id, @NonNull String className,
            @Nullable Map<String, Object> props) {
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null) {
            View rootView = mControllerRegistry.getRootView(rootId);
            if (rootView != null) {
                HippyViewController controller = mControllerRegistry.getViewController(className);
                view = controller.createView(rootView, id, mRenderer, className, props);
                if (view != null) {
                    mControllerRegistry.addView(view);
                }
            }
        }
        return view;
    }

    public void updateView(int rootId, int id, @NonNull String name, @Nullable Map<String, Object> newProps,
            @Nullable Map<String, Object> events) {
        View view = mControllerRegistry.getView(rootId, id);
        HippyViewController controller = mControllerRegistry.getViewController(name);
        if (view == null || controller == null) {
            return;
        }
        Map<String, Object> total = new HashMap<>();
        try {
            if (newProps != null) {
                total.putAll(newProps);
            }
            if (events != null) {
                total.putAll(events);
            }
        } catch (Exception ignored) {
            // If merge props and events failed, just use empty map
        }
        if (!total.isEmpty()) {
            mControllerUpdateManger.updateProps(controller, view, total);
            controller.onAfterUpdateProps(view);
        }
    }

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
        HippyViewController controller = mControllerRegistry.getViewController(name);
        if (controller != null) {
            View view = mControllerRegistry.getView(rootId, id);
            controller.updateExtra(view, extra);
        }
    }

    public void moveView(int rootId, int id, int newPid, int index) {
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null) {
            return;
        }
        if (view.getParent() != null) {
            ViewGroup oldParent = (ViewGroup) view.getParent();
            oldParent.removeView(view);
        }
        ViewGroup newParent = (ViewGroup) mControllerRegistry.getView(rootId, newPid);
        if (newParent != null) {
            String className = NativeViewTag.getClassName(newParent);
            HippyViewController controller = null;
            if (className != null) {
                controller = mControllerRegistry.getViewController(className);
            }
            if (controller != null) {
                controller.addView(newParent, view, index);
            }
        }
    }

    public boolean isControllerLazy(String className) {
        return mControllerRegistry.getControllerHolder(className).isLazy();
    }

    public void replaceID(int rootId, int oldId, int newId) {
        View view = mControllerRegistry.getView(rootId, oldId);
        mControllerRegistry.removeView(rootId, oldId);
        if (view == null) {
            return;
        }
        view.setId(newId);
        if (view instanceof HippyRecycler) {
            ((HippyRecycler) view).clear();
        }
        if (view instanceof HippyHorizontalScrollView) {
            ((HippyHorizontalScrollView) view).setContentOffset4Reuse();
        }
        mControllerRegistry.addView(view);
    }

    public void postInvalidateDelayed(int rootId, int id, long delayMilliseconds) {
        View view = mControllerRegistry.getView(rootId, id);
        if (view != null) {
            view.postInvalidateDelayed(delayMilliseconds);
        }
    }

    @Nullable
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            String className, boolean isLazy) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        if (controller != null) {
            return controller.createRenderNode(rootId, id, props, className, this, isLazy);
        }
        return null;
    }

    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        if (controller != null) {
            return controller.createVirtualNode(rootId, id, pid, index, props);
        }
        return null;
    }

    public void dispatchUIFunction(int rootId, int id, @NonNull String className, @NonNull String functionName,
            @NonNull List<Object> params, @Nullable Promise promise) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view == null || controller == null) {
            return;
        }
        HippyController controllerAnnotation = controller.getClass().getAnnotation(HippyController.class);
        boolean useSystemStandardType =
                controllerAnnotation != null ? controllerAnnotation.useSystemStandardType() : false;
        if (promise == null) {
            if (useSystemStandardType) {
                controller.dispatchFunction(view, functionName, params);
            } else {
                controller.dispatchFunction(view, functionName, new HippyArray(params));
            }
        } else {
            if (useSystemStandardType) {
                controller.dispatchFunction(view, functionName, params, promise);
            } else {
                controller.dispatchFunction(view, functionName, new HippyArray(params), promise);
            }
        }
    }

    public void onBatchStart(int rootId, int id, String className) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view != null && controller != null) {
            controller.onBatchStart(view);
        }
    }

    public void onBatchComplete(int rootId, int id, String className) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(rootId, id);
        if (view != null && controller != null) {
            controller.onBatchComplete(view);
        }
    }

    public void deleteChildRecursive(ViewGroup parent, View child, int childIndex) {
        if (parent == null || child == null) {
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
                    deleteChildRecursive((ViewGroup) child, grandson, -1);
                }
            } else {
                count = ((ViewGroup) child).getChildCount();
                for (int i = count - 1; i >= 0; i--) {
                    grandson = ((ViewGroup) child).getChildAt(i);
                    deleteChildRecursive((ViewGroup) child, grandson, -1);
                }
            }
        }
        String parentTag = NativeViewTag.getClassName(parent);
        if (parentTag != null) {
            HippyViewController parentController = mControllerRegistry.getViewController(
                    parentTag);
            if (parentController != null) {
                parentController.deleteChild(parent, child, childIndex);
            }
        } else {
            parent.removeView(child);
        }
        mControllerRegistry.removeView(child);
    }

    public void deleteChild(int rootId, int pId, int childId) {
        deleteChild(rootId, pId, childId, -1);
    }

    public void deleteChild(int rootId, int pId, int childId, int childIndex) {
        View parent = mControllerRegistry.getView(rootId, pId);
        View child = mControllerRegistry.getView(rootId, childId);
        if (parent instanceof ViewGroup && child != null) {
            deleteChildRecursive((ViewGroup) parent, child, childIndex);
        }
    }

    public void addChild(int rootId, int pid, int id, int index) {
        View child = mControllerRegistry.getView(rootId, id);
        View parent = mControllerRegistry.getView(rootId, pid);
        if (child != null && parent instanceof ViewGroup && child.getParent() == null) {
            String parentClassName = NativeViewTag.getClassName(parent);
            HippyViewController controller = null;
            if (parentClassName != null) {
                controller = mControllerRegistry.getViewController(parentClassName);
            }
            if (controller != null) {
                controller.addView((ViewGroup) parent, child, index);
            }
        } else {
            reportAddChildException(pid, parent, id, child);
        }
    }

    public void deleteRootView(int rootId) {
        View view = mControllerRegistry.getRootView(rootId);
        if (view != null) {
            ViewGroup hippyRootView = (ViewGroup) view;
            int count = hippyRootView.getChildCount();
            for (int i = count - 1; i >= 0; i--) {
                deleteChild(rootId, rootId, hippyRootView.getChildAt(i).getId());
            }
        }
        mControllerRegistry.removeRootView(rootId);
    }

    private void reportAddChildException(int pid, View parent, int id, View child) {
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
        String message = "Add child to parent failed: id=" + id
                + ", childTag=" + childTag
                + ", childClass=" + childClass
                + ", pid=" + pid
                + ", parentTag=" + parentTag
                + ", parentClass=" + parentClass;
        NativeRenderException exception = new NativeRenderException(ADD_CHILD_VIEW_FAILED_ERR,
                message);
        mRenderer.handleRenderException(exception);
    }

    public void removeViewFromRegistry(int rootId, int id) {
        View view = mControllerRegistry.getView(rootId, id);
        if (view instanceof ViewGroup) {
            for (int i = ((ViewGroup) view).getChildCount() - 1; i >= 0; i--) {
                View child = ((ViewGroup) view).getChildAt(i);
                if (child != null) {
                    removeViewFromRegistry(rootId, child.getId());
                }
            }
        }
        if (view != null) {
            mControllerRegistry.removeView(rootId, view.getId());
        }
    }
}
