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

package com.tencent.mtt.hippy.views.list;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;
import com.tencent.renderer.utils.EventUtils;

public class HippyListItemView extends HippyViewGroup {

    private static final boolean VIEW_LEVEL_MONITOR_ENABLE = false;
    private Paint mPaint;

    public final static int EXPOSURE_STATE_FULL_VISIBLE = 1;
    public final static int EXPOSURE_STATE_INVISIBLE = 2;
    public final static int EXPOSURE_STATE_PART_VISIBLE = 3;

    private int mExposureState = EXPOSURE_STATE_INVISIBLE;

    @Deprecated
    public int getExposureState() {
        return mExposureState;
    }

    @Deprecated
    public void setExposureState(int state) {
        mExposureState = state;
    }

    public HippyListItemView(Context context) {
        super(context);

        if (VIEW_LEVEL_MONITOR_ENABLE) {
            mPaint = new Paint();
            mPaint.setColor(Color.RED);
            mPaint.setTextSize(PixelUtil.dp2px(16));
            mPaint.setTextAlign(Paint.Align.CENTER);
        }
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
        if (VIEW_LEVEL_MONITOR_ENABLE) {
            canvas.save();
            int selfLevel = calculateSelfLevel();
            int hippyLevel = calculateHippyLevel();
            int childLevel = calculateChildLevel(this);
            canvas.drawText(
                    "总：" + (selfLevel + childLevel) + " , HP：" + (hippyLevel + childLevel) + " , 子："
                            + childLevel, getWidth() / 2.0f,
                    getHeight() / 2.0f, mPaint);
            canvas.restore();
        }
    }

    private int calculateSelfLevel() {
        int level = 0;
        View view = this;
        while (true) {
            if (view.getParent() != null && view.getParent() instanceof View) {
                view = (View) view.getParent();
                ++level;
            } else {
                break;
            }
        }
        return level;
    }

    private int calculateHippyLevel() {
        int level = 0;
        View view = this;
        while (true) {
            if (view.getParent() != null && view.getParent() instanceof View && !(view
                    .getParent() instanceof HippyRootView)) {
                view = (View) view.getParent();
                ++level;
            } else if (view.getParent() instanceof HippyRootView) {
                ++level;
                break;
            } else {
                break;
            }
        }
        return level;
    }

    private int calculateChildLevel(View view) {
        int level = 1;
        if (view instanceof ViewGroup) {
            int count = this.getChildCount();
            if (count != 0) {
                int maxLevel = 0;
                int currentLevel;
                for (int i = 0; i < count; i++) {
                    currentLevel = calculateChildLevel(((ViewGroup) view).getChildAt(i));
                    maxLevel = Math.max(maxLevel, currentLevel);
                }
                level = maxLevel + level;
            }
        }
        return level;
    }

    public void moveToExposureState(int state) {
        if (state == mExposureState) {
            return;
        }
        switch (state) {
            case EXPOSURE_STATE_FULL_VISIBLE:
                if (mExposureState == EXPOSURE_STATE_INVISIBLE) {
                    sendExposureEvent(EventUtils.EVENT_LIST_ITEM_WILL_APPEAR);
                }
                sendExposureEvent(EventUtils.EVENT_LIST_ITEM_APPEAR);
                break;
            case EXPOSURE_STATE_PART_VISIBLE:
                if (mExposureState == EXPOSURE_STATE_FULL_VISIBLE) {
                    sendExposureEvent(EventUtils.EVENT_LIST_ITEM_WILL_DISAPPEAR);
                } else {
                    sendExposureEvent(EventUtils.EVENT_LIST_ITEM_WILL_APPEAR);
                }
                break;
            case EXPOSURE_STATE_INVISIBLE:
                if (mExposureState == EXPOSURE_STATE_FULL_VISIBLE) {
                    sendExposureEvent(EventUtils.EVENT_LIST_ITEM_WILL_DISAPPEAR);
                }
                sendExposureEvent(EventUtils.EVENT_LIST_ITEM_DISAPPEAR);
                break;
            default:
                break;
        }
        mExposureState = state;
    }

    private void sendExposureEvent(String eventName) {
        EventUtils.sendComponentEvent(this, eventName, null);
    }
}
