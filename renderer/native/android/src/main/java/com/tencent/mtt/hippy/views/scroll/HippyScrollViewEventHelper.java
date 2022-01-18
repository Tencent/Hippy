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
package com.tencent.mtt.hippy.views.scroll;

import android.content.Context;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

@SuppressWarnings({"deprecation", "unused"})
public class HippyScrollViewEventHelper {
  public static final long MOMENTUM_DELAY = 20;
  public static final String EVENT_TYPE_BEGIN_DRAG = "scrollbegindrag";
  public static final String EVENT_TYPE_END_DRAG = "scrollenddrag";
  public static final String EVENT_TYPE_SCROLL = "scroll";
  public static final String EVENT_TYPE_MOMENTUM_BEGIN = "momentumscrollbegin";
  public static final String EVENT_TYPE_MOMENTUM_END = "momentumscrollend";
  public static final String EVENT_TYPE_ANIMATION_END = "scrollanimationend";

  public static void emitScrollEvent(ViewGroup view) {
    emitScrollEvent(view, EVENT_TYPE_SCROLL);
  }

  public static void emitScrollBeginDragEvent(ViewGroup view) {
    emitScrollEvent(view, EVENT_TYPE_BEGIN_DRAG);
  }

  public static void emitScrollEndDragEvent(ViewGroup view) {
    emitScrollEvent(view, EVENT_TYPE_END_DRAG);
  }

  public static void emitScrollMomentumBeginEvent(ViewGroup view) {
    emitScrollEvent(view, EVENT_TYPE_MOMENTUM_BEGIN);
  }

  public static void emitScrollMomentumEndEvent(ViewGroup view) {
    emitScrollEvent(view, EVENT_TYPE_MOMENTUM_END);
  }

  protected static void emitScrollEvent(ViewGroup view, String scrollEventType) {
    if (view == null) {
      return;
    }
    HippyMap contentInset = new HippyMap();
    contentInset.pushDouble("top", 0);
    contentInset.pushDouble("bottom", 0);
    contentInset.pushDouble("left", 0);
    contentInset.pushDouble("right", 0);

    HippyMap contentOffset = new HippyMap();
    contentOffset.pushDouble("x", PixelUtil.px2dp(view.getScrollX()));
    contentOffset.pushDouble("y", PixelUtil.px2dp(view.getScrollY()));

    HippyMap contentSize = new HippyMap();
    contentSize.pushDouble("width", PixelUtil
        .px2dp(view.getChildCount() > 0 ? view.getChildAt(0).getWidth() : view.getWidth()));
    contentSize.pushDouble("height", PixelUtil
        .px2dp(view.getChildCount() > 0 ? view.getChildAt(0).getHeight() : view.getHeight()));

    HippyMap layoutMeasurement = new HippyMap();
    layoutMeasurement.pushDouble("width", PixelUtil.px2dp(view.getWidth()));
    layoutMeasurement.pushDouble("height", PixelUtil.px2dp(view.getHeight()));

    HippyMap event = new HippyMap();
    event.pushMap("contentInset", contentInset);
    event.pushMap("contentOffset", contentOffset);
    event.pushMap("contentSize", contentSize);
    event.pushMap("layoutMeasurement", layoutMeasurement);

    Context context = view.getContext();
    if (context instanceof NativeRenderContext) {
      int instanceId = ((NativeRenderContext)view.getContext()).getInstanceId();
      NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
      //noinspection ConstantConditions
      if (nativeRenderer != null) {
        nativeRenderer.dispatchUIComponentEvent(view.getId(), scrollEventType, event);
      }
    }
  }
}
