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

package com.tencent.mtt.hippy.views.hippypager;

import android.view.View;
import androidx.viewpager.widget.ViewPager;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageItemExposureEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollStateChangedEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageSelectedEvent;

/**
 * Created  on 2021/7/23.
 */

public class HippyPagerPageChangeListener implements ViewPager.OnPageChangeListener {

    public static final String IDLE = "idle";
    public static final String DRAGGING = "dragging";
    public static final String SETTLING = "settling";
    private HippyPageScrollEvent pageScrollEmitter;
    private HippyPageScrollStateChangedEvent pageScrollStateChangeEmitter;
    private HippyPageSelectedEvent pageSelectedEmitter;
    private int lastPageIndex;
    private int currPageIndex;
    private HippyPager hippyPager;

    public HippyPagerPageChangeListener(HippyPager pager) {
        hippyPager = pager;
        pageScrollEmitter = new HippyPageScrollEvent(pager);
        pageScrollStateChangeEmitter = new HippyPageScrollStateChangedEvent(pager);
        pageSelectedEmitter = new HippyPageSelectedEvent(pager);
        lastPageIndex = 0;
        currPageIndex = 0;
    }

    @Override
    public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
        pageScrollEmitter.send(position, positionOffset);
    }

    @Override
    public void onPageSelected(int position) {
        currPageIndex = position;
        pageSelectedEmitter.send(position);
        if (hippyPager != null) {
            View currView = hippyPager.getViewFromAdapter(currPageIndex);
            HippyPageItemExposureEvent eventWillAppear = new HippyPageItemExposureEvent(
                    HippyPageItemExposureEvent.EVENT_PAGER_ITEM_WILL_APPEAR);
            eventWillAppear.send(currView, currPageIndex);
            View lastView = hippyPager.getViewFromAdapter(lastPageIndex);
            HippyPageItemExposureEvent eventWillDisAppear = new HippyPageItemExposureEvent(
                    HippyPageItemExposureEvent.EVENT_PAGER_ITEM_WILL_DISAPPEAR);
            eventWillDisAppear.send(lastView, lastPageIndex);
        }
    }

    private void onScrollStateChangeToIdle() {
        if (hippyPager != null && currPageIndex != lastPageIndex) {
            Promise promise = hippyPager.getCallBackPromise();
            if (promise != null) {
                String msg = "on set index successful!";
                HippyMap resultMap = new HippyMap();
                resultMap.pushString("msg", msg);
                promise.resolve(resultMap);
                hippyPager.setCallBackPromise(null);
            }
            View currView = hippyPager.getViewFromAdapter(currPageIndex);
            HippyPageItemExposureEvent eventWillAppear = new HippyPageItemExposureEvent(
                    HippyPageItemExposureEvent.EVENT_PAGER_ITEM_DID_APPEAR);
            eventWillAppear.send(currView, currPageIndex);
            View lastView = hippyPager.getViewFromAdapter(lastPageIndex);
            HippyPageItemExposureEvent eventWillDisAppear = new HippyPageItemExposureEvent(
                    HippyPageItemExposureEvent.EVENT_PAGER_ITEM_DID_DISAPPEAR);
            eventWillDisAppear.send(lastView, lastPageIndex);
            lastPageIndex = currPageIndex;
        }
    }

    @Override
    public void onPageScrollStateChanged(int newState) {
        LogUtils.i("HippyPagerStateChanged", "onPageScrollStateChanged newState=" + newState);
        String pageScrollState;
        switch (newState) {
            case ViewPager.SCROLL_STATE_IDLE:
                pageScrollState = IDLE;
                onScrollStateChangeToIdle();
                break;
            case ViewPager.SCROLL_STATE_DRAGGING:
                pageScrollState = DRAGGING;
                break;
            case ViewPager.SCROLL_STATE_SETTLING:
                pageScrollState = SETTLING;
                break;
            default:
                throw new IllegalStateException("Unsupported pageScrollState");
        }
        pageScrollStateChangeEmitter.send(pageScrollState);
    }
}
