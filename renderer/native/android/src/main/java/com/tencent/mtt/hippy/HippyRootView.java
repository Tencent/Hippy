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
package com.tencent.mtt.hippy;

import android.content.Context;
import android.os.Build;
import android.os.Parcelable;
import android.util.DisplayMetrics;
import android.util.SparseArray;
import android.view.Display;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.WindowManager;
import android.widget.FrameLayout;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.HippyTag;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.LogUtils;

import com.tencent.renderer.INativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;
import java.lang.reflect.Method;
import java.util.concurrent.atomic.AtomicInteger;

import static android.content.res.Configuration.ORIENTATION_UNDEFINED;

@SuppressWarnings({"deprecation", "unused"})
public class HippyRootView extends FrameLayout {
  private final int instanceId;
  private GlobalLayoutListener mGlobalLayoutListener;
  protected boolean firstViewAdded = false;

  public HippyRootView(Context context, int instanceId, int rootId) {
    super(new NativeRenderContext(context, instanceId));

    this.instanceId = instanceId;
    setId(rootId);
    HippyMap tagMap = HippyTag.createTagMap(NodeProps.ROOT_NODE, null);
    setTag(tagMap);
    getViewTreeObserver().addOnGlobalLayoutListener(getGlobalLayoutListener());
    setOnSystemUiVisibilityChangeListener(getGlobalLayoutListener());
  }

  @Override
  public void onViewAdded(View child) {
    if (!firstViewAdded) {
      firstViewAdded = true;

      INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
      if (nativeRenderer != null) {
        nativeRenderer.onFirstViewAdded();
      }
    }
  }

  @Override
  protected void dispatchRestoreInstanceState(SparseArray<Parcelable> container) {
    // No-op do not onRestoreInstanceState for sub views
  }

  @Override
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    // No-op since UIManagerModule handles actually laying out children.
  }

  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec),
        MeasureSpec.getSize(heightMeasureSpec));
    //		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);

    if (w != oldw || h != oldh) {
      getGlobalLayoutListener().checkUpdateDimension(w, h, false, false);
      INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
      if (nativeRenderer != null) {
        nativeRenderer.onSizeChanged(w, h, oldw, oldh);
      }
    }
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    try {
      getViewTreeObserver().removeGlobalOnLayoutListener(getGlobalLayoutListener());
    } catch (Throwable e) {
      e.printStackTrace();
    }
    getViewTreeObserver().addOnGlobalLayoutListener(getGlobalLayoutListener());
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    try {
      getViewTreeObserver().removeGlobalOnLayoutListener(getGlobalLayoutListener());
    } catch (Throwable e) {
      e.printStackTrace();
    }
  }

  public void checkUpdateDimension() {
    getGlobalLayoutListener().checkUpdateDimension(false, false);
  }

  private GlobalLayoutListener getGlobalLayoutListener() {
    if (mGlobalLayoutListener == null) {
      mGlobalLayoutListener = new GlobalLayoutListener();
    }
    return mGlobalLayoutListener;
  }

  private class GlobalLayoutListener implements ViewTreeObserver.OnGlobalLayoutListener,
      OnSystemUiVisibilityChangeListener {

    private int mOrientation = ORIENTATION_UNDEFINED;

    @SuppressWarnings("RedundantIfStatement")
    @Override
    public void onSystemUiVisibilityChange(int visibility) {
      if ((visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0) {
        checkUpdateDimension(false, true);
      } else {
        checkUpdateDimension(true, true);
      }
    }

    @Override
    public void onGlobalLayout() {
      if (getContext() != null) {
        int orientation = getContext().getResources().getConfiguration().orientation;
        if (orientation != mOrientation) {
          mOrientation = orientation;
          sendOrientationChangeEvent(mOrientation);
          checkUpdateDimension(false, false);
        }
      }
    }

    private void sendOrientationChangeEvent(int orientation) {
      LogUtils.d("HippyRootView", "sendOrientationChangeEvent: orientation=" + orientation);
    }

    private void checkUpdateDimension(boolean shouldUseScreenDisplay,
        boolean systemUiVisibilityChanged) {
      checkUpdateDimension(-1, -1, false, false);
    }

    @SuppressWarnings("SameParameterValue")
    private void checkUpdateDimension(int windowWidth, int windowHeight,
        boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
      DisplayMetrics windowDisplayMetrics = getContext().getResources().getDisplayMetrics();
      DisplayMetrics screenDisplayMetrics = new DisplayMetrics();
      screenDisplayMetrics.setTo(windowDisplayMetrics);
      WindowManager windowManager = (WindowManager) getContext()
          .getSystemService(Context.WINDOW_SERVICE);
      Display defaultDisplay = windowManager.getDefaultDisplay();
      try {
        if (Build.VERSION.SDK_INT >= 17) {
          defaultDisplay.getRealMetrics(screenDisplayMetrics);
        } else {
          //noinspection JavaReflectionMemberAccess
          Method mGetRawH = Display.class.getMethod("getRawHeight");
          //noinspection JavaReflectionMemberAccess
          Method mGetRawW = Display.class.getMethod("getRawWidth");

          Object width = mGetRawW.invoke(defaultDisplay);
          screenDisplayMetrics.widthPixels = width != null ? (Integer) width : 0;

          Object height = mGetRawH.invoke(defaultDisplay);
          screenDisplayMetrics.heightPixels = height != null ? (Integer) height : 0;
        }

      } catch (Throwable throwable) {
        throwable.printStackTrace();
      }

      HippyMap dimensionMap = DimensionsUtil
          .getDimensions(windowWidth, windowHeight, getContext(), shouldUseScreenDisplay);
      int dimensionW = 0;
      int dimensionH = 0;
      if (dimensionMap != null) {
        HippyMap windowMap = dimensionMap.getMap("windowPhysicalPixels");
        dimensionW = windowMap.getInt("width");
        dimensionH = windowMap.getInt("height");
      }

      boolean shouldRevise = (windowHeight < 0 || dimensionW == dimensionH) ? true : false;
      INativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
      if (nativeRenderer != null) {
        nativeRenderer.updateDimension(shouldRevise, dimensionMap,
            shouldUseScreenDisplay, systemUiVisibilityChanged);
      }
    }
  }
}
