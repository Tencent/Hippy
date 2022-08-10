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

import android.content.Context;
import android.os.Looper;
import android.os.MessageQueue;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.DevtoolsUtil;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.ClipChildrenView;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.FlatViewGroup;
import com.tencent.renderer.component.text.VirtualNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
public abstract class HippyViewController<T extends View & HippyViewBase> implements
        View.OnFocusChangeListener {

    private static final String TAG = "HippyViewController";
    private static final String MEASURE_IN_WINDOW = "measureInWindow";
    private static final MatrixUtil.MatrixDecompositionContext sMatrixDecompositionContext = new MatrixUtil.MatrixDecompositionContext();
    private static final double[] sTransformDecompositionArray = new double[16];
    private boolean bUserChangeFocus = false;
    @Nullable
    private NativeRender mNativeRenderer;

    public View createView(@NonNull View rootView, int id, @NonNull Renderer renderer,
            @NonNull String className, @Nullable Map<String, Object> props) {
        View view = null;
        Context context = rootView.getContext();
        Object object = renderer.getCustomViewCreator();
        if (object instanceof HippyCustomViewCreator) {
            view = ((HippyCustomViewCreator) object)
                    .createCustomView(className, context, props);
        }
        if (view == null) {
            view = createViewImpl(context, props);
            if (view == null) {
                view = createViewImpl(context);
            }
        }
        view.setId(id);
        Map<String, Object> tagMap = NativeViewTag.createViewTag(className, rootView.getId());
        view.setTag(tagMap);
        return view;
    }

    public void onAfterUpdateProps(T view) {
        view.invalidate();
    }

    protected void updateExtra(@NonNull View view, @Nullable Object object) {
        view.invalidate();
    }

    public void updateLayout(int rootId, int id, int x, int y, int width, int height,
            ControllerRegistry componentHolder) {
        View view = componentHolder.getView(rootId, id);
        if (view != null) {
            view.measure(View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));
            if (!shouldInterceptLayout(view, x, y, width, height)) {
                view.layout(x, y, x + width, y + height);
            }
        }
    }

    protected boolean shouldInterceptLayout(View view, int x, int y, int width, int height) {
        return false;
    }

    @SuppressWarnings("BooleanMethodIsAlwaysInverted")
    protected boolean handleGestureBySelf() {
        return false;
    }

    protected abstract View createViewImpl(Context context);

    protected View createViewImpl(@NonNull Context context, @Nullable Map<String, Object> props) {
        return null;
    }

    /**
     * transform
     **/
    @HippyControllerProps(name = NodeProps.TRANSFORM, defaultType = HippyControllerProps.ARRAY)
    public void setTransform(T view, ArrayList transformArray) {
        if (transformArray == null) {
            resetTransform(view);
        } else {
            applyTransform(view, transformArray);
        }
    }

    @HippyControllerProps(name = NodeProps.PROP_ACCESSIBILITY_LABEL)
    public void setAccessibilityLabel(T view, String accessibilityLabel) {
        if (accessibilityLabel == null) {
            accessibilityLabel = "";
        }
        view.setContentDescription(accessibilityLabel);
    }

    /**
     * zIndex
     **/
    @HippyControllerProps(name = NodeProps.Z_INDEX, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setZIndex(T view, int zIndex) {
        HippyViewGroupController.setViewZIndex(view, zIndex);
        ViewParent parent = view.getParent();
        if (parent instanceof IHippyZIndexViewGroup) {
            ((IHippyZIndexViewGroup) parent).updateDrawingOrder();
        }
    }

    @HippyControllerProps(name = NodeProps.OPACITY, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1.f)
    public void setOpacity(T view, float opacity) {
        view.setAlpha(opacity);
    }

    @HippyControllerProps(name = NodeProps.NEXT_FOCUS_DOWN_ID, defaultType = HippyControllerProps.BOOLEAN)
    public void setNextFocusDownId(T view, int id) {
        view.setNextFocusDownId(id);
    }

    @HippyControllerProps(name = NodeProps.NEXT_FOCUS_UP_ID, defaultType = HippyControllerProps.BOOLEAN)
    public void setNextFocusUpId(T view, int id) {
        view.setNextFocusUpId(id);
    }

    @HippyControllerProps(name = NodeProps.NEXT_FOCUS_LEFT_ID, defaultType = HippyControllerProps.BOOLEAN)
    public void setNextFocusLeftId(T view, int id) {
        view.setNextFocusLeftId(id);
    }

    @HippyControllerProps(name = NodeProps.NEXT_FOCUS_RIGHT_ID, defaultType = HippyControllerProps.BOOLEAN)
    public void setNextFocusRightId(T view, int id) {
        view.setNextFocusRightId(id);
    }

    @HippyControllerProps(name = NodeProps.FOCUSABLE, defaultType = HippyControllerProps.BOOLEAN)
    public void setFocusable(T view, boolean focusable) {
        view.setFocusable(focusable);
        if (focusable) {
            view.setOnFocusChangeListener(this);
        } else {
            view.setOnFocusChangeListener(null);
        }
    }

    @HippyControllerProps(name = NodeProps.REQUEST_FOCUS, defaultType = HippyControllerProps.BOOLEAN)
    public void requestFocus(final T view, boolean request) {
        if (request) {
            //noinspection AccessStaticViaInstance
            Looper.getMainLooper().myQueue().addIdleHandler(new MessageQueue.IdleHandler() {
                @Override
                public boolean queueIdle() {
                    bUserChangeFocus = true;
                    boolean result = view.requestFocusFromTouch();

                    if (!result) {
                        result = view.requestFocus();
                        LogUtils.d("requestFocus", "requestFocus result:" + result);
                    }
                    bUserChangeFocus = false;
                    return false;
                }
            });

        }
    }

    @Override
    public void onFocusChange(View v, boolean hasFocus) {
        if (bUserChangeFocus) {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushBoolean("focus", hasFocus);
            new HippyViewEvent("onFocus").send(v, hippyMap);
        }
    }

    /**
     * touch/click
     **/
    @HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN)
    public void setClickable(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            if (flag) {
                view.setOnClickListener(NativeGestureDispatcher.getOnClickListener());
            } else {
                view.setOnClickListener(null);
                view.setClickable(false);
            }
        }
    }

    @HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN)
    public void setLongClickable(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            if (flag) {
                view.setOnLongClickListener(NativeGestureDispatcher.getOnLongClickListener());
            } else {
                view.setOnLongClickListener(null);
                view.setLongClickable(false);
            }
        }
    }

    @HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN)
    public void setPressInable(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_PRESS_IN, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_PRESS_OUT, defaultType = HippyControllerProps.BOOLEAN)
    public void setPressOutable(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_PRESS_OUT, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN)
    public void setTouchDownHandle(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_TOUCH_DOWN, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN)
    public void setTouchMoveHandle(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_TOUCH_MOVE, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN)
    public void setTouchEndHandle(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_TOUCH_END, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN)
    public void setTouchCancelHandle(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_TOUCH_CANCEL, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_ATTACHED_TO_WINDOW, defaultType = HippyControllerProps.BOOLEAN)
    public void setAttachedToWindowHandle(T view, boolean flag) {
        if (flag) {
            view.addOnAttachStateChangeListener(
                    NativeGestureDispatcher.getOnAttachedToWindowListener());
        } else {
            view.removeOnAttachStateChangeListener(
                    NativeGestureDispatcher.getOnAttachedToWindowListener());
        }
    }

    @HippyControllerProps(name = NodeProps.ON_DETACHED_FROM_WINDOW, defaultType = HippyControllerProps.BOOLEAN)
    public void setDetachedFromWindowHandle(T view, boolean flag) {
        if (flag) {
            view.addOnAttachStateChangeListener(
                    NativeGestureDispatcher.getOnDetachedFromWindowListener());
        } else {
            view.removeOnAttachStateChangeListener(
                    NativeGestureDispatcher.getOnDetachedFromWindowListener());
        }
    }

    @HippyControllerProps(name = "renderToHardwareTextureAndroid", defaultType = HippyControllerProps.BOOLEAN)
    public void setRenderToHardwareTexture(T view, boolean useHWTexture) {
        view.setLayerType(useHWTexture ? View.LAYER_TYPE_HARDWARE : View.LAYER_TYPE_NONE, null);
    }

    @SuppressWarnings("EmptyMethod")
    @HippyControllerProps(name = NodeProps.CUSTOM_PROP)
    public void setCustomProp(T view, String methodName, Object props) {

    }

    protected void setGestureType(T view, String type, boolean flag) {
        if (flag) {
            if (view.getGestureDispatcher() == null) {
                view.setGestureDispatcher(new NativeGestureDispatcher(view));
            }
            view.getGestureDispatcher().addGestureType(type);
        } else {
            if (view.getGestureDispatcher() != null) {
                view.getGestureDispatcher().removeGestureType(type);
            }
        }
    }

    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager,
            boolean isLazy) {
        return new RenderNode(rootId, id, props, className, controllerManager, isLazy);
    }

    @Nullable
    public VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @Nullable Map<String, Object> props) {
        // The host can create customize virtual node in a derived class.
        return null;
    }

    private void applyTransform(T view, ArrayList<Object> transformArray) {
        TransformUtil.processTransform(transformArray, sTransformDecompositionArray);
        sMatrixDecompositionContext.reset();
        MatrixUtil.decomposeMatrix(sTransformDecompositionArray, sMatrixDecompositionContext);
        view.setTranslationX(PixelUtil.dp2px((float) sMatrixDecompositionContext.translation[0]));
        view.setTranslationY(PixelUtil.dp2px((float) sMatrixDecompositionContext.translation[1]));
        view.setRotation((float) sMatrixDecompositionContext.rotationDegrees[2]);
        view.setRotationX((float) sMatrixDecompositionContext.rotationDegrees[0]);
        view.setRotationY((float) sMatrixDecompositionContext.rotationDegrees[1]);
        view.setScaleX((float) sMatrixDecompositionContext.scale[0]);
        view.setScaleY((float) sMatrixDecompositionContext.scale[1]);
    }

    public static void resetTransform(View view) {
        view.setTranslationX(0);
        view.setTranslationY(0);
        view.setRotation(0);
        view.setRotationX(0);
        view.setRotationY(0);
        view.setScaleX(1);
        view.setScaleY(1);
    }

    @Deprecated
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull HippyArray params) {
    }

    @Deprecated
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull HippyArray params, @NonNull Promise promise) {
    }

    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull List params) {
    }

    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull List params, @NonNull Promise promise) {
        switch (functionName) {
            case DevtoolsUtil.GET_SCREEN_SHOT:
                DevtoolsUtil.getScreenShot(view, promise);
                break;
            case DevtoolsUtil.ADD_FRAME_CALLBACK:
                DevtoolsUtil.addFrameCallback(params, view, promise);
                break;
            case DevtoolsUtil.REMOVE_FRAME_CALLBACK:
                DevtoolsUtil.removeFrameCallback(params, view, promise);
                break;
            case MEASURE_IN_WINDOW:
                measureInWindow(view, promise);
                break;
            default:
                break;
        }
    }

    public void onBatchComplete(@NonNull T view) {
        // Stub method.
    }

    public void onBatchStart(@NonNull T view) {
        // Stub method.
    }

    public void onViewDestroy(T t) {
        // Stub method.
        if (t instanceof FlatViewGroup) {
            Component component = FlatViewGroup.getComponent(t);
            if (component != null) {
                component.onDetachedFromHostView();
            }
        }
    }

    protected void deleteChild(ViewGroup parentView, View childView) {
        parentView.removeView(childView);
    }

    protected void deleteChild(ViewGroup parentView, View childView, int childIndex) {
        deleteChild(parentView, childView);
    }

    protected void addView(ViewGroup parentView, View view, int index) {
        int realIndex = index;
        if (realIndex > parentView.getChildCount()) {
            realIndex = parentView.getChildCount();
        }
        try {
            parentView.addView(view, realIndex);
            if (view instanceof ClipChildrenView) {
                parentView.setClipChildren(true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public int getChildCount(T viewGroup) {
        if (viewGroup instanceof ViewGroup) {
            return ((ViewGroup) viewGroup).getChildCount();
        }
        return 0;
    }

    public View getChildAt(T viewGroup, int i) {
        if (viewGroup instanceof ViewGroup) {
            return ((ViewGroup) viewGroup).getChildAt(i);
        }
        return null;
    }

    private void measureInWindow(@NonNull View view, @NonNull Promise promise) {
        int[] outputBuffer = new int[2];
        int statusBarHeight;
        try {
            view.getLocationOnScreen(outputBuffer);
            // We need to remove the status bar from the height.  getLocationOnScreen will include the
            // status bar.
            statusBarHeight = DimensionsUtil.getStatusBarHeight();
            if (statusBarHeight > 0) {
                outputBuffer[1] -= statusBarHeight;
            }
        } catch (Exception e) {
            promise.reject(
                    "An exception occurred when get view location on screen: " + e.getMessage());
            return;
        }
        LogUtils.d(TAG, "measureInWindow: x=" + outputBuffer[0]
                + ", y=" + outputBuffer[1]
                + ", width=" + view.getWidth()
                + ", height=" + view.getHeight()
                + ", statusBarHeight=" + statusBarHeight);
        Map<String, Object> result = new HashMap<>();
        result.put("x", PixelUtil.px2dp(outputBuffer[0]));
        result.put("y", PixelUtil.px2dp(outputBuffer[1]));
        result.put("width", PixelUtil.px2dp(view.getWidth()));
        result.put("height", PixelUtil.px2dp(view.getHeight()));
        result.put("statusBarHeight", PixelUtil.px2dp(statusBarHeight));
        promise.resolve(result);
    }
}
