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
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.INativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

import java.util.HashSet;

@SuppressWarnings({"deprecation", "unused"})
public class NativeGestureDispatcher implements NativeGestureProcessor.Callback {

  private static final String TAG = "NativeGestureDispatcher";
  private static final String KEY_EVENT_NAME = "name";
  private static final String KEY_TAG_ID = "id";
  private static final String KEY_PAGE_X = "page_x";
  private static final String KEY_PAGE_Y = "page_y";
  private static final int TAP_TIMEOUT = ViewConfiguration.getTapTimeout();

  private static final View.OnClickListener mOnClickListener = new View.OnClickListener() {
    @Override
    public void onClick(final View view) {
      if (view == null) {
        return;
      }

      final Context context = view.getContext();
      if (context instanceof NativeRenderContext) {
        view.postDelayed(new Runnable() {
          @Override
          public void run() {
            int tagId = view.getId();
            int instanceId = ((NativeRenderContext) context).getInstanceId();
            INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            handleClick(view, nativeRenderer, tagId, false);
          }
        }, TAP_TIMEOUT);
      }

    }
  };
  private static final View.OnLongClickListener mOnLongClickListener = new View.OnLongClickListener() {
    @Override
    public boolean onLongClick(final View view) {
      if (view == null) {
        return false;
      }

      final Context context = view.getContext();
      if (context instanceof NativeRenderContext) {
        view.postDelayed(new Runnable() {
          @Override
          public void run() {
            int tagId = view.getId();
            int instanceId = ((NativeRenderContext)context).getInstanceId();
            INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            handleLongClick(nativeRenderer, tagId);
          }
        }, TAP_TIMEOUT);
      }
      return true;
    }
  };

  private static final View.OnAttachStateChangeListener mOnAttachedToWindowListener = new View.OnAttachStateChangeListener() {

    @Override
    public void onViewAttachedToWindow(View view) {
      if (view == null) {
        return;
      }

      final Context context = view.getContext();
      if (context instanceof NativeRenderContext) {
        int tagId = view.getId();
        int instanceId = ((NativeRenderContext)context).getInstanceId();
        INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
        handleAttachedToWindow(nativeRenderer, tagId);
      }
    }

    @Override
    public void onViewDetachedFromWindow(View view) {

    }
  };

  private static final View.OnAttachStateChangeListener mOnDetachedFromWindowListener = new View.OnAttachStateChangeListener() {

    @Override
    public void onViewAttachedToWindow(View view) {

    }

    @Override
    public void onViewDetachedFromWindow(View view) {
      if (view == null) {
        return;
      }

      final Context context = view.getContext();
      if (context instanceof NativeRenderContext) {
        int tagId = view.getId();
        int instanceId = ((NativeRenderContext)context).getInstanceId();
        INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
        handleDetachedFromWindow(nativeRenderer, tagId);
      }
    }
  };

  private final View mTargetView;
  private HashSet<String> mGestureTypes = null;
  private NativeGestureProcessor mGestureProcessor;
  private INativeRender nativeRenderer;

  public NativeGestureDispatcher(View view) {
    mTargetView = view;
    if (view != null && view.getContext() instanceof NativeRenderContext) {
      int instanceId = ((NativeRenderContext)view.getContext()).getInstanceId();
      nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
    }
  }

  public static View.OnClickListener getOnClickListener() {
    return mOnClickListener;
  }

  public static View.OnLongClickListener getOnLongClickListener() {
    return mOnLongClickListener;
  }

  public static View.OnAttachStateChangeListener getOnAttachedToWindowListener() {
    return mOnAttachedToWindowListener;
  }

  public static View.OnAttachStateChangeListener getOnDetachedFromWindowListener() {
    return mOnDetachedFromWindowListener;
  }

