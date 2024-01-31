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
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
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
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.Priority;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollHelper;
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.Renderer;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.VirtualNode;
import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.MapUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class HippyViewController<T extends View & HippyViewBase> implements
        View.OnFocusChangeListener {

    private static final String TAG = "HippyViewController";
    private static final String MEASURE_IN_WINDOW = "measureInWindow";
    private static final String GET_BOUNDING_CLIENT_RECT = "getBoundingClientRect";
    public static final String KEY_REL_TO_CONTAINER = "relToContainer";
    public static final String KEY_ERR_MSG = "errMsg";
    private static final int PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX = 2;
    private static final float CAMERA_DISTANCE_NORMALIZATION_MULTIPLIER = (float) Math.sqrt(5);
    private static final MatrixUtil.MatrixDecompositionContext sMatrixDecompositionContext = new MatrixUtil.MatrixDecompositionContext();
    private static final double[] sTransformDecompositionArray = new double[16];
    private boolean bUserChangeFocus = false;

    public View createView(@NonNull View rootView, int id, @Nullable Renderer renderer,
            @NonNull String className, @Nullable Map<String, Object> props) {
        View view = null;
        Context context = rootView.getContext();
        Object object = renderer != null ? renderer.getCustomViewCreator() : null;
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

    public void onAfterUpdateProps(@NonNull T view) {
        view.invalidate();
    }

    @SuppressWarnings("unused")
    protected void updateEvents(@NonNull T view, @Nullable Map<String, Object> events) {

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

    @HippyControllerProps(name = NodeProps.VISIBILITY, defaultType = HippyControllerProps.STRING, defaultString =
            NodeProps.VISIBLE)
    public void setVisibility(T view, String value) {
        if (NodeProps.VISIBLE.equals(value)) {
            view.setVisibility(View.VISIBLE);
        } else if (NodeProps.HIDDEN.equals(value)) {
            view.setVisibility(View.INVISIBLE);
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

    @SuppressWarnings("deprecation")
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
    public void setPressIn(T view, boolean flag) {
        if (!handleGestureBySelf()) {
            setGestureType(view, NodeProps.ON_PRESS_IN, flag);
        }
    }

    @HippyControllerProps(name = NodeProps.ON_PRESS_OUT, defaultType = HippyControllerProps.BOOLEAN)
    public void setPressOut(T view, boolean flag) {
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

    @HippyControllerProps(name = HippyNestedScrollComponent.PROP_PRIORITY, defaultType =
            HippyControllerProps.STRING, defaultString = HippyNestedScrollComponent.PRIORITY_SELF)
    public void setNestedScrollPriority(T view, String priorityName) {
        if (view instanceof HippyNestedScrollComponent) {
            HippyNestedScrollComponent sc = (HippyNestedScrollComponent) view;
            HippyNestedScrollComponent.Priority priority = HippyNestedScrollHelper.priorityOf(priorityName);
            if (priority == Priority.NOT_SET) {
                priority = Priority.SELF;
            }
            sc.setNestedScrollPriority(HippyNestedScrollComponent.DIRECTION_ALL, priority);
        }
    }

    @HippyControllerProps(name = HippyNestedScrollComponent.PROP_LEFT_PRIORITY, defaultType =
            HippyControllerProps.STRING)
    public void setNestedScrollLeftPriority(T view, String priorityName) {
        if (view instanceof HippyNestedScrollComponent) {
            HippyNestedScrollComponent.Priority priority = HippyNestedScrollHelper.priorityOf(priorityName);
            ((HippyNestedScrollComponent) view).setNestedScrollPriority(HippyNestedScrollComponent.DIRECTION_LEFT,
                    priority);
        }
    }

    @HippyControllerProps(name = HippyNestedScrollComponent.PROP_TOP_PRIORITY, defaultType =
            HippyControllerProps.STRING)
    public void setNestedScrollTopPriority(T view, String priorityName) {
        if (view instanceof HippyNestedScrollComponent) {
            HippyNestedScrollComponent.Priority priority = HippyNestedScrollHelper.priorityOf(priorityName);
            ((HippyNestedScrollComponent) view).setNestedScrollPriority(HippyNestedScrollComponent.DIRECTION_TOP,
                    priority);
        }
    }

    @HippyControllerProps(name = HippyNestedScrollComponent.PROP_RIGHT_PRIORITY, defaultType =
            HippyControllerProps.STRING)
    public void setNestedScrollRightPriority(T view, String priorityName) {
        if (view instanceof HippyNestedScrollComponent) {
            HippyNestedScrollComponent.Priority priority = HippyNestedScrollHelper.priorityOf(priorityName);
            ((HippyNestedScrollComponent) view).setNestedScrollPriority(HippyNestedScrollComponent.DIRECTION_RIGHT,
                    priority);
        }
    }

    @HippyControllerProps(name = HippyNestedScrollComponent.PROP_BOTTOM_PRIORITY, defaultType =
            HippyControllerProps.STRING)
    public void setNestedScrollBottomPriority(T view, String priorityName) {
        if (view instanceof HippyNestedScrollComponent) {
            HippyNestedScrollComponent.Priority priority = HippyNestedScrollHelper.priorityOf(priorityName);
            ((HippyNestedScrollComponent) view).setNestedScrollPriority(HippyNestedScrollComponent.DIRECTION_BOTTOM,
                    priority);
        }
    }

    @SuppressWarnings({"EmptyMethod", "unused"})
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

    protected RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazy) {
        return new RenderNode(rootId, id, props, className, controllerManager, isLazy);
    }

    @SuppressWarnings("unused")
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

        double[] perspectiveArray = sMatrixDecompositionContext.perspective;

        if (perspectiveArray.length > PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX) {
            float invertedCameraDistance = (float) perspectiveArray[PERSPECTIVE_ARRAY_INVERTED_CAMERA_DISTANCE_INDEX];
            if (invertedCameraDistance == 0) {
                // Default camera distance, before scale multiplier (1280)
                invertedCameraDistance = 0.00078125f;
            }
            float cameraDistance = -1 / invertedCameraDistance;
            float scale = PixelUtil.getDensity();

            // The following converts the matrix's perspective to a camera distance
            // such that the camera perspective looks the same on Android and iOS.
            // The native Android implementation removed the screen density from the
            // calculation, so squaring and a normalization value of
            // sqrt(5) produces an exact replica with iOS.
            // For more information, see https://github.com/facebook/react-native/pull/18302
            float normalizedCameraDistance = scale * scale * cameraDistance * CAMERA_DISTANCE_NORMALIZATION_MULTIPLIER;
            view.setCameraDistance(normalizedCameraDistance);
        }
    }

    public static void resetTransform(View view) {
        view.setTranslationX(0);
        view.setTranslationY(0);
        view.setRotation(0);
        view.setRotationX(0);
        view.setRotationY(0);
        view.setScaleX(1);
        view.setScaleY(1);
        view.setCameraDistance(0);
    }

    @SuppressWarnings("deprecation")
    @Deprecated
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(view, functionName, params.getInternalArray());
    }

    @SuppressWarnings("deprecation")
    @Deprecated
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull HippyArray params, @NonNull Promise promise) {
        dispatchFunction(view, functionName, params.getInternalArray(), promise);
    }

    @Nullable
    protected HippyCustomPropsController getCustomPropsController(@NonNull View view) {
        Context context = view.getContext();
        if (context instanceof NativeRenderContext) {
            int rendererId = ((NativeRenderContext) context).getInstanceId();
            NativeRender renderer = NativeRendererManager.getNativeRenderer(rendererId);
            if (renderer != null) {
                return renderer.getRenderManager().getControllerManager()
                        .getCustomPropsController();
            }
        }
        return null;
    }

    @SuppressWarnings("unused")
    private void dispatchCustomFunction(@NonNull View view, @NonNull String functionName,
            @NonNull List params, @Nullable Promise promise) {
        HippyCustomPropsController controller = getCustomPropsController(view);
        if (controller != null) {
            controller.handleCustomFunction(view, functionName, params, promise);
        }
    }

    @SuppressWarnings("rawtypes")
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull List params) {
        dispatchCustomFunction(view, functionName, params, null);
    }

    @SuppressWarnings("rawtypes")
    public void dispatchFunction(@NonNull T view, @NonNull String functionName,
            @NonNull List params, @NonNull Promise promise) {
        switch (functionName) {
            case MEASURE_IN_WINDOW:
                measureInWindow(view, promise);
                break;
            case GET_BOUNDING_CLIENT_RECT:
                getBoundingClientRect(view, params, promise);
                break;
            default:
                dispatchCustomFunction(view, functionName, params, promise);
                break;
        }
        DevtoolsUtil.dispatchDevtoolsFunction(view, functionName, params, promise);
    }

    public void onBatchComplete(@NonNull T view) {
        // Stub method.
    }

    public void onBatchStart(@NonNull T view) {
        // Stub method.
    }

    public void onViewDestroy(T t) {
        // Stub method.
    }

    public boolean isRecyclable() {
        return true;
    }

    protected void deleteChild(ViewGroup parentView, View childView) {
        parentView.removeView(childView);
    }

    private boolean checkOverflowVisible(@NonNull View view) {
        RenderNode node = RenderManager.getRenderNode(view);
        if (node != null) {
            Map<String, Object> props = node.getProps();
            if (props != null) {
                String overflow = MapUtils.getStringValue(props, NodeProps.OVERFLOW);
                return (overflow != null && overflow.equals(NodeProps.VISIBLE));
            }
        }
        return false;
    }

    protected void addView(ViewGroup parentView, View view, int index) {
        int realIndex = index;
        if (realIndex > parentView.getChildCount()) {
            realIndex = parentView.getChildCount();
        }
        try {
            parentView.addView(view, realIndex);
            if (view instanceof ClipChildrenView && !checkOverflowVisible(parentView)) {
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
            promise.resolve(
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

    private void getBoundingClientRect(@NonNull View view, @NonNull List<?> params,
            @NonNull Promise promise) {
        boolean relToContainer = false;
        if (!params.isEmpty()) {
            Map<String, Object> param = ArrayUtils.getMapValue(params, 0);
            if (param != null) {
                relToContainer = MapUtils.getBooleanValue(param, KEY_REL_TO_CONTAINER, false);
            }
        }
        int x;
        int y;
        int width = view.getWidth();
        int height = view.getHeight();
        int[] pair;
        if (relToContainer) {
            NativeRender renderer = NativeRendererManager.getNativeRenderer(view.getContext());
            View rootView = renderer == null ? null : renderer.getRootView(view);
            if (rootView == null) {
                Map<String, Object> result = new HashMap<>();
                result.put(KEY_ERR_MSG, "container is null");
                promise.resolve(result);
                return;
            }

            pair = new int[2];
            view.getLocationInWindow(pair);
            x = pair[0];
            y = pair[1];
            rootView.getLocationInWindow(pair);
            x -= pair[0];
            y -= pair[1];
        } else {
            pair = new int[2];
            view.getLocationOnScreen(pair);
            x = pair[0];
            y = pair[1];
        }
        HashMap<String, Object> result = new HashMap<>();
        result.put("x", PixelUtil.px2dp(x));
        result.put("y", PixelUtil.px2dp(y));
        result.put("width", PixelUtil.px2dp(width));
        result.put("height", PixelUtil.px2dp(height));
        promise.resolve(result);
    }
}
