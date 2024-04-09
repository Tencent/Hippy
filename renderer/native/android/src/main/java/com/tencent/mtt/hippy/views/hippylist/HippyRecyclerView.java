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

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;

import android.content.Context;
import android.graphics.Rect;
import android.view.ViewConfiguration;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.HippyRecyclerViewBase;
import androidx.recyclerview.widget.HippyViewHolderAbandonListener;
import androidx.recyclerview.widget.LinearLayoutManager;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import androidx.recyclerview.widget.StaggeredGridLayoutManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.HippyNestedScrollTarget2;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollHelper;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderAttachListener;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderHost;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.StickyHeaderHelper;
import androidx.recyclerview.widget.HippyStaggeredGridLayoutManager;
import java.util.ArrayList;

/**
 * Created  on 2020/12/22. Description
 */
public class HippyRecyclerView<ADP extends HippyRecyclerListAdapter> extends HippyRecyclerViewBase
        implements IHeaderAttachListener, HippyViewHolderAbandonListener, HippyNestedScrollTarget2 {

    private static int DEFAULT_ITEM_VIEW_CACHE_SIZE = 4;
    private static final int INVALID_POINTER = -1;
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
    private ArrayList<View> mFocusableViews;
    private final int[] mScrollConsumedPair = new int[2];
    private final Priority[] mNestedScrollPriority = {Priority.SELF, Priority.NOT_SET,
            Priority.NOT_SET, Priority.NOT_SET, Priority.NOT_SET};
    private int mNestedScrollAxesTouch;
    private int mNestedScrollAxesNonTouch;
    private int mTouchSlop;
    private int mInitialTouchX;
    private int mInitialTouchY;
    private int mScrollPointerId = INVALID_POINTER;
    private boolean mFixScrollDirection = false;

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
        final ViewConfiguration vc = ViewConfiguration.get(getContext());
        mTouchSlop = vc.getScaledTouchSlop();
    }

    public void onDestroy() {
        if (stickyHeaderHelper != null) {
            stickyHeaderHelper.detachSticky();
        }
    }

    protected void deleteChild(View childView) {
        removeView(childView);
        disableRecycle(childView);
    }

    public ADP getAdapter() {
        return listAdapter;
    }

    @Override
    public void setAdapter(@Nullable Adapter adapter) {
        listAdapter = (ADP) adapter;
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

    public void initRecyclerView(boolean hasStableIds) {
        Adapter adapter = new HippyRecyclerListAdapter<HippyRecyclerView>(this);
        adapter.setHasStableIds(hasStableIds);
        setAdapter(adapter);
        intEventHelper();
        setItemViewCacheSize(DEFAULT_ITEM_VIEW_CACHE_SIZE);
    }

    @Override
    public void setScrollingTouchSlop(int slopConstant) {
        super.setScrollingTouchSlop(slopConstant);
        final ViewConfiguration vc = ViewConfiguration.get(getContext());
        switch (slopConstant) {
            case TOUCH_SLOP_DEFAULT:
                mTouchSlop = vc.getScaledTouchSlop();
                break;

            case TOUCH_SLOP_PAGING:
                mTouchSlop = vc.getScaledPagingTouchSlop();
                break;
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent e) {
        if (!isEnableScroll || mNestedScrollAxesTouch != SCROLL_AXIS_NONE) {
            // We want to prevent the same direction intercepts only, so we can't use
            // `requestDisallowInterceptTouchEvent` for this purpose.
            // `mNestedScrollAxesTouch != SCROLL_AXIS_NONE` means has nested scroll child, no
            // need to intercept
            return false;
        }
        if (!mFixScrollDirection) {
            return super.onInterceptTouchEvent(e);
        }
        final boolean canScrollVertically = getLayoutManager().canScrollVertically();
        final boolean canScrollHorizontally = getLayoutManager().canScrollHorizontally();
        final int action = e.getActionMasked();
        final int actionIndex = e.getActionIndex();
        switch (action) {
            case MotionEvent.ACTION_DOWN:
                mScrollPointerId = e.getPointerId(0);
                mInitialTouchX = (int) (e.getX() + 0.5f);
                mInitialTouchY = (int) (e.getY() + 0.5f);
                return super.onInterceptTouchEvent(e);

            case MotionEvent.ACTION_POINTER_DOWN:
                mScrollPointerId = e.getPointerId(actionIndex);
                mInitialTouchX = (int) (e.getX(actionIndex) + 0.5f);
                mInitialTouchY = (int) (e.getY(actionIndex) + 0.5f);
                return super.onInterceptTouchEvent(e);

            case MotionEvent.ACTION_MOVE: {
                final int index = e.findPointerIndex(mScrollPointerId);
                if (index < 0) {
                    return false;
                }
                final int x = (int) (e.getX(index) + 0.5f);
                final int y = (int) (e.getY(index) + 0.5f);
                if (getScrollState() != SCROLL_STATE_DRAGGING) {
                    final int dx = x - mInitialTouchX;
                    final int dy = y - mInitialTouchY;
                    boolean startScroll = false;
                    if (canScrollHorizontally && Math.abs(dx) > mTouchSlop && (Math.abs(dx) > Math.abs(dy))) {
                        startScroll = true;
                    }
                    if (canScrollVertically && Math.abs(dy) > mTouchSlop && (Math.abs(dy) > Math.abs(dx))) {
                        startScroll = true;
                    }
                    return startScroll && super.onInterceptTouchEvent(e);
                }
                return super.onInterceptTouchEvent(e);
            }

            default:
                return super.onInterceptTouchEvent(e);
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent e) {
        if (!isEnableScroll) {
            return false;
        }
        return super.onTouchEvent(e);
    }

    public void setFixScrollDirection(boolean enable) {
        mFixScrollDirection = enable;
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
            distanceToPosition += vertical ? listAdapter.getItemHeight(i) : listAdapter.getItemWidth(i);
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
        LayoutManager layoutManager = getLayoutManager();
        if (layoutManager instanceof StaggeredGridLayoutManager) {
            listAdapter.notifyItemRangeChanged(renderNodeCount, listAdapter.getRenderNodeCount() - renderNodeCount);
        } else {
            listAdapter.notifyDataSetChanged();
        }
        if (overPullHelper != null) {
            overPullHelper.enableOverPullUp(!listAdapter.hasFooter());
            overPullHelper.enableOverPullDown(!listAdapter.hasHeader());
        }
        renderNodeCount = listAdapter.getRenderNodeCount();
        if (renderNodeCount > 0 && mInitialContentOffset > 0) {
            scrollToInitContentOffset();
        }
        //notifyDataSetChanged 本身是可以触发requestLayout的，但是Hippy框架下 HippyRootView 已经把
        //onLayout方法重载写成空方法，requestLayout不会回调孩子节点的onLayout，这里需要自己发起dispatchLayout
        dispatchLayout();
    }

    /**
     * Vertical offset of the content, might be different than the
     * {@link #computeVerticalScrollOffset()} if pullHeader exist.
     */
    public int getContentOffsetY() {
        if (HippyListUtils.isVerticalLayout(this)) {
            int offset = computeVerticalScrollOffset();
            if (listAdapter.headerRefreshHelper != null) {
                offset -= listAdapter.headerRefreshHelper.getVisibleSize();
            }
            return offset;
        }
        return 0;
    }

    /**
     * Horizontal offset of the content, might be different than the
     * {@link #computeHorizontalScrollOffset()} if pullHeader exist.
     */
    public int getContentOffsetX() {
        if (HippyListUtils.isHorizontalLayout(this)) {
            int offset = computeHorizontalScrollOffset();
            if (listAdapter.headerRefreshHelper != null) {
                offset -= listAdapter.headerRefreshHelper.getVisibleSize();
            }
            return offset;
        }
        return 0;
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
     * 获取position 前面的内容高度，不包含position自身的高度
     * 对于竖向排版，取ItemHeight求和，对于横向排版，取ItemWidth求和
     */
    public int getTotalHeightBefore(int position) {
        int totalHeightBefore = 0;
        boolean vertical = HippyListUtils.isVerticalLayout(this);
        for (int i = 0; i < position; i++) {
            totalHeightBefore += vertical ? listAdapter.getItemHeight(i) : listAdapter.getItemWidth(i);
        }
        return totalHeightBefore;
    }

    /**
     * 获取renderNodePosition前面的内容高度，不包含renderNodePosition自身的高度
     * 对于竖向排版，取RenderNodeHeight求和，对于横向排版，取RenderNodeWidth求和
     */
    public int getRenderNodeHeightBefore(int renderNodePosition) {
        int renderNodeTotalHeight = 0;
        boolean vertical = HippyListUtils.isVerticalLayout(this);
        for (int i = 0; i < renderNodePosition; i++) {
            renderNodeTotalHeight += vertical ? listAdapter.getRenderNodeHeight(i) : listAdapter.getRenderNodeWidth(i);
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
        if (listAdapter.headerRefreshHelper != null) {
            // pullHeader exist and occupy position #0, skip it
            return position + 1;
        }
        return position;
    }

    public void scrollToIndex(int xIndex, int yIndex, boolean animated, int duration) {
        boolean isHorizontal = HippyListUtils.isHorizontalLayout(this);
        int positionInAdapter = getNodePositionInAdapter(isHorizontal ? xIndex : yIndex);
        if (animated) {
            int deltaX = 0;
            int deltaY = 0;
            if (isHorizontal) {
                deltaX = getTotalHeightBefore(positionInAdapter) - computeHorizontalScrollOffset();
            } else {
                deltaY = getTotalHeightBefore(positionInAdapter) - computeVerticalScrollOffset();
            }
            doSmoothScrollBy(deltaX, deltaY, duration);
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
    public void scrollToContentOffset(double xOffset, double yOffset, boolean animated, int duration) {
        if (!canScrollToContentOffset()) {
            return;
        }
        int xOffsetInPixel = (int) PixelUtil.dp2px(xOffset);
        int deltaX = xOffsetInPixel - getContentOffsetX();
        int yOffsetInPixel = (int) PixelUtil.dp2px(yOffset);
        int deltaY = yOffsetInPixel - getContentOffsetY();
        //增加异常保护
        if (animated) {
            doSmoothScrollBy(deltaX, deltaY, duration);
        } else {
            scrollBy(deltaX, deltaY);
        }
    }

    /**
     * renderNodeCount是在setListData的时候更新，必须调用setListData后，确保renderNodeCount和
     * getAdapter().getRenderNodeCount()的值相等，才能进行滚动，否则scrollBy会出现IndexOutOfBoundsException
     * 的问题，主要原因就是RecyclerView的内部状态没有通过setListData进行刷新，还是老的数据，
     * 这个比现的场景来自于QQ浏览器的搜索tab的切换。
     * RenderManager的batch方法应该把dispatchUIFunction放到batchComplete后面，但是这样改动太大
     *
     * @return
     */
    protected boolean canScrollToContentOffset() {
        return renderNodeCount == getAdapter().getRenderNodeCount();
    }

    protected void doSmoothScrollBy(int dx, int dy, int duration) {
        if (dx == 0 && dy == 0) {
            return;
        }
        if (duration != 0) {
            if (!didStructureChange()) {
                smoothScrollBy(dx, dy, duration);
                postDispatchLayout();
            }
        } else {
            smoothScrollBy(dx, dy);
            postDispatchLayout();
        }
    }

    protected void postDispatchLayout() {
        post(new Runnable() {
            @Override
            public void run() {
                dispatchLayout();
            }
        });
    }

    public void scrollToTop() {
        if (HippyListUtils.isHorizontalLayout(this)) {
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

    public void onLayoutOrientationChanged() {
        if (stickyHeaderHelper != null) {
            LayoutManager layoutManager = getLayoutManager();
            if (layoutManager instanceof LinearLayoutManager) {
                stickyHeaderHelper.setOrientation(((LinearLayoutManager) layoutManager).getOrientation());
            }
        }
    }

    /**
     * 同步删除RenderNode对应注册的View，deleteChild是递归删除RenderNode创建的所有的view
     */
    @Override
    public void onViewHolderAbandoned(HippyRecyclerViewHolder viewHolder) {
        if (viewHolder.bindNode != null) {
            viewHolder.bindNode.onViewHolderAbandoned();
            viewHolder.bindNode.setRecycleItemTypeChangeListener(null);
        }
    }

    /**
     * 当header被摘下来，需要对header进行还原或者回收对处理
     * 遍历所有都ViewHolder，看看有没有收纳这个headerView都ViewHolder
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
            if (isTheSameRenderNode((HippyRecyclerViewHolder) aboundHeader, (HippyRecyclerViewHolder) viewHolder)) {
                findHostViewHolder = true;
                fillContentView(currentHeaderView, viewHolder);
                break;
            }
        }
        //当header无处安放，抛弃view都同时，需要同步给Hippy进行View都删除，不然后续无法创建对应都View
        if (!findHostViewHolder) {
            onViewHolderAbandoned((HippyRecyclerViewHolder) aboundHeader);
        }
    }

    private boolean fillContentView(View currentHeaderView, ViewHolder viewHolder) {
        if (viewHolder != null && viewHolder.itemView instanceof ViewGroup) {
            ViewGroup itemView = (ViewGroup) viewHolder.itemView;
            if (itemView.getChildCount() <= 0) {
                itemView.addView(currentHeaderView, generateStickyLayoutParams());
            }
        }
        return false;
    }

    private boolean isTheSameRenderNode(HippyRecyclerViewHolder aboundHeader, HippyRecyclerViewHolder viewHolder) {
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
    public View focusSearch(View focused, int direction) {
        View result = super.focusSearch(focused, direction);
        // {@link RecyclerView#focusSearch} may return not focusable view,
        // cause IllegalStateException, so we verify again.
        if (result == null || !verifyFocusable(result, direction)) {
            return null;
        }
        return result;
    }

    private boolean verifyFocusable(@NonNull View view, int direction) {
        boolean inTouchMode = isInTouchMode();
        // first check whether self is able to take focus
        if (inTouchMode ? view.isFocusableInTouchMode() : view.isFocusable()) {
            return true;
        }
        // then check whether has focusable descendants
        if (!(view instanceof ViewGroup)) {
            return false;
        }
        if (mFocusableViews == null) {
            mFocusableViews = new ArrayList<>();
        }
        view.addFocusables(mFocusableViews, direction, inTouchMode ? FOCUSABLES_TOUCH_MODE : FOCUSABLES_ALL);
        boolean result = !mFocusableViews.isEmpty();
        // clear up the temp array
        mFocusableViews.clear();
        return result;
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "{renderNodeCount:" + renderNodeCount + ",state:" + getStateInfo()
                + "}";
    }

    /*package*/ ViewGroup getStickyContainer(Context context, View renderView) {
        FrameLayout container = new FrameLayout(context);
        if (renderView != null) {
            container.addView(renderView, generateStickyLayoutParams());
        }
        return container;
    }

    /*package*/ ViewGroup.LayoutParams generateStickyLayoutParams() {
        return new FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT);
    }

    @Override
    public boolean dispatchNestedPreScroll(int dx, int dy, int[] consumed, int[] offsetInWindow) {
        mScrollConsumedPair[0] = 0;
        mScrollConsumedPair[1] = 0;
        boolean result = super.dispatchNestedPreScroll(dx, dy, mScrollConsumedPair, offsetInWindow);
        if (result) {
            dx -= mScrollConsumedPair[0];
            dy -= mScrollConsumedPair[1];
            if (consumed != null) {
                consumed[0] += mScrollConsumedPair[0];
                consumed[1] += mScrollConsumedPair[1];
            }
        }
        return handlePullRefresh(dx, dy, consumed) || result;
    }

    @Override
    public boolean dispatchNestedPreScroll(int dx, int dy, int[] consumed, int[] offsetInWindow,
        int type) {
        mScrollConsumedPair[0] = 0;
        mScrollConsumedPair[1] = 0;
        boolean result = super.dispatchNestedPreScroll(dx, dy, mScrollConsumedPair, offsetInWindow, type);
        if (result) {
            dx -= mScrollConsumedPair[0];
            dy -= mScrollConsumedPair[1];
            if (consumed != null) {
                consumed[0] += mScrollConsumedPair[0];
                consumed[1] += mScrollConsumedPair[1];
            }
        }
        return type == ViewCompat.TYPE_TOUCH && handlePullRefresh(dx, dy, consumed) || result;
    }

    @Override
    public void stopNestedScroll() {
        super.stopNestedScroll();
        endPullRefresh();
    }

    @Override
    public void stopNestedScroll(int type) {
        super.stopNestedScroll(type);
        if (type == ViewCompat.TYPE_TOUCH) {
            endPullRefresh();
        }
    }

    protected boolean handlePullRefresh(int dx, int dy, @Nullable int[] consumed) {
        if (listAdapter == null ||
            (listAdapter.headerRefreshHelper == null && listAdapter.footerRefreshHelper == null)) {
            return false;
        }
        boolean isHorizontal = HippyListUtils.isHorizontalLayout(this);
        int diff = isHorizontal ? dx : dy;
        if (diff == 0) {
            return false;
        }
        if (listAdapter.headerRefreshHelper != null) {
            int myConsumed = listAdapter.headerRefreshHelper.handleDrag(diff);
            if (myConsumed != 0) {
                if (consumed != null) {
                    consumed[isHorizontal ? 0 : 1] += myConsumed;
                }
                return true;
            }
        }
        if (listAdapter.footerRefreshHelper != null) {
            int myConsumed = listAdapter.footerRefreshHelper.handleDrag(diff);
            if (myConsumed != 0) {
                if (consumed != null) {
                    consumed[isHorizontal ? 0 : 1] += myConsumed;
                }
                return true;
            }
        }
        return false;
    }

    protected void endPullRefresh() {
        if (listAdapter == null) {
            return;
        }
        if (listAdapter.headerRefreshHelper != null) {
            listAdapter.headerRefreshHelper.endDrag();
        }
        if (listAdapter.footerRefreshHelper != null) {
            listAdapter.footerRefreshHelper.endDrag();
        }
    }

    protected boolean isPullRefreshShowing() {
        if (listAdapter == null) {
            return false;
        }
        return listAdapter.headerRefreshHelper != null
            && listAdapter.headerRefreshHelper.getVisibleSize() > 0
            || listAdapter.footerRefreshHelper != null
            && listAdapter.footerRefreshHelper.getVisibleSize() > 0;
    }

    @Override
    public void setNestedScrollPriority(int direction, Priority priority) {
        mNestedScrollPriority[direction] = priority;
    }

    @Override
    public Priority getNestedScrollPriority(int direction) {
        Priority result = mNestedScrollPriority[direction];
        if (result == Priority.NOT_SET) {
            result = mNestedScrollPriority[DIRECTION_ALL];
        }
        return result;
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
            int dxUnconsumed, int dyUnconsumed) {
        onNestedScroll(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed,
                ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed,
            int dxUnconsumed, int dyUnconsumed, int type) {
        // Step 1: process pull refresh
        if (type == ViewCompat.TYPE_TOUCH) {
            if (HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF
                    || HippyNestedScrollHelper.priorityOfY(target, dyUnconsumed) == Priority.SELF) {
                mScrollConsumedPair[0] = 0;
                mScrollConsumedPair[1] = 0;
                if (handlePullRefresh(dxUnconsumed, dyUnconsumed, mScrollConsumedPair)) {
                    dxConsumed += mScrollConsumedPair[0];
                    dyConsumed += mScrollConsumedPair[1];
                    dxUnconsumed -= mScrollConsumedPair[0];
                    dyUnconsumed -= mScrollConsumedPair[1];
                }
            }
        } else if (isPullRefreshShowing()) {
            // don't respond non-touch scroll, prevent header/footer scroll to wrong position
            return;
        }
        // Step 2: process the current View
        int myDx = HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF
                ? computeHorizontallyScrollDistance(dxUnconsumed) : 0;
        int myDy = HippyNestedScrollHelper.priorityOfY(target, dyUnconsumed) == Priority.SELF
                ? computeVerticallyScrollDistance(dyUnconsumed) : 0;
        if (myDx != 0 || myDy != 0) {
            scrollBy(myDx, myDy);
            dxConsumed += myDx;
            dyConsumed += myDy;
            dxUnconsumed -= myDx;
            dyUnconsumed -= myDy;
        }
        // Step 3: dispatch to the parent for processing
        int parentDx = HippyNestedScrollHelper.priorityOfX(this, dxUnconsumed) == Priority.NONE ? 0
                : dxUnconsumed;
        int parentDy = HippyNestedScrollHelper.priorityOfY(this, dyUnconsumed) == Priority.NONE ? 0
                : dyUnconsumed;
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
        // Step 1: Dispatch to the parent for processing
        int parentDx = HippyNestedScrollHelper.priorityOfX(this, dx) == Priority.NONE ? 0 : dx;
        int parentDy = HippyNestedScrollHelper.priorityOfY(this, dy) == Priority.NONE ? 0 : dy;
        if (parentDx != 0 || parentDy != 0) {
            mScrollConsumedPair[0] = 0;
            mScrollConsumedPair[1] = 0;
            // must use super to prevent duplicate handlePullRefresh
            super.dispatchNestedPreScroll(parentDx, parentDy, mScrollConsumedPair, null, type);
            consumed[0] += mScrollConsumedPair[0];
            consumed[1] += mScrollConsumedPair[1];
            dx -= mScrollConsumedPair[0];
            dy -= mScrollConsumedPair[1];
        }
        // Step 2: process pull refresh
        if (HippyNestedScrollHelper.priorityOfX(target, dx) == Priority.PARENT
                || HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT) {
            if (type == ViewCompat.TYPE_TOUCH) {
                mScrollConsumedPair[0] = 0;
                mScrollConsumedPair[1] = 0;
                if (handlePullRefresh(dx, dy, mScrollConsumedPair)) {
                    consumed[0] += mScrollConsumedPair[0];
                    consumed[1] += mScrollConsumedPair[1];
                    dx -= mScrollConsumedPair[0];
                    dy -= mScrollConsumedPair[1];
                }
            } else if (isPullRefreshShowing()) {
                // don't respond non-touch scroll, prevent header/footer scroll to wrong position
                consumed[0] += dx;
                consumed[1] += dy;
                return;
            }
        }
        // Step 3: process the current View
        int myDx = HippyNestedScrollHelper.priorityOfX(target, dx) == Priority.PARENT
                ? computeHorizontallyScrollDistance(dx) : 0;
        int myDy = HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT
                ? computeVerticallyScrollDistance(dy) : 0;
        if (myDx != 0 || myDy != 0) {
            consumed[0] += myDx;
            consumed[1] += myDy;
            scrollBy(myDx, myDy);
        }
    }

    @Override
    public int getNestedScrollAxes() {
        return mNestedScrollAxesTouch | mNestedScrollAxesNonTouch;
    }
}
