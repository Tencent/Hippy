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

package com.tencent.renderer.component.text;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;

import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.NativeGestureProcessor;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;

import java.util.ArrayList;

import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_CLICK;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_LONG_CLICK;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_PRESS_IN;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_PRESS_OUT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_CANCEL;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_DOWN;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_END;
import static com.tencent.mtt.hippy.dom.node.NodeProps.ON_TOUCH_MOVE;

public class TextGestureSpan implements NativeGestureProcessor.Callback {

    private static final String TAG = "TextGestureSpan";
    private static final int LONG_CLICK = 3;
    private static final int LONG_PRESS_TIMEOUT = ViewConfiguration.getLongPressTimeout();
    private static final int TAP_TIMEOUT = ViewConfiguration.getTapTimeout();
    private boolean mHandleLongPress = false;
    private final int mId;
    private int mLastX = 0;
    private int mLastY = 0;
    private int mTouchSlop = -1;
    private View mTargetView = null;
    private ArrayList<String> mGestureTypes = null;
    private NativeGestureProcessor mGestureProcessor;
    private Handler mHandler;
    private NativeRender mNativeRenderer;

    public TextGestureSpan(int id) {
        mId = id;
    }

    public void addGestureTypes(ArrayList<String> types) {
        mGestureTypes = types;
    }

    public boolean handleTouchEvent(View view, MotionEvent event) {
        if (mGestureProcessor == null) {
            mGestureProcessor = new NativeGestureProcessor(TextGestureSpan.this);
        }
        mTargetView = view;
        return mGestureProcessor.onTouchEvent(event);
    }

    public boolean handleDispatchTouchEvent(View view, MotionEvent event) {
        if (mNativeRenderer == null) {
            mNativeRenderer = NativeRendererManager.getNativeRenderer(view.getContext());
        }
        if (mNativeRenderer == null || mGestureTypes == null) {
            return false;
        }
        if (mTouchSlop < 0) {
            ViewConfiguration config = ViewConfiguration.get(view.getContext());
            mTouchSlop = config.getScaledTouchSlop();
        }
        boolean handle = false;
        int action = event.getAction();
        int x = (int) event.getX();
        int y = (int) event.getY();
        switch (action) {
            case MotionEvent.ACTION_DOWN: {
                handle = true;
                mHandleLongPress = false;
                if (mGestureTypes.contains(ON_LONG_CLICK)) {
                    if (mHandler == null) {
                        mHandler = new GestureHandler();
                    }
                    mHandler.sendEmptyMessageAtTime(LONG_CLICK,
                            event.getDownTime() + TAP_TIMEOUT + LONG_PRESS_TIMEOUT);
                }
                break;
            }
            case MotionEvent.ACTION_MOVE: {
                if (mGestureTypes.contains(ON_LONG_CLICK) || mGestureTypes.contains(ON_CLICK)) {
                    if (Math.abs(x - mLastX) < mTouchSlop && Math.abs(y - mLastY) < mTouchSlop) {
                        handle = true;
                    }
                }
                break;
            }
            case MotionEvent.ACTION_UP: {
                if (Math.abs(x - mLastX) < mTouchSlop && Math.abs(y - mLastY) < mTouchSlop) {
                    if (mGestureTypes.contains(ON_LONG_CLICK) && mHandleLongPress) {
                        handle = true;
                        NativeGestureDispatcher
                                .handleClickEvent(mNativeRenderer, mId, ON_LONG_CLICK);
                    } else if (mGestureTypes.contains(ON_CLICK)) {
                        handle = true;
                        NativeGestureDispatcher
                                .handleClickEvent(mNativeRenderer, mId, ON_CLICK);
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
                handle = true;
                break;
            }
            default:
                LogUtils.e(TAG, "handleDispatchTouchEvent: Unknown motion event =" + action);
        }
        mLastX = x;
        mLastY = y;
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
        switch (type) {
            case ON_PRESS_IN:
                // fall through
            case ON_PRESS_OUT:
                NativeGestureDispatcher.handleClickEvent(mNativeRenderer, mId, type);
                break;
            case ON_TOUCH_DOWN:
                // fall through
            case ON_TOUCH_MOVE:
                // fall through
            case ON_TOUCH_END:
                // fall through
            case ON_TOUCH_CANCEL:
                NativeGestureDispatcher
                        .handleTouchEvent(mNativeRenderer, mTargetView, mId, x, y, type);
                break;
            default:
                LogUtils.e(TAG, "handle: Unknown event type=" + type);
        }
    }

    private class GestureHandler extends Handler {

        public GestureHandler() {
            super(Looper.getMainLooper());
        }

        @Override
        public void handleMessage(Message msg) {
            if (msg.what == LONG_CLICK) {
                mHandleLongPress = true;
            }
        }
    }
}
