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

package com.tencent.mtt.hippy.views.viewpager;

import android.view.View;

import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.supportui.views.viewpager.ViewPager;
import com.tencent.renderer.utils.EventUtils;

import java.util.HashMap;
import java.util.Map;

public class ViewPagerPageChangeListener implements ViewPager.OnPageChangeListener {

    private static final String PAGE_ITEM_POSITION = "position";
    private static final String PAGE_ITEM_OFFSET = "offset";
    private static final String PAGE_SCROLL_STATE = "pageScrollState";
    private int mLastPageIndex;
    private int mCurrPageIndex;
    private final HippyViewPager mPager;

    public ViewPagerPageChangeListener(HippyViewPager pager) {
        mPager = pager;
        mLastPageIndex = 0;
        mCurrPageIndex = 0;
    }

    @Override
    public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
        Map<String, Object> params = new HashMap<>();
        params.put(PAGE_ITEM_POSITION, position);
        params.put(PAGE_ITEM_OFFSET, positionOffset);
        EventUtils.send(mPager, EventUtils.EVENT_PAGE_SCROLL, params);
    }

    @Override
    public void onPageSelected(int position) {
        mCurrPageIndex = position;
        Map<String, Object> params = new HashMap<>();
        params.put(PAGE_ITEM_POSITION, position);
        EventUtils.send(mPager, EventUtils.EVENT_PAGE_SELECTED, params);
        View currView = mPager.getViewFromAdapter(mCurrPageIndex);
        params.put(PAGE_ITEM_POSITION, mCurrPageIndex);
        EventUtils.send(currView, EventUtils.EVENT_PAGE_ITEM_WILL_APPEAR, params);
        View lastView = mPager.getViewFromAdapter(mLastPageIndex);
        params.put(PAGE_ITEM_POSITION, mLastPageIndex);
        EventUtils.send(lastView, EventUtils.EVENT_PAGE_ITEM_WILL_DISAPPEAR, params);
    }

    private void onScrollStateChangeToIdle() {
        if (mPager == null || mCurrPageIndex == mLastPageIndex) {
            return;
        }
        Promise promise = mPager.getCallBackPromise();
        if (promise != null) {
            Map<String, Object> result = new HashMap<>();
            String msg = "on set index successful!";
            result.put("msg", msg);
            promise.resolve(result);
            mPager.setCallBackPromise(null);
        }
        View currView = mPager.getViewFromAdapter(mCurrPageIndex);
        Map<String, Object> params = new HashMap<>();
        params.put(PAGE_ITEM_POSITION, mCurrPageIndex);
        EventUtils.send(currView, EventUtils.EVENT_PAGE_ITEM_DID_APPEAR, params);
        View lastView = mPager.getViewFromAdapter(mLastPageIndex);
        params.put(PAGE_ITEM_POSITION, mLastPageIndex);
        EventUtils.send(lastView, EventUtils.EVENT_PAGE_ITEM_DID_DISAPPEAR, params);
        mLastPageIndex = mCurrPageIndex;
    }

    @Override
    public void onPageScrollStateChanged(int oldState, int newState) {
        String pageScrollState;
        switch (newState) {
            case ViewPager.SCROLL_STATE_IDLE:
                pageScrollState = "idle";
                onScrollStateChangeToIdle();
                break;
            case ViewPager.SCROLL_STATE_DRAGGING:
                pageScrollState = "dragging";
                break;
            case ViewPager.SCROLL_STATE_SETTLING:
                pageScrollState = "settling";
                break;
            default:
                throw new IllegalStateException("Unsupported pageScrollState");
        }
        Map<String, Object> params = new HashMap<>();
        params.put(PAGE_SCROLL_STATE, pageScrollState);
        EventUtils.send(mPager, EventUtils.EVENT_PAGE_SCROLL_STATE_CHANGED, params);
    }
}
