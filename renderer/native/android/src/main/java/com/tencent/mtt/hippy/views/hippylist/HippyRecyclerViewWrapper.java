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

package com.tencent.mtt.hippy.views.hippylist;

import android.content.Context;
import android.os.Build.VERSION_CODES;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.recyclerview.widget.HippyRecyclerExtension;
import androidx.recyclerview.widget.HippyRecyclerPool;
import android.view.View;
import android.view.ViewTreeObserver.OnGlobalLayoutListener;
import android.widget.FrameLayout;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderHost;

/**
 * Description
 * 这里搞一个RecyclerViewWrapper
 * 其实是一个普通的FrameLayout，并不是RecyclerView，主要为吸顶的Header功能考虑，
 * 系统RecyclerView做吸顶功能最简单的实现的是在RecyclerView的父亲覆盖一个View，
 * 这样不会影响RecyclerView的Layout的排版，否则就需要重写LayoutManager，重新layoutManager也是后面要考虑的。
 */
public class HippyRecyclerViewWrapper<HRCV extends HippyRecyclerView> extends FrameLayout implements HippyViewBase,
        IHeaderHost, HippyNestedScrollComponent {

    protected HRCV recyclerView;
    private NativeGestureDispatcher nativeGestureDispatcher;

    public HippyRecyclerViewWrapper(@NonNull Context context, HRCV recyclerView) {
        super(context);
        this.recyclerView = recyclerView;
        addView(recyclerView, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        HippyRecyclerExtension cacheExtension = new HippyRecyclerExtension(recyclerView,
                recyclerView.getNodePositionHelper());
        recyclerView.setViewCacheExtension(cacheExtension);
        recyclerView.setHeaderHost(this);
        HippyRecyclerPool pool = new HippyRecyclerPool(this, cacheExtension,
                recyclerView.getNodePositionHelper());
        pool.setViewHolderAbandonListener(recyclerView);
        recyclerView.setRecycledViewPool(pool);

    }

    @Override
    public int computeVerticalScrollOffset() {
        return recyclerView.computeVerticalScrollOffset();
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return nativeGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        nativeGestureDispatcher = dispatcher;
    }

    public int getChildCountWithCaches() {
        return recyclerView.getChildCountWithCaches();
    }

    public View getChildAtWithCaches(int index) {
        return recyclerView.getChildAtWithCaches(index);
    }

    public void setListData() {
        recyclerView.setListData();
    }

    public RecyclerViewEventHelper getRecyclerViewEventHelper() {
        return recyclerView.getRecyclerViewEventHelper();
    }

    public void setScrollEnable(boolean flag) {
        recyclerView.setScrollEnable(flag);
    }

    public void scrollToIndex(int xIndex, int yIndex, boolean animated, int duration) {
        recyclerView.scrollToIndex(xIndex, yIndex, animated, duration);
    }

    public void scrollToContentOffset(double xOffset, double yOffset, boolean animated, int duration) {
        recyclerView.scrollToContentOffset(xOffset, yOffset, animated, duration);
    }

    public void scrollToTop() {
        recyclerView.scrollToTop();
    }

    public void setRowShouldSticky(boolean enable) {
        recyclerView.setRowShouldSticky(enable);
    }

    public HRCV getRecyclerView() {
        return recyclerView;
    }

    /**
     * 将HeaderView放到RecyclerView到父亲View上面
     */
    @Override
    public void attachHeader(View headerView, LayoutParams layoutParams) {
        addView(headerView, layoutParams);
        layout(getLeft(), getTop(), getRight(), getBottom());
        getViewTreeObserver().dispatchOnGlobalLayout();
    }

    @Override
    public void addOnLayoutListener(OnGlobalLayoutListener listener) {
        getViewTreeObserver().addOnGlobalLayoutListener(listener);
    }

    @RequiresApi(api = VERSION_CODES.JELLY_BEAN)
    @Override
    public void removeOnLayoutListener(OnGlobalLayoutListener listener) {
        getViewTreeObserver().removeOnGlobalLayoutListener(listener);
    }

    public void onBatchStart() {
        recyclerView.onBatchStart();
    }

    public void onBatchComplete() {
        recyclerView.onBatchComplete();
    }

    public void onDestroy() {
        recyclerView.onDestroy();
    }

    @Override
    public void setNestedScrollPriority(int direction, Priority priority) {
        recyclerView.setNestedScrollPriority(direction, priority);
    }

    @Override
    public Priority getNestedScrollPriority(int direction) {
        return recyclerView.getNestedScrollPriority(direction);
    }
}
