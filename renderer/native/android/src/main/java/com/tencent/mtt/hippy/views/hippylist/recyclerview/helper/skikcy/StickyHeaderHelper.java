/* Tencent is pleased to support the open source community by making easy-recyclerview-helper available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy;

import static androidx.recyclerview.widget.RecyclerView.HORIZONTAL;
import static androidx.recyclerview.widget.RecyclerView.VERTICAL;

import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout.LayoutParams;
import androidx.recyclerview.widget.RecyclerViewBase;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.RecyclerView.OnScrollListener;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;

import com.tencent.mtt.hippy.utils.LogUtils;

/**
 * Created on 2020/12/29. Description 一个RecyclerView的StickyHeader控制器，
 * 通过recyclerView的onScroll事件，1、从列表中选择吸顶的View，2、挂载到顶部，3、设置吸顶View的OffSet
 * 吸顶的headerView是从recyclerView里面的Item的子View抠出来挂载的，需要吸顶属性的ItemView包装一层ViewGroup
 */
public class StickyHeaderHelper extends OnScrollListener implements
        ViewTreeObserver.OnGlobalLayoutListener {

    private static final String TAG = "StickyHeaderHelper";
    private static final int INVALID_POSITION = -1;
    private final com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderAttachListener headerAttachListener;
    private RecyclerViewBase recyclerView;
    private com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IStickyItemsProvider stickyItemsProvider;
    private StickyViewFactory stickyViewFactory;
    private ViewHolder headerOrgViewHolder;
    private boolean orgViewHolderCanRecyclable = false;
    private View currentHeaderView;
    private int orientation;
    private int currentStickPos = -1;
    private com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IHeaderHost headerHost;
    private com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.StickViewListener stickViewListener;
    private boolean isUpdateStickyHolderWhenLayout;

    public StickyHeaderHelper(final RecyclerViewBase recyclerView,
            IStickyItemsProvider stickyItemsProvider,
            IHeaderAttachListener headerAttachListener, IHeaderHost headerHost) {
        this.recyclerView = recyclerView;
        this.headerAttachListener = headerAttachListener;
        this.stickyItemsProvider = stickyItemsProvider;
        stickyViewFactory = new StickyViewFactory(recyclerView);
        this.headerHost = headerHost;
        orientation = recyclerView.getLayoutManager().canScrollVertically() ? VERTICAL : HORIZONTAL;
    }

    public void setOrientation(int orientation) {
        this.orientation = orientation;
    }

    /**
     * 1、寻找stickyHeader 2、挂载stickyHeader 3、设置stickyHeader的偏移
     */
    @Override
    public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
        int newStickyPosition = getStickyItemPosition();
        if (currentStickPos != newStickyPosition) {
            try {
                detachSticky();
                attachSticky(newStickyPosition);
            } catch (Exception e) {
                LogUtils.e(TAG, "sticky handle error: " + e.getMessage());
            }
        }
        offsetSticky();
    }

    public void setStickViewListener(StickViewListener stickViewListener) {
        this.stickViewListener = stickViewListener;
    }

    public void setUpdateStickyViewWhenLayout(boolean bindStickyHolderWhenLayout) {
        isUpdateStickyHolderWhenLayout = bindStickyHolderWhenLayout;
    }

    /**
     * 如果当前stickHolder和新的stickyHolder 不一样，那么把当前的stickyHolder删除掉，并还原HeaderView的Translation
     */
    public void detachSticky() {
        if (headerOrgViewHolder != null && this.currentHeaderView != null) {
            removeViewFromParent(this.currentHeaderView);
            currentHeaderView.setTranslationY(0);
            currentHeaderView.setTranslationX(0);
            returnHeaderBackToList();
            headerHost.removeOnLayoutListener(this);
            notifyStickDetached();
        }
        currentStickPos = -1;
        headerOrgViewHolder = null;
    }

    private void notifyStickDetached() {
        if (stickViewListener != null) {
            stickViewListener.onStickDetached(currentStickPos);
        }
    }

    /**
     * 还原Header到List中去 1、ViewHolder正好是之前的ViewHolder，直接将headerView返回给headerOrgContainer
     * 2、position相同，但是ViewHolder已经是不同了，出现在header的Item滑动到屏幕外，又滑回来，重新创建了一个ViewHolder
     * 3、对于被顶出去的headView，是无法还原到list中的，需要把headView进行回收处理,如果不回收，Hippy场景无法重新创建View
     */
    private void returnHeaderBackToList() {
        headerOrgViewHolder.setIsRecyclable(orgViewHolderCanRecyclable);
        if (headerAttachListener != null) {
            headerAttachListener.onHeaderDetached(headerOrgViewHolder, currentHeaderView);
        } else {
            ViewHolder viewHolderToReturn = recyclerView
                    .findViewHolderForAdapterPosition(headerOrgViewHolder.getAdapterPosition());
            if (viewHolderToReturn != null && viewHolderToReturn.itemView instanceof ViewGroup) {
                ViewGroup itemView = (ViewGroup) viewHolderToReturn.itemView;
                //已经有孩子了，就不要加了，这个可能是新创建的ViewHolder已经有了内容
                if (itemView.getChildCount() <= 0) {
                    itemView.addView(this.currentHeaderView);
                }
            }
        }
    }

    /**
     * 将stickyItemPosition对应的View挂载到RecyclerView的父亲上面
     */
    private void attachSticky(int newStickyPosition) {
        if (newStickyPosition != INVALID_POSITION) {
            headerOrgViewHolder = stickyViewFactory.getHeaderForPosition(newStickyPosition);
            currentStickPos = newStickyPosition;
            Log.d("returnHeader", "attachSticky:" + headerOrgViewHolder);
            currentHeaderView = ((ViewGroup) headerOrgViewHolder.itemView).getChildAt(0);
            removeViewFromParent(currentHeaderView);
            //内容被取走了，不能被回收，避免view滑出屏幕，回收再利用，此时已经不能再被别人用了
            orgViewHolderCanRecyclable = headerOrgViewHolder.isRecyclable();
            headerOrgViewHolder.setIsRecyclable(false);
            currentHeaderView.setVisibility(View.INVISIBLE);
            LayoutParams layoutParams = new LayoutParams(
                    LayoutParams.MATCH_PARENT, 0);
            ViewGroup.LayoutParams lp = headerOrgViewHolder.itemView.getLayoutParams();
            layoutParams.height = lp != null ? lp.height : LayoutParams.WRAP_CONTENT;
            headerHost.addOnLayoutListener(this);
            headerHost.attachHeader(currentHeaderView, layoutParams);
            notifyStickAttached(newStickyPosition);
        }
    }

    private void notifyStickAttached(int stickyPosition) {
        if (stickViewListener != null) {
            stickViewListener.onStickAttached(stickyPosition);
        }
    }

    /**
     * 设置吸顶的View的偏移 在下一个吸顶view和当前吸顶的view交汇的时候，需要把当前吸顶view往上面移动，慢慢会把当前的吸顶view顶出屏幕
     */
    private void offsetSticky() {
        if (headerOrgViewHolder != null) {
            float offset = getOffset(findNextSticky(currentStickPos));
            if (orientation == VERTICAL) {
                currentHeaderView.setTranslationY(offset);
            } else {
                currentHeaderView.setTranslationX(offset);
            }
        }
    }

    /**
     * 找到屏幕中，下一个即将吸顶的view,主要用于计算当前吸顶的HeaderView的Offset， 下一个即将吸顶的View会慢慢把当前正在吸顶的HeaderView慢慢顶出屏幕外
     */
    private View findNextSticky(int currentStickyPos) {
        for (int i = 0; i < recyclerView.getChildCount(); i++) {
            View nextStickyView = recyclerView.getChildAt(i);
            int nextStickyPos = recyclerView.getChildLayoutPosition(nextStickyView);
            if (nextStickyPos > currentStickyPos && stickyItemsProvider
                    .isStickyPosition(nextStickyPos)) {
                return nextStickyView;
            }
        }
        return null;
    }

    /**
     * 当nextStickyView和当前stickyView重叠的时候，是应该把当前的view移出屏幕外 支持水平排版和垂直排版
     */
    private float getOffset(View nextStickyView) {
        float offset = 0;
        View stickView = this.currentHeaderView;
        if (stickView != null && nextStickyView != null) {
            if (orientation == VERTICAL) {
                if (nextStickyView.getY() < stickView.getHeight()) {
                    offset = nextStickyView.getY() - stickView.getHeight();
                }
            } else {
                if (stickView.isShown()) {
                    offset = -stickView.getWidth();
                } else if (nextStickyView.getX() < stickView.getWidth()) {
                    offset = stickView.getX() - stickView.getWidth();
                }
            }
        }
        return offset;
    }

    /**
     * 高度确定后，设置HeaderView为可见状态，并且重新刷新offset的正确位置，解决下拉header上屏的闪烁问题
     */
    @Override
    public void onGlobalLayout() {
        if (currentHeaderView != null) {
            currentHeaderView.setVisibility(View.VISIBLE);
            offsetSticky();
            if (isUpdateStickyHolderWhenLayout) {
                updateStickHolder();
            }
        }
    }

    /**
     * 找到距离顶部最近的一个stickyItem的位置
     *
     * @return INVALID_POSITION，没有找到stickyItem
     */
    public int getStickyItemPosition() {
        if (recyclerView.getChildCount() <= 0) {
            return INVALID_POSITION;
        }
        int positionToSticky = INVALID_POSITION;
        int startPosition = recyclerView.getFirstChildPosition();
        View firstView = recyclerView.getChildAt(0);
        float position = (orientation == VERTICAL) ? firstView.getY() : firstView.getX();
        if (position >= 0) {
            startPosition--;//当前view已经完全露出，需要往从前面一个开始寻找
        }
        for (int i = startPosition; i >= 0; i--) {
            if (stickyItemsProvider.isStickyPosition(i)) {
                positionToSticky = i;
                break;
            }
        }
        if (positionToSticky != INVALID_POSITION) {
            if (positionToSticky != recyclerView.getFirstChildPosition()) {
                //positionToSticky已经被滑出屏幕，此时positionToSticky可以直接返回
                return positionToSticky;
            } else {
                //stickyItem和第一个孩子位置一样，如果完全和吸顶位置重合，不需要进行吸顶
                positionToSticky =
                        !headerAwayFromEdge(firstView) ? INVALID_POSITION : positionToSticky;
            }
        }
        return positionToSticky;
    }

    /**
     * headerToCopy == null表示，headerToCopy 已经完全移除屏幕外 headerToCopy != null ,getY()<0 部分移动屏幕外
     *
     * @param headerToCopy 即将被选中吸顶的view
     */
    private boolean headerAwayFromEdge(View headerToCopy) {
        return headerToCopy != null && (orientation == VERTICAL ? headerToCopy.getY() < 0
                : headerToCopy.getX() < 0);
    }

    private void removeViewFromParent(View view) {
        if (view.getParent() instanceof ViewGroup) {
            ((ViewGroup) view.getParent()).removeView(view);
        }
    }

    private void updateStickHolder() {
        if (headerOrgViewHolder != null) {
            recyclerView.getAdapter().onBindViewHolder(headerOrgViewHolder, currentStickPos);
        }
    }
}
