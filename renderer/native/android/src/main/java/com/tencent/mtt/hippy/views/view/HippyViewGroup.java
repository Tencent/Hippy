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
package com.tencent.mtt.hippy.views.view;

import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.IHippyZIndexViewGroup;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.ViewGroupDrawingOrderHelper;
import com.tencent.mtt.hippy.utils.LogUtils;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.RectF;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import com.tencent.renderer.component.FlatViewGroup;

public class HippyViewGroup extends FlatViewGroup implements HippyViewBase, IHippyZIndexViewGroup {

    private static final String TAG = "HippyViewGroup";
    private final ViewGroupDrawingOrderHelper mDrawingOrderHelper;
    float mDownX = 0;
    float mDownY = 0;
    boolean isHandlePullUp = false;
    private String mOverflow;
    private Path mOverflowPath;
    private RectF mOverflowRect;
    private ViewConfiguration mViewConfiguration;
    @Nullable
    protected NativeGestureDispatcher mGestureDispatcher;

    public HippyViewGroup(Context context) {
        super(context);
        mDrawingOrderHelper = new ViewGroupDrawingOrderHelper(this);
        setClipChildren(false);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (mGestureDispatcher != null) {
            result |= mGestureDispatcher.handleTouchEvent(event);
        }
        return result;
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
    }

    public void setOverflow(String overflow) {
        mOverflow = overflow;
        setOverflow(overflow, this);
    }

    public static void setOverflow(@NonNull String overflow, @NonNull ViewGroup viewGroup) {
        switch (overflow) {
            case "visible":
                viewGroup.setClipChildren(false);
                viewGroup.invalidate();
                break;
            case "hidden": {
                viewGroup.setClipChildren(true);
                viewGroup.invalidate();
                break;
            }
            default:
                LogUtils.w(TAG, "setOverflow: Unknown overflow type =" + overflow);
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        int action = ev.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_DOWN) {
            mDownX = ev.getX();
            mDownY = ev.getY();
            isHandlePullUp = false;
        }

        boolean result = super.onInterceptTouchEvent(ev);

        if (mGestureDispatcher != null) {
            result |= mGestureDispatcher.needHandle(NodeProps.ON_INTERCEPT_TOUCH_EVENT);
        }

        if (!result && mGestureDispatcher != null && mGestureDispatcher
                .needHandle(NodeProps.ON_INTERCEPT_PULL_UP_EVENT)) {
            //noinspection SwitchStatementWithTooFewBranches
            switch (action) {
                case MotionEvent.ACTION_MOVE: {
                    if (isHandlePullUp) {
                        break;
                    }
                    if (mViewConfiguration == null) {
                        //noinspection deprecation
                        mViewConfiguration = new ViewConfiguration();
                    }
                    float dx = ev.getX() - mDownX;
                    float dy = ev.getY() - mDownY;
                    if (dy < 0 && Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > mViewConfiguration
                            .getScaledTouchSlop()) {
                        mGestureDispatcher.handle(NodeProps.ON_TOUCH_DOWN, mDownX, mDownY);
                        isHandlePullUp = true;
                    }
                    break;
                }
            }
            result = isHandlePullUp;
        }
        return result;
    }

    @Override
    protected int getChildDrawingOrder(int childCount, int index) {
        return mDrawingOrderHelper.getChildDrawingOrder(childCount, index);
    }

    @Override
    public int getZIndexMappedChildIndex(int index) {
        if (mDrawingOrderHelper.shouldEnableCustomDrawingOrder()) {
            return mDrawingOrderHelper.getChildDrawingOrder(getChildCount(), index);
        } else {
            return index;
        }
    }

    @Override
    public void updateDrawingOrder() {
        mDrawingOrderHelper.update();
        invalidate();
    }

    @Override
    public void addView(View child, int index) {
        super.addView(child, index);
        mDrawingOrderHelper.handleAddView(child);
    }

    @Override
    public void removeView(View view) {
        super.removeView(view);
        mDrawingOrderHelper.handleRemoveView(view);
    }
}
