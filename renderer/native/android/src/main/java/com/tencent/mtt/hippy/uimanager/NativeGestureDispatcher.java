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

import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;

import java.util.HashMap;
import java.util.HashSet;

import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_CLICK;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_LONG_CLICK;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_PRESS_IN;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_PRESS_OUT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_CANCEL;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_DOWN;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_END;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_MOVE;

public class NativeGestureDispatcher implements NativeGestureProcessor.Callback {

    private static final String TAG = "NativeGestureDispatcher";
    private static final String KEY_EVENT_NAME = "name";
    private static final String KEY_TAG_ID = "id";
    private static final String KEY_PAGE_X = "page_x";
    private static final String KEY_PAGE_Y = "page_y";
    private static final int TAP_TIMEOUT = ViewConfiguration.getTapTimeout();
    private final View mTargetView;
    private HashSet<String> mGestureTypes = null;
    private NativeGestureProcessor mGestureProcessor;
    private @Nullable
    final NativeRender mNativeRenderer;
    private static final View.OnClickListener sOnClickListener = new View.OnClickListener() {
        @Override
        public void onClick(final View view) {
            if (view == null) {
                return;
            }
            final NativeRender nativeRenderer = NativeRendererManager
                    .getNativeRenderer(view.getContext());
            if (nativeRenderer == null) {
                return;
            }
            view.postDelayed(new Runnable() {
                @Override
                public void run() {
                    handleClickEvent(nativeRenderer, view.getId(), ON_CLICK);
                }
            }, TAP_TIMEOUT);
        }
    };
    private static final View.OnLongClickListener sOnLongClickListener = new View.OnLongClickListener() {
        @Override
        public boolean onLongClick(final View view) {
            if (view == null) {
                return false;
            }
            final NativeRender nativeRenderer = NativeRendererManager
                    .getNativeRenderer(view.getContext());
            if (nativeRenderer == null) {
                return false;
            }
            view.postDelayed(new Runnable() {
                @Override
                public void run() {
                    handleClickEvent(nativeRenderer, view.getId(), ON_LONG_CLICK);
                }
            }, TAP_TIMEOUT);
            return true;
        }
    };
    private static final View.OnAttachStateChangeListener sOnAttachedToWindowListener = new View.OnAttachStateChangeListener() {
        @Override
        public void onViewAttachedToWindow(View view) {
            if (view == null) {
                return;
            }
            final NativeRender nativeRenderer = NativeRendererManager
                    .getNativeRenderer(view.getContext());
            if (nativeRenderer == null) {
                return;
            }
            handleAttachedToWindow(nativeRenderer, view.getId());
        }

        @Override
        public void onViewDetachedFromWindow(View view) {
        }
    };
    private static final View.OnAttachStateChangeListener sOnDetachedFromWindowListener = new View.OnAttachStateChangeListener() {
        @Override
        public void onViewAttachedToWindow(View view) {
        }

        @Override
        public void onViewDetachedFromWindow(View view) {
            if (view == null) {
                return;
            }
            final NativeRender nativeRenderer = NativeRendererManager
                    .getNativeRenderer(view.getContext());
            if (nativeRenderer == null) {
                return;
            }
            handleDetachedFromWindow(nativeRenderer, view.getId());
        }
    };

    public static View.OnClickListener getOnClickListener() {
        return sOnClickListener;
    }

    public static View.OnLongClickListener getOnLongClickListener() {
        return sOnLongClickListener;
    }

    public static View.OnAttachStateChangeListener getOnAttachedToWindowListener() {
        return sOnAttachedToWindowListener;
    }

    public static View.OnAttachStateChangeListener getOnDetachedFromWindowListener() {
        return sOnDetachedFromWindowListener;
    }

    public static void handleAttachedToWindow(@NonNull NativeRender nativeRenderer, int id) {
        nativeRenderer.dispatchUIComponentEvent(id, NodeProps.ON_ATTACHED_TO_WINDOW, null);
    }

    public static void handleDetachedFromWindow(@NonNull NativeRender nativeRenderer, int id) {
        nativeRenderer.dispatchUIComponentEvent(id, NodeProps.ON_DETACHED_FROM_WINDOW, null);
    }

    public static void handleClickEvent(@NonNull NativeRender nativeRenderer, int id,
            @NonNull String eventType) {
        nativeRenderer.dispatchNativeGestureEvent(id, eventType, null);
    }

    public static void handleTouchEvent(@NonNull NativeRender nativeRenderer, @NonNull View view,
            int id,
            float x,
            float y, @NonNull String eventType) {
        int[] location = new int[2];
        try {
            view.getLocationInWindow(location);
        } catch (IllegalArgumentException ignored) {
            LogUtils.e(TAG,
                    "handleTouchEvent: getLocationInWindow exception " + ignored.getMessage());
        }
        HashMap<String, Object> params = new HashMap<>();
        params.put(KEY_PAGE_X, PixelUtil.px2dp(location[0] + x));
        params.put(KEY_PAGE_Y, PixelUtil.px2dp(location[1] + y));
        nativeRenderer.dispatchNativeGestureEvent(id, eventType, params);
    }

    public NativeGestureDispatcher(View view) {
        mTargetView = view;
        mNativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
    }

    public boolean handleTouchEvent(MotionEvent event) {
        if (mGestureProcessor == null) {
            mGestureProcessor = new NativeGestureProcessor(this);
        }
        return mGestureProcessor.onTouchEvent(event);
    }

    public void addGestureType(String type) {
        if (mGestureTypes == null) {
            mGestureTypes = new HashSet<>();
        }
        mGestureTypes.add(type);
    }

    public void removeGestureType(String type) {
        if (mGestureTypes != null) {
            mGestureTypes.remove(type);
        }
    }

    @Override
    public boolean needHandle(String type) {
        if (mGestureTypes == null) {
            return false;
        }
        boolean result = mGestureTypes.contains(type);
        if (!result && !TextUtils.equals(type, NodeProps.ON_INTERCEPT_TOUCH_EVENT) && !TextUtils
                .equals(type, NodeProps.ON_INTERCEPT_PULL_UP_EVENT)) {
            if (needHandle(NodeProps.ON_INTERCEPT_TOUCH_EVENT) || needHandle(
                    NodeProps.ON_INTERCEPT_PULL_UP_EVENT)) {
                return true;
            }
        }
        return result;
    }

    @Override
    public void handle(String type, float x, float y) {
        if (mTargetView == null || mNativeRenderer == null) {
            LogUtils.e(TAG,
                    "handle: mTargetView=" + mTargetView + ", mNativeRenderer=" + mNativeRenderer);
            return;
        }
        final int id = mTargetView.getId();
        switch (type) {
            case ON_PRESS_IN:
            case ON_PRESS_OUT:
                handleClickEvent(mNativeRenderer, id, type);
                break;
            case ON_TOUCH_DOWN:
            case ON_TOUCH_MOVE:
            case ON_TOUCH_END:
            case ON_TOUCH_CANCEL:
                handleTouchEvent(mNativeRenderer, mTargetView, id, x, y, type);
                break;
            default:
                LogUtils.e(TAG, "handle: Unknown event type=" + type);
        }
    }
}
