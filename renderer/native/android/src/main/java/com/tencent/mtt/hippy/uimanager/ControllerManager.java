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

import android.annotation.SuppressLint;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.HippyTag;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.list.HippyListItemViewController;
import com.tencent.mtt.hippy.views.list.HippyListViewController;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"deprecation", "unchecked", "rawtypes", "unused"})
public class ControllerManager {

    @NonNull
    private final NativeRender mNativeRenderer;
    @NonNull
    final ControllerRegistry mControllerRegistry;
    @NonNull
    final ControllerUpdateManger<HippyViewController, View> mControllerUpdateManger;

    public ControllerManager(@NonNull NativeRender nativeRenderer,
            @Nullable List<Class<?>> controllers) {
        mNativeRenderer = nativeRenderer;
        mControllerRegistry = new ControllerRegistry(nativeRenderer);
        mControllerUpdateManger = new ControllerUpdateManger();
        processControllers(controllers);
        mControllerUpdateManger.setCustomPropsController(mControllerRegistry.getViewController(
                HippyCustomPropsController.CLASS_NAME));
    }

    public RenderManager getRenderManager() {
        return mNativeRenderer.getRenderManager();
    }

    @NonNull
    private List<Class<?>> getDefaultControllers() {
        List<Class<?>> controllers = new ArrayList<>();
        controllers.add(HippyTextViewController.class);
        controllers.add(HippyViewGroupController.class);
        controllers.add(HippyImageViewController.class);
        controllers.add(HippyListViewController.class);
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
            HippyController hippyNativeModule = (HippyController) cls
                    .getAnnotation(HippyController.class);
            assert hippyNativeModule != null;
            String name = hippyNativeModule.name();
            String[] names = hippyNativeModule.names();
            boolean lazy = hippyNativeModule.isLazyLoad();
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
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                int count = mControllerRegistry.getRootViewCount();
                if (count > 0) {
                    for (int i = count - 1; i >= 0; i--) {
                        deleteRootView(mControllerRegistry.getRootIDAt(i));
                    }
                }
            }
        });
    }

    public View findView(int id) {
        return mControllerRegistry.getView(id);
    }

    public boolean hasView(int id) {
        return mControllerRegistry.getView(id) != null;
    }

    public View createView(@Nullable ViewGroup rootView, int id, @NonNull String className,
            @Nullable Map<String, Object> props) {
        View view = mControllerRegistry.getView(id);
        if (view == null) {
            HippyViewController controller = mControllerRegistry.getViewController(className);
            view = controller.createView(rootView, id, mNativeRenderer, className, props);
            if (view != null) {
                mControllerRegistry.addView(view);
            }
        }
        return view;
    }

    public void updateView(int id, @NonNull String name, @Nullable Map<String, Object> newProps,
            @Nullable Map<String, Object> events) {
        View view = mControllerRegistry.getView(id);
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

    public void updateLayout(String name, int id, int x, int y, int width, int height) {
        HippyViewController controller = mControllerRegistry.getViewController(name);
        controller.updateLayout(id, x, y, width, height, mControllerRegistry);
    }

    public void addRootView(ViewGroup rootView) {
        mControllerRegistry.addRootView(rootView);
    }

    public void updateExtra(int id, String name, Object extra) {
        HippyViewController controller = mControllerRegistry.getViewController(name);
        View view = mControllerRegistry.getView(id);
        controller.updateExtra(view, extra);
    }

    public void move(int id, int newPid, int index) {
        View view = mControllerRegistry.getView(id);
        if (view == null) {
            return;
        }
        if (view.getParent() != null) {
            ViewGroup oldParent = (ViewGroup) view.getParent();
            oldParent.removeView(view);
        }
        ViewGroup newParent = (ViewGroup) mControllerRegistry.getView(newPid);
        if (newParent != null) {
            String className = HippyTag.getClassName(newParent);
            mControllerRegistry.getViewController(className)
                    .addView(newParent, view, index);
        }
    }

    public boolean isControllerLazy(String className) {
        return mControllerRegistry.getControllerHolder(className).isLazy();
    }

    public void replaceID(int oldId, int newId) {
        View view = mControllerRegistry.getView(oldId);
        mControllerRegistry.removeView(oldId);
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

    public void postInvalidateDelayed(int id, long delayMilliseconds) {
        View view = mControllerRegistry.getView(id);
        if (view != null) {
            view.postInvalidateDelayed(delayMilliseconds);
        }
    }

    public RenderNode createRenderNode(int id, @Nullable Map<String, Object> props,
            String className, ViewGroup hippyRootView, boolean isLazy) {
        return mControllerRegistry.getViewController(className)
                .createRenderNode(id, props, className, hippyRootView, this, isLazy);
    }

    public void dispatchUIFunction(int id, String className, String functionName,
            List<Object> params, Promise promise) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(id);
        if (view == null || controller == null) {
            return;
        }
        if (promise == null) {
            controller.dispatchFunction(view, functionName, params);
        } else {
            controller.dispatchFunction(view, functionName, params, promise);
        }
    }

    public void onBatchComplete(String className, int id) {
        HippyViewController controller = mControllerRegistry.getViewController(className);
        View view = mControllerRegistry.getView(id);
        if (view != null) {
            controller.onBatchComplete(view);
        }
    }

    public void deleteChildRecursive(ViewGroup viewParent, View child, int childIndex) {
        if (viewParent == null || child == null) {
            return;
        }
        HippyViewController hippyChildViewController = null;
        String childTagString = HippyTag.getClassName(child);
        if (!TextUtils.isEmpty(childTagString)) {
            hippyChildViewController = mControllerRegistry.getViewController(childTagString);
            if (hippyChildViewController != null) {
                hippyChildViewController.onViewDestroy(child);
            }
        }

        if (child instanceof ViewGroup) {
            ViewGroup childViewGroup = (ViewGroup) child;
            if (hippyChildViewController != null) {
                for (int i = hippyChildViewController.getChildCount(childViewGroup) - 1; i >= 0;
                        i--) {
                    deleteChildRecursive(childViewGroup,
                            hippyChildViewController.getChildAt(childViewGroup, i), -1);
                }
            } else {
                for (int i = childViewGroup.getChildCount() - 1; i >= 0; i--) {
                    deleteChildRecursive(childViewGroup, childViewGroup.getChildAt(i), -1);
                }
            }
        }

        if (mControllerRegistry.getView(child.getId()) != child
                && mControllerRegistry.getView(viewParent.getId()) != viewParent) {
            return;
        }

        String parentTagString = HippyTag.getClassName(viewParent);
        if (parentTagString != null) {
            //remove component Like listView there is a RecycleItemView is not js UI
            if (mControllerRegistry.getControllerHolder(parentTagString) != null) {
                HippyViewController hippyViewController = mControllerRegistry.getViewController(
                        parentTagString);
                hippyViewController.deleteChild(viewParent, child, childIndex);
                //				LogUtils.d("HippyListView", "delete " + child.getId());
            }
        } else {
            viewParent.removeView(child);
        }
        mControllerRegistry.removeView(child.getId());
    }

    public void deleteChild(int pId, int childId) {
        deleteChild(pId, childId, -1);
    }

    public void deleteChild(int pId, int childId, int childIndex) {
        View parentView = mControllerRegistry.getView(pId);
        View childView = mControllerRegistry.getView(childId);
        if (parentView instanceof ViewGroup && childView != null) {
            deleteChildRecursive((ViewGroup) parentView, childView, childIndex);
        }
    }

    @SuppressLint("Range")
    public void measureInWindow(int id, Promise promise) {
        View v = mControllerRegistry.getView(id);
        if (v == null) {
            promise.reject("Accessing view that do not exist!");
        } else {
            int[] outputBuffer = new int[4];
            int statusBarHeight;
            try {
                v.getLocationOnScreen(outputBuffer);

                // We need to remove the status bar from the height.  getLocationOnScreen will include the
                // status bar.
                statusBarHeight = DimensionsUtil.getStatusBarHeight();
                if (statusBarHeight > 0) {
                    outputBuffer[1] -= statusBarHeight;
                }

                // outputBuffer[0,1] already contain what we want
                outputBuffer[2] = v.getWidth();
                outputBuffer[3] = v.getHeight();
            } catch (Throwable e) {
                promise.reject("exception" + e.getMessage());
                e.printStackTrace();
                return;
            }

            float x = PixelUtil.px2dp(outputBuffer[0]);
            float y = PixelUtil.px2dp(outputBuffer[1]);
            float width = PixelUtil.px2dp(outputBuffer[2]);
            float height = PixelUtil.px2dp(outputBuffer[3]);
            float fStatusbarHeight = PixelUtil.px2dp(statusBarHeight);

            HippyMap hippyMap = new HippyMap();
            hippyMap.pushDouble("x", x);
            hippyMap.pushDouble("y", y);
            hippyMap.pushDouble("width", width);
            hippyMap.pushDouble("height", height);
            hippyMap.pushDouble("statusBarHeight", fStatusbarHeight);
            promise.resolve(hippyMap);
        }

    }

    public void addChild(int pid, int id, int index) {
        View childView = mControllerRegistry.getView(id);
        View parentView = mControllerRegistry.getView(pid);

        if (childView != null && parentView instanceof ViewGroup) {
            if (childView.getParent() == null) {
                LogUtils.d("ControllerManager", "addChild id: " + id + " pid: " + pid);
                String parentClassName = HippyTag.getClassName(parentView);
                mControllerRegistry.getViewController(parentClassName)
                        .addView((ViewGroup) parentView, childView, index);
            }
        } else {
            RenderNode parentNode = mNativeRenderer.getRenderManager().getRenderNode(pid);
            String renderNodeClass = "null";
            if (parentNode != null) {
                renderNodeClass = parentNode.getClassName();
            }

            // 上报重要错误
            // 这个错误原因是：前端用了某个UI控件来做父亲，而这个UI控件实际上是不应该做父亲的（不是ViewGroup），务必要把这个parentView的className打出来
            String parentTag = null, parentClass = null, childTag = null, childClass = null;
            if (parentView != null) {
                Object temp = HippyTag.getClassName(parentView);
                if (temp != null) {
                    parentTag = temp.toString();
                }
                parentClass = parentView.getClass().getName();
            }
            if (childView != null) {
                Object temp = HippyTag.getClassName(childView);
                if (temp != null) {
                    childTag = temp.toString();
                }
                childClass = childView.getClass().getName();
            }
            Exception exception = new RuntimeException(
                    "child null or parent not ViewGroup pid " + pid
                            + " parentTag " + parentTag
                            + " parentClass " + parentClass
                            + " renderNodeClass " + renderNodeClass + " id " + id
                            + " childTag " + childTag
                            + " childClass " + childClass);
            mNativeRenderer.handleRenderException(exception);
        }
    }

    public void deleteRootView(int rootId) {
        View view = mControllerRegistry.getRootView(rootId);
        if (view != null) {
            ViewGroup hippyRootView = (ViewGroup) view;
            int count = hippyRootView.getChildCount();
            for (int i = count - 1; i >= 0; i--) {
                deleteChild(rootId, hippyRootView.getChildAt(i).getId());
            }
        }
        mControllerRegistry.removeRootView(rootId);
    }
}