  public static void handleClick(View target, INativeRender nativeRenderer, int tagId,
      boolean isCustomEvent) {
    if (nativeRenderer != null) {
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_CLICK);
      params.pushInt(KEY_TAG_ID, tagId);
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleLongClick(INativeRender nativeRenderer, int tagId) {
    if (nativeRenderer != null) {
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_LONG_CLICK);
      params.pushInt(KEY_TAG_ID, tagId);
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleAttachedToWindow(INativeRender nativeRenderer, int tagId) {
    if (nativeRenderer != null) {
      nativeRenderer.dispatchUIComponentEvent(tagId, NodeProps.ON_ATTACHED_TO_WINDOW, null);
    }
  }

  public static void handleDetachedFromWindow(INativeRender nativeRenderer, int tagId) {
    if (nativeRenderer != null) {
      nativeRenderer.dispatchUIComponentEvent(tagId, NodeProps.ON_DETACHED_FROM_WINDOW, null);
    }
  }

  public static void handlePressIn(INativeRender nativeRenderer, int tagId) {
    if (nativeRenderer != null) {
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_PRESS_IN);
      params.pushInt(KEY_TAG_ID, tagId);
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handlePressOut(INativeRender nativeRenderer, int tagId) {
    if (nativeRenderer != null) {
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_PRESS_OUT);
      params.pushInt(KEY_TAG_ID, tagId);
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleTouchDown(INativeRender nativeRenderer, int mTagId, float x, float y,
      int viewId) {
    if (nativeRenderer != null) {
      int[] viewCoords = new int[2];
      getLocationInWindow(nativeRenderer, viewId, viewCoords);
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_TOUCH_DOWN);
      params.pushInt(KEY_TAG_ID, mTagId);
      params.pushDouble(KEY_PAGE_X, PixelUtil.px2dp(viewCoords[0] + x));
      params.pushDouble(KEY_PAGE_Y, PixelUtil.px2dp(viewCoords[1] + y));
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleTouchMove(INativeRender nativeRenderer, int mTagId, float x, float y,
      int viewId) {
    if (nativeRenderer != null) {
      int[] viewCoords = new int[2];
      getLocationInWindow(nativeRenderer, viewId, viewCoords);
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_TOUCH_MOVE);
      params.pushInt(KEY_TAG_ID, mTagId);
      params.pushDouble(KEY_PAGE_X, PixelUtil.px2dp(viewCoords[0] + x));
      params.pushDouble(KEY_PAGE_Y, PixelUtil.px2dp(viewCoords[1] + y));
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleTouchEnd(INativeRender nativeRenderer, int mTagId, float x, float y,
      int viewId) {
    if (nativeRenderer != null) {
      int[] viewCoords = new int[2];
      getLocationInWindow(nativeRenderer, viewId, viewCoords);
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_TOUCH_END);
      params.pushInt(KEY_TAG_ID, mTagId);
      params.pushDouble(KEY_PAGE_X, PixelUtil.px2dp(viewCoords[0] + x));
      params.pushDouble(KEY_PAGE_Y, PixelUtil.px2dp(viewCoords[1] + y));
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  public static void handleTouchCancel(INativeRender nativeRenderer, int mTagId, float x, float y,
      int viewId) {
    if (nativeRenderer != null) {
      int[] viewCoords = new int[2];
      getLocationInWindow(nativeRenderer, viewId, viewCoords);
      HippyMap params = new HippyMap();
      params.pushString(KEY_EVENT_NAME, NodeProps.ON_TOUCH_CANCEL);
      params.pushInt(KEY_TAG_ID, mTagId);
      params.pushDouble(KEY_PAGE_X, PixelUtil.px2dp(viewCoords[0] + x));
      params.pushDouble(KEY_PAGE_Y, PixelUtil.px2dp(viewCoords[1] + y));
      nativeRenderer.dispatchNativeGestureEvent(params);
    }
  }

  private static void getLocationInWindow(INativeRender nativeRenderer, int id, int[] viewCoords) {
    if (id >= 0) {
      View view = nativeRenderer.getRenderManager().getControllerManager().findView(id);
      if (view != null) {
        view.getLocationInWindow(viewCoords);
      }
    }
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
    if (mGestureTypes != null) {

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
    return false;
  }

  @Override
  public void handle(String type, float x, float y) {
    if (mTargetView == null) {
      LogUtils.e("NativeGestureDispatcher", "handle!!! but view is null!!!!");
      return;
    }

    if (TextUtils.equals(type, NodeProps.ON_PRESS_IN)) {
      handlePressIn(nativeRenderer, mTargetView.getId());
    } else if (TextUtils.equals(type, NodeProps.ON_PRESS_OUT)) {
      handlePressOut(nativeRenderer, mTargetView.getId());
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_DOWN)) {
      NativeGestureDispatcher
          .handleTouchDown(nativeRenderer, mTargetView.getId(), x, y, mTargetView.getId());
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_MOVE)) {
      NativeGestureDispatcher
          .handleTouchMove(nativeRenderer, mTargetView.getId(), x, y, mTargetView.getId());
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_END)) {
      NativeGestureDispatcher
          .handleTouchEnd(nativeRenderer, mTargetView.getId(), x, y, mTargetView.getId());
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_CANCEL)) {
      NativeGestureDispatcher
          .handleTouchCancel(nativeRenderer, mTargetView.getId(), x, y, mTargetView.getId());
    }
  }
}
