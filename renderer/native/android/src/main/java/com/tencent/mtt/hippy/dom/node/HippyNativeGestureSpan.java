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
package com.tencent.mtt.hippy.dom.node;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.NativeGestureProcessor;
import com.tencent.renderer.INativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

import java.util.ArrayList;

@SuppressWarnings({"unused"})
public class HippyNativeGestureSpan implements NativeGestureProcessor.Callback {

  static final int LONG_CLICK = 3;
  private static final int LONGPRESS_TIMEOUT = ViewConfiguration.getLongPressTimeout();
  private static final int TAP_TIMEOUT = ViewConfiguration.getTapTimeout();
  boolean mInLongPress = false;
  final int mTagId;
  private ArrayList<String> mGestureTypes;
  private int lastX = 0;
  private int lastY = 0;
  private int mViewId;

  private NativeGestureProcessor mGestureProcessor;
  private Handler mHandler;
  private INativeRender nativeRenderer;

  private final boolean mIsVirtual;

  public HippyNativeGestureSpan(int tagId, boolean isVirtual) {
    this.mTagId = tagId;
    this.mIsVirtual = isVirtual;
    mGestureTypes = new ArrayList<>();
  }

  public boolean isVirtual() {
    return mIsVirtual;
  }

  public void addGestureTypes(ArrayList<String> types) {
    mGestureTypes = types;
  }

  public boolean handleTouchEvent(View view, MotionEvent event) {

    if (mGestureProcessor == null) {
      mGestureProcessor = new NativeGestureProcessor(HippyNativeGestureSpan.this);
    }
    mViewId = view.getId();
    return mGestureProcessor.onTouchEvent(event);
  }

  @SuppressWarnings("deprecation")
  public boolean handleDispatchTouchEvent(View view, MotionEvent event) {
    if (nativeRenderer == null) {
      final Context context = view.getContext();
      if (context instanceof NativeRenderContext) {
        int instanceId = ((NativeRenderContext)context).getInstanceId();
        nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
      }
    }

    mViewId = view.getId();
    int action = event.getAction();
    boolean handle = false;
    int x = (int) event.getX();
    int y = (int) event.getY();
    switch (action) {
      case MotionEvent.ACTION_DOWN: {
        handle = true;
        mInLongPress = false;
        if (mGestureTypes.contains(NodeProps.ON_LONG_CLICK)) {
          if (mHandler == null) {
            mHandler = new GestureHandler();
          }
          mHandler.sendEmptyMessageAtTime(LONG_CLICK,
              event.getDownTime() + TAP_TIMEOUT + LONGPRESS_TIMEOUT);
        }
        break;
      }
      case MotionEvent.ACTION_MOVE: {
        if (mGestureTypes.contains(NodeProps.ON_CLICK) || mGestureTypes
            .contains(NodeProps.ON_LONG_CLICK)) {
          if (Math.abs(x - lastX) < ViewConfiguration.getTouchSlop()
              && Math.abs(y - lastY) < ViewConfiguration.getTouchSlop()) {
            handle = true;
          }
        }
        break;
      }
      case MotionEvent.ACTION_UP: {
        if (mGestureTypes.contains(NodeProps.ON_CLICK) || mGestureTypes
            .contains(NodeProps.ON_LONG_CLICK)) {
          if (Math.abs(x - lastX) < ViewConfiguration.getTouchSlop()
              && Math.abs(y - lastY) < ViewConfiguration.getTouchSlop()) {
            handle = true;
            if (mGestureTypes.contains(NodeProps.ON_LONG_CLICK) && mInLongPress) {
              NativeGestureDispatcher.handleLongClick(nativeRenderer, mTagId);
            } else {
              NativeGestureDispatcher.handleClick(view, nativeRenderer, mTagId, true);
            }
          }
        }
        if (mHandler != null) {
          mHandler.removeMessages(LONG_CLICK);
        }
        break;
      }
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_OUTSIDE: {
        if (mHandler != null) {
          mHandler.removeMessages(LONG_CLICK);
        }
        if (mGestureTypes.contains(NodeProps.ON_CLICK) || mGestureTypes
            .contains(NodeProps.ON_LONG_CLICK)) {
          handle = true;
        }
        break;
      }
    }
    lastX = x;
    lastY = y;
    return handle;

  }

  @Override
  public boolean needHandle(String type) {
    if (mGestureTypes != null) {
      return mGestureTypes.contains(type);
    }
    return false;
  }

  @Override
  public void handle(String type, float x, float y) {
    if (TextUtils.equals(type, NodeProps.ON_PRESS_IN)) {
      NativeGestureDispatcher.handlePressIn(nativeRenderer, mTagId);
    } else if (TextUtils.equals(type, NodeProps.ON_PRESS_OUT)) {
      NativeGestureDispatcher.handlePressOut(nativeRenderer, mTagId);
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_DOWN)) {
      NativeGestureDispatcher.handleTouchDown(nativeRenderer, mTagId, x, y, mViewId);
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_MOVE)) {
      NativeGestureDispatcher.handleTouchMove(nativeRenderer, mTagId, x, y, mViewId);
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_END)) {
      NativeGestureDispatcher.handleTouchEnd(nativeRenderer, mTagId, x, y, mViewId);
    } else if (TextUtils.equals(type, NodeProps.ON_TOUCH_CANCEL)) {
      NativeGestureDispatcher.handleTouchCancel(nativeRenderer, mTagId, x, y, mViewId);
    }
  }

  private class GestureHandler extends Handler {

    public GestureHandler() {
      super(Looper.getMainLooper());
    }

    @Override
    public void handleMessage(Message msg) {
      if (msg.what == LONG_CLICK) {
        mInLongPress = true;
      }
    }
  }
}
