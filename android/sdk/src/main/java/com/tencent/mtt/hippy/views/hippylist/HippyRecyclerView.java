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
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.NestedScrollingChild2;
import androidx.core.view.NestedScrollingParent2;
import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.HippyRecyclerViewBase;
import androidx.recyclerview.widget.IHippyViewAboundListener;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderAttachListener;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderHost;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.StickyHeaderHelper;

/**
 * Created  on 2020/12/22. Description
 */
public class HippyRecyclerView<ADP extends HippyRecyclerListAdapter> extends HippyRecyclerViewBase
        implements IHeaderAttachListener, IHippyViewAboundListener,
        NestedScrollingChild2, NestedScrollingParent2 {

    private static int DEFAULT_ITEM_VIEW_CACHE_SIZE = 8;
    protected HippyEngineContext hippyEngineContext;
    protected ADP listAdapter;
    protected boolean isEnableScroll = true;    //使能ListView的滚动功能
    protected StickyHeaderHelper stickyHeaderHelper;        //支持吸顶
    protected IHeaderHost headerHost;                //用于pullHeader下拉刷新
    protected LayoutManager layoutManager;
    protected RecyclerViewEventHelper recyclerViewEventHelper;//事件集合
    protected int renderNodeCount = 0;
    private NodePositionHelper nodePositionHelper;
    private ViewStickEventHelper viewStickEventHelper;
    private boolean stickEventEnable;
    private int mInitialContentOffset;
    private boolean isTvPlatform = false;
    private HippyRecycleViewFocusHelper mFocusHelper = null;
    private int mNestedScrollAxesTouch;
    private int mNestedScrollAxesNonTouch;

    public HippyRecyclerView(Context context) {
        super(context);
    }

    public HippyRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public HippyRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    protected void init() {
        super.init();
        // enable nested scrolling
        setNestedScrollingEnabled(true);
    }

    public void onDestroy() {
        if (stickyHeaderHelper != null) {
            stickyHeaderHelper.detachSticky();
        }
    }

    public ADP getAdapter() {
        return listAdapter;
    }

    @Override
    public void setAdapter(@Nullable Adapter adapter) {
        listAdapter = (ADP) adapter;
        if (adapter != null) {
            setOnTouchListener(listAdapter);
        }
        super.setAdapter(adapter);
    }

    public NodePositionHelper getNodePositionHelper() {
        if (nodePositionHelper == null) {
            nodePositionHelper = new NodePositionHelper();
        }
        return nodePositionHelper;
    }

    public void setOrientation(LinearLayoutManager layoutManager) {
        this.layoutManager = layoutManager;
    }

    public void setHeaderHost(IHeaderHost headerHost) {
        this.headerHost = headerHost;
    }

    public void setHippyEngineContext(HippyEngineContext hippyEngineContext) {
        this.hippyEngineContext = hippyEngineContext;
    }

    public void initRecyclerView() {
        isTvPlatform = hippyEngineContext.isRunningOnTVPlatform();
        setAdapter(new HippyRecyclerListAdapter<HippyRecyclerView>(this, this.hippyEngineContext));
        intEventHelper();
        setItemViewCacheSize(DEFAULT_ITEM_VIEW_CACHE_SIZE);
        if (isTvPlatform) {
            mFocusHelper = new HippyRecycleViewFocusHelper(this);
            setFocusableInTouchMode(true);
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        if (!isEnableScroll || mNestedScrollAxesTouch != SCROLL_AXIS_NONE) {
            // We want to prevent the same direction intercepts only, so we can't use
            // `requestDisallowInterceptTouchEvent` for this purpose.
            // `mNestedScrollAxesTouch != SCROLL_AXIS_NONE` means has nested scroll child, no
            // need to intercept
            return false;
        }
        return super.onInterceptTouchEvent(ev);
    }

    @Override
    public boolean onTouchEvent(MotionEvent e) {
        if (!isEnableScroll) {
            return false;
        }
        return super.onTouchEvent(e);
    }

    public void setInitialContentOffset(int initialContentOffset) {
        mInitialContentOffset = initialContentOffset;
    }

    private int getFirstVisiblePositionByOffset(int offset) {
        int position = 0;
        int distanceToPosition = 0;
        int itemCount = getAdapter().getItemCount();
        boolean vertical = HippyListUtils.isVerticalLayout(this);
        for (int i = 0; i < itemCount; i++) {
            distanceToPosition +=
                    vertical ? listAdapter.getItemHeight(i) : listAdapter.getItemWidth(i);
            if (distanceToPosition > offset) {
                position = i;
                break;
            }
        }
        return position;
    }

    private void scrollToInitContentOffset() {
        int position = getFirstVisiblePositionByOffset(mInitialContentOffset);
        int positionOffset = -(mInitialContentOffset - getTotalHeightBefore(position));
        scrollToPositionWithOffset(position, positionOffset);
        mInitialContentOffset = 0;
    }

    /**
     * 刷新数据
     */
    public void setListData() {
        LogUtils.d("HippyRecyclerView", "itemCount =" + listAdapter.getItemCount());
        listAdapter.notifyDataSetChanged();

        if (isTvPlatform) {
            mFocusHelper.setListData();
        }

        //notifyDataSetChanged 本身是可以触发requestLayout的，但是Hippy框架下 HippyRootView 已经把
        //onLayout方法重载写成空方法，requestLayout不会回调孩子节点的onLayout，这里需要自己发起dispatchLayout
        renderNodeCount = getAdapter().getRenderNodeCount();
        dispatchLayout();
        if (renderNodeCount > 0) {
            if (mInitialContentOffset > 0 && getChildCount() > 0) {
                scrollToInitContentOffset();
            }
        }
    }

    /**
     * 内容偏移，返回recyclerView顶部被滑出去的内容 1、找到顶部第一个View前面的逻辑内容高度 2、加上第一个View被遮住的区域
     */
    public int getContentOffsetY() {
        return computeVerticalScrollOffset();
    }

    /**
     * 内容偏移，返回recyclerView被滑出去的内容 1、找到顶部第一个View前面的逻辑内容宽度 2、加上第一个View被遮住的区域
     */
    public int getContentOffsetX() {
        int firstChildPosition = getFirstChildPosition();
        int totalWidthBeforePosition = getTotalWithBefore(firstChildPosition);
        int firstChildOffset =
                listAdapter.getItemWidth(firstChildPosition) - getVisibleWidth(getChildAt(0));
        return totalWidthBeforePosition + firstChildOffset;
    }

    /**
     * 获取一个View的可视高度，并非view本身的height，有可能部分是被滑出到屏幕外部
     */
    protected int getVisibleHeight(View firstChildView) {
        return getViewVisibleRect(firstChildView).height();
    }

    /**
     * 获取一个View的可视高度，并非view本身的height，有可能部分是被滑出到屏幕外部
     */
    protected int getVisibleWidth(View firstChildView) {
        return getViewVisibleRect(firstChildView).width();
    }

    /**
     * 获取view在父亲中的可视区域
     */
    private Rect getViewVisibleRect(View view) {
        Rect rect = new Rect();
        if (view != null) {
            view.getLocalVisibleRect(rect);
        }
        return rect;
    }

    /**
     * 获取position 前面的内容高度，不包含position自身的高度 对于竖向排版，取ItemHeight求和，对于横向排版，取ItemWidth求和
     */
    public int getTotalHeightBefore(int position) {
        int totalHeightBefore = 0;
        boolean vertical = HippyListUtils.isVerticalLayout(this);
        for (int i = 0; i < position; i++) {
            totalHeightBefore +=
                    vertical ? listAdapter.getItemHeight(i) : listAdapter.getItemWidth(i);
        }
        return totalHeightBefore;
    }

    /**
     * 获取renderNodePosition前面的内容高度，不包含renderNodePosition自身的高度 对于竖向排版，取RenderNodeHeight求和，对于横向排版，取RenderNodeWidth求和
     */
    public int getRenderNodeHeightBefore(int renderNodePosition) {
        int renderNodeTotalHeight = 0;
        boolean vertical = HippyListUtils.isVerticalLayout(this);
        for (int i = 0; i < renderNodePosition; i++) {
            renderNodeTotalHeight += vertical ? listAdapter.getRenderNodeHeight(i)
                    : listAdapter.getRenderNodeWidth(i);
        }
        return renderNodeTotalHeight;
    }


    /**
     * 获取position 前面的内容高度，不包含position自身的高度
     */
    public int getTotalWithBefore(int position) {
        int totalWidthBefore = 0;
        for (int i = 0; i < position; i++) {
            totalWidthBefore += listAdapter.getItemWidth(i);
        }
        return totalWidthBefore;
    }

    public RecyclerViewEventHelper getRecyclerViewEventHelper() {
        return intEventHelper();
    }

    private RecyclerViewEventHelper intEventHelper() {
        if (recyclerViewEventHelper == null) {
            recyclerViewEventHelper = createEventHelper();
        }
        return recyclerViewEventHelper;
    }

    protected RecyclerViewEventHelper createEventHelper() {
        return new RecyclerViewEventHelper(this);
    }

    /**
     * 设置recyclerView可以滚动
     */
    public void setScrollEnable(boolean enable) {
        isEnableScroll = enable;
    }

    public int getNodePositionInAdapter(int position) {
        return position;
    }

    public void scrollToIndex(int xIndex, int yPosition, boolean animated, int duration) {
        int positionInAdapter = getNodePositionInAdapter(yPosition);
        if (animated) {
            doSmoothScrollY(duration,
                    getTotalHeightBefore(positionInAdapter) - getContentOffsetY());
            postDispatchLayout();
        } else {
            scrollToPositionWithOffset(positionInAdapter, 0);
            //不能调用postDispatchLayout，需要立即调研dispatchLayout，否则滚动位置不对
            dispatchLayout();
        }
    }

    /**
     * @param xOffset 暂不支持
     * @param yOffset yOffset>0 内容向上移动，yOffset<0， 内容向下移动
     * @param animated 是否有动画
     * @param duration 动画的时间
     */
    public void scrollToContentOffset(double xOffset, double yOffset, boolean animated,
            int duration) {
        if (!canScrollToContentOffset()) {
            return;
        }
        int yOffsetInPixel = (int) PixelUtil.dp2px(yOffset);
        int deltaY = yOffsetInPixel - getContentOffsetY();
        //增加异常保护
        if (animated) {
            doSmoothScrollY(duration, deltaY);
        } else {
            scrollBy(0, deltaY);
        }
    }

    /**
     * renderNodeCount是在setListData的时候更新，必须调用setListData后，确保renderNodeCount和
     * getAdapter().getRenderNodeCount()的值相等，才能进行滚动，否则scrollBy会出现IndexOutOfBoundsException
     * 的问题，主要原因就是RecyclerView的内部状态没有通过setListData进行刷新，还是老的数据， 这个比现的场景来自于QQ浏览器的搜索tab的切换。
     * RenderManager的batch方法应该把dispatchUIFunction放到batchComplete后面，但是这样改动太大
     *
     * @return
     */
    private boolean canScrollToContentOffset() {
        return renderNodeCount == getAdapter().getRenderNodeCount();
    }

    private void doSmoothScrollY(int duration, int scrollToYPos) {
        if (duration != 0) {
            if (scrollToYPos != 0 && !didStructureChange()) {
                smoothScrollBy(0, scrollToYPos, duration);
                postDispatchLayout();
            }
        } else {
            smoothScrollBy(0, scrollToYPos);
            postDispatchLayout();
        }
    }

    private void postDispatchLayout() {
        post(new Runnable() {
            @Override
            public void run() {
                dispatchLayout();
            }
        });
    }

    public void scrollToTop() {
        LayoutManager layoutManager = getLayoutManager();
        if (layoutManager.canScrollHorizontally()) {
            smoothScrollBy(-getContentOffsetX(), 0);
        } else {
            smoothScrollBy(0, -getContentOffsetY());
        }
        postDispatchLayout();
    }

    /**
     * @param enable true ：支持Item 上滑吸顶功能
     */
    public void setRowShouldSticky(boolean enable) {
        if (enable) {
            if (stickyHeaderHelper == null) {
                stickyHeaderHelper = new StickyHeaderHelper(this, listAdapter, this, headerHost);
                addOnScrollListener(stickyHeaderHelper);
            }
        } else {
            if (stickyHeaderHelper != null) {
                removeOnScrollListener(stickyHeaderHelper);
            }
        }
    }

    /**
     * 同步删除RenderNode对应注册的View，deleteChild是递归删除RenderNode创建的所有的view
     */
    @Override
    public void onViewAbound(HippyRecyclerViewHolder viewHolder) {
        if (viewHolder.bindNode != null && !viewHolder.bindNode.isDelete()) {
            getAdapter().deleteExistRenderView(viewHolder.bindNode);
        }
    }

    /**
     * 当header被摘下来，需要对header进行还原或者回收对处理 遍历所有都ViewHolder，看看有没有收纳这个headerView都ViewHolder
     * 如果没有，需要把aboundHeader进行回收，并同步删除render节点对应都view
     *
     * @param aboundHeader HeaderView对应的Holder
     * @param currentHeaderView headerView的实体内容
     */
    @Override
    public void onHeaderDetached(ViewHolder aboundHeader, View currentHeaderView) {
        boolean findHostViewHolder = false;
        for (int i = 0; i < getChildCountWithCaches(); i++) {
            ViewHolder viewHolder = getChildViewHolder(getChildAtWithCaches(i));
            if (isTheSameRenderNode((HippyRecyclerViewHolder) aboundHeader,
                    (HippyRecyclerViewHolder) viewHolder)) {
                findHostViewHolder = true;
                fillContentView(currentHeaderView, viewHolder);
                break;
            }
        }
        //当header无处安放，抛弃view都同时，需要同步给Hippy进行View都删除，不然后续无法创建对应都View
        if (!findHostViewHolder) {
            onViewAbound((HippyRecyclerViewHolder) aboundHeader);
        }
    }

    private boolean fillContentView(View currentHeaderView, ViewHolder viewHolder) {
        if (viewHolder != null && viewHolder.itemView instanceof ViewGroup) {
            ViewGroup itemView = (ViewGroup) viewHolder.itemView;
            if (itemView.getChildCount() <= 0) {
                itemView.addView(currentHeaderView);
            }
        }
        return false;
    }

    public boolean isTheSameRenderNode(HippyRecyclerViewHolder aboundHeader,
            HippyRecyclerViewHolder viewHolder) {
        if (viewHolder.bindNode != null && aboundHeader.bindNode != null) {
            return viewHolder.bindNode.getId() == aboundHeader.bindNode.getId();
        }
        return false;
    }

    public void setNodePositionHelper(NodePositionHelper nodePositionHelper) {
        this.nodePositionHelper = nodePositionHelper;
    }

    public void enableStickEvent(boolean enable) {
        stickEventEnable = enable;
    }

    public void onAfterUpdateProps() {
        if (stickEventEnable) {
            ensureViewStickEventHelper();
        } else {
            destoryViewStickEventHelper();
        }
    }

    private void ensureViewStickEventHelper() {
        if (viewStickEventHelper == null) {
            viewStickEventHelper = new ViewStickEventHelper((View) this.getParent());
        }
        if (stickyHeaderHelper != null) {
            stickyHeaderHelper.setStickViewListener(viewStickEventHelper);
        }
    }

    private void destoryViewStickEventHelper() {
        if (stickyHeaderHelper != null) {
            stickyHeaderHelper.setStickViewListener(null);
        }
        viewStickEventHelper = null;
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            if (isTvPlatform) {
                mFocusHelper.setKeyCode(event.getKeyCode());
            }
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public void requestChildFocus(View child, View focused) {
        super.requestChildFocus(child, focused);
        if (isTvPlatform) {
            mFocusHelper.requestChildFocus(child, focused);
        }
    }

    @Override
    public boolean requestChildRectangleOnScreen(View child, Rect rect, boolean immediate) {
        if (isTvPlatform) {
            return mFocusHelper.requestChildRectangleOnScreen(child, rect, immediate);
        }
        return super.requestChildRectangleOnScreen(child, rect, immediate);
    }

    @Override
    protected int getChildDrawingOrder(int childCount, int i) {
        if (isTvPlatform) {
            return mFocusHelper.getChildDrawingOrder(childCount, i);
        }
        return super.getChildDrawingOrder(childCount, i);
    }

    @Override
    public View focusSearch(View focused, int direction) {
        if (isTvPlatform) {
            return mFocusHelper.focusSearch(focused, direction);
        }
        return super.focusSearch(focused, direction);
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "{renderNodeCount:" + renderNodeCount + ",state:"
                + getStateInfo()
                + "}";
    }

    private int computeHorizontallyScrollDistance(int dx) {
        if (dx < 0) {
            return Math.max(dx, -computeHorizontalScrollOffset());
        }
        if (dx > 0) {
            int avail = computeHorizontalScrollRange() - computeHorizontalScrollExtent()
                - computeHorizontalScrollOffset() - 1;
            return Math.min(dx, avail);
        }
        return 0;
    }

    private int computeVerticallyScrollDistance(int dy) {
        if (dy < 0) {
            return Math.max(dy, -computeVerticalScrollOffset());
        }
        if (dy > 0) {
            int avail = computeVerticalScrollRange() - computeVerticalScrollExtent()
                - computeVerticalScrollOffset() - 1;
            return Math.min(dy, avail);
        }
        return 0;
    }

    @Override
    public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes) {
        return onStartNestedScroll(child, target, axes, ViewCompat.TYPE_TOUCH);
    }

    @Override
    public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes,
        int type) {
        if (!isEnableScroll) {
            return false;
        }
        // Determine whether to respond to the nested scrolling event of the child
        LayoutManager manager = getLayoutManager();
        if (manager == null) {
            return false;
        }
        int myAxes = SCROLL_AXIS_NONE;
        if (manager.canScrollVertically() && (axes & SCROLL_AXIS_VERTICAL) != 0) {
            myAxes |= SCROLL_AXIS_VERTICAL;
        }
        if (manager.canScrollHorizontally() && (axes & SCROLL_AXIS_HORIZONTAL) != 0) {
            myAxes |= SCROLL_AXIS_HORIZONTAL;
        }
        if (myAxes != SCROLL_AXIS_NONE) {
            if (type == ViewCompat.TYPE_TOUCH) {
                mNestedScrollAxesTouch = myAxes;
            } else {
                mNestedScrollAxesNonTouch = myAxes;
            }
            return true;
        }
        return false;
    }

    @Override
    public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes) {
        onNestedScrollAccepted(child, target, axes, ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes,
        int type) {
        startNestedScroll(
            type == ViewCompat.TYPE_TOUCH ? mNestedScrollAxesTouch : mNestedScrollAxesNonTouch,
            type);
    }

    @Override
    public void onStopNestedScroll(@NonNull View child) {
        onStopNestedScroll(child, ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onStopNestedScroll(@NonNull View target, int type) {
        if (type == ViewCompat.TYPE_TOUCH) {
            mNestedScrollAxesTouch = SCROLL_AXIS_NONE;
        } else {
            mNestedScrollAxesNonTouch = SCROLL_AXIS_NONE;
        }
        stopNestedScroll(type);
    }

    @Override
    public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed,
        int dxUnconsumed,
        int dyUnconsumed) {
        onNestedScroll(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed,
            ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed,
        int dxUnconsumed,
        int dyUnconsumed, int type) {
        // Process the current View first
        int myDx = dxUnconsumed != 0 ? computeHorizontallyScrollDistance(dxUnconsumed) : 0;
        int myDy = dyUnconsumed != 0 ? computeVerticallyScrollDistance(dyUnconsumed) : 0;
        if (myDx != 0 || myDy != 0) {
            scrollBy(myDx, myDy);
            dxConsumed += myDx;
            dyConsumed += myDy;
            dxUnconsumed -= myDx;
            dyUnconsumed -= myDy;
        }
        // Then dispatch to the parent for processing
        int parentDx = dxUnconsumed;
        int parentDy = dyUnconsumed;
        if (parentDx != 0 || parentDy != 0) {
            dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null, type);
        }
    }

    @Override
    public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed) {
        onNestedPreScroll(target, dx, dy, consumed, ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed,
        int type) {
        // Dispatch to the parent for processing first
        int parentDx = dx;
        int parentDy = dy;
        if (parentDx != 0 || parentDy != 0) {
            // Temporarily store `consumed` to reuse the Array
            int consumedX = consumed[0];
            int consumedY = consumed[1];
            consumed[0] = 0;
            consumed[1] = 0;
            dispatchNestedPreScroll(parentDx, parentDy, consumed, null, type);
            consumed[0] += consumedX;
            consumed[1] += consumedY;
        }
    }

    @Override
    public int getNestedScrollAxes() {
        return mNestedScrollAxesTouch | mNestedScrollAxesNonTouch;
    }
}
