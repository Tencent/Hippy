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

package com.tencent.mtt.hippy.views.waterfalllist;

import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.DiffUtils;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.PullFooterRenderNode;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.list.HippyListView;
import com.tencent.mtt.hippy.views.refresh.FooterUtil;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.IFooterContainer;
import com.tencent.mtt.supportui.views.recyclerview.ContentHolder;
import com.tencent.mtt.supportui.views.recyclerview.IRecyclerViewFooter;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerAdapter;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;
import com.tencent.mtt.supportui.views.recyclerview.Scroller;
import java.util.ArrayList;


public class HippyWaterfallView extends HippyListView implements HippyViewBase, IFooterContainer {

  static final String TAG = "HippyWaterfallView";

  HippyWaterfallAdapter mAdapter;
  private HippyEngineContext mHippyContext;
  private NativeGestureDispatcher mGestureDispatcher;
  private Runnable mDispatchLayout = null;

  public static final int DEFAULT_REFRESH_TYPE = 1;
  public static final int HIPPY_SKIN_CHANGE = 1001;

  boolean mEnableFooter;
  boolean mEnableRefresh;
  HippyArray mRefreshColors;
  private OnInitialListReadyEvent mOnInitialListReadyEvent;

  private boolean mHasRemovePreDraw = false;
  private ViewTreeObserver.OnPreDrawListener mPreDrawListener = null;
  private ViewTreeObserver mViewTreeObserver = null;
  private WaterfallEndChecker mEndChecker = new WaterfallEndChecker();

  // for auto test >>>
  private boolean mHasLoadMore = false;
  private boolean mHasScrollToIndex = false;
  private boolean mHasScrollToContentOffset = false;
  private boolean mHasStartRefresh = false;
  private boolean mHasCompeleteRefresh = false;
  // for auto test <<<

  public HippyWaterfallView(Context context) {
    super(context);
    mHippyContext = ((HippyInstanceContext) context).getEngineContext();
    this.setLayoutManager(new HippyWaterfallLayoutManager(context));
    mAdapter = (HippyWaterfallAdapter) getAdapter();
    setRecycledViewPool(new RNWFRecyclerPool());

    mEnableFooter = true;
    mEnableRefresh = false;
    mRefreshColors = null;

    addOnListScrollListener(mAdapter.getOnListScrollListener());
    setClipToPadding(false);
  }

  @Override
  protected HippyWaterfallAdapter createAdapter(RecyclerView hippyRecyclerView,
    HippyEngineContext hippyEngineContext) {
    return new HippyWaterfallAdapter(this);
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
    this.mGestureDispatcher = dispatcher;
  }

  @Override
  protected HippyMap generateScrollEvent() {
    HippyMap event = super.generateScrollEvent();

    event.pushDouble("startEdgePos", PixelUtil.px2dp(getOffsetY()));
    event.pushDouble("endEdgePos", PixelUtil.px2dp(getOffsetY() + getHeight()));
    event.pushInt("firstVisibleRowIndex", getFirstVisibleItemPos());
    event.pushInt("lastVisibleRowIndex", getFirstVisibleItemPos() + getChildCountInItem());

    HippyArray rowFrames = new HippyArray();
    for (int i = 0; i < getChildCountInItem(); ++i) {
      View child = getChildAt(i);
      if (child == null) {
        continue;
      }
      HippyMap row = new HippyMap();
      row.pushDouble("x", PixelUtil.px2dp(child.getX()));
      row.pushDouble("y", PixelUtil.px2dp(child.getY()));
      row.pushDouble("width", PixelUtil.px2dp(child.getWidth()));
      row.pushDouble("height", PixelUtil.px2dp(child.getHeight()));
      rowFrames.pushMap(row);
    }
    event.pushArray("visibleRowFrames", rowFrames);

    return event;
  }

  @Override
  public void setListData() {
    if (getAdapter() == null) {
      setAdapter(mAdapter);
    }
    setFooterState(HippyListView.REFRESH_STATE_IDLE); // 每次刷新数据后重置footer状态

    mAdapter.notifyDataSetChanged();

    if (mDispatchLayout == null) {
      mDispatchLayout = new Runnable() {
        @Override
        public void run() {
          dispatchLayout();
        }
      };
    }
    removeCallbacks(mDispatchLayout);
    post(mDispatchLayout);
  }

  public void startLoadMore() {
    mHasLoadMore = true;
    mAdapter.setLoadingStatus(IRecyclerViewFooter.LOADING_STATUS_LOADING);
  }

  @Override
  public void handleInTraversal(int traversalPurpose, int position, View contentView) {
    if (traversalPurpose == HIPPY_SKIN_CHANGE) {
      traversalChildViewForSkinChange(contentView);
    }
  }

  private void traversalChildViewForSkinChange(View view) {
    if (view instanceof ViewGroup) {
      int childCount = ((ViewGroup) view).getChildCount();
      for (int i = 0; i < childCount; i++) {
        traversalChildViewForSkinChange(((ViewGroup) view).getChildAt(i));
      }
    }
  }

  public void checkExposureForReport(int oldState, int newState) {
    if (getAdapter() != null) {
      mAdapter.checkExposureForReport(oldState, newState);
    }
  }

  public void setCustomRefreshColor(int ballColor, int bgColor, int tipsBgColor) {
  }

  public void scrollToIndex(int xIndex, int yIndex, boolean animated) {
    mHasScrollToIndex = true;

    if (animated) {
      scrollToIndex(xIndex, yIndex, true, 0);
    } else {
      scrollToPosition(yIndex, 0);
      post(this::dispatchLayout);
    }
  }

  public void scrollToContentOffset(double xOffset, double yOffset, boolean animated) {
    mHasScrollToContentOffset = true;

    if (animated) {
      smoothScrollBy(0, (int) yOffset);
    } else {
      scrollToPosition(0, (int) -PixelUtil.dp2px(yOffset));
      post(this::dispatchLayout);
    }
  }

  public void setScrollbarEnabled(boolean scrollbarEnabled) {
  }

  public void setFastScrollerEnabled(boolean fastScrollerEnabled) {
  }

  public void setLiftEnabled(boolean liftEnabled) {
  }

  public void setPlaceHolderDrawableEnabled(boolean placeHolderDrawableEnabled) {
  }

  public void setRefreshEnabled(boolean refreshEnabled) {
  }

  public void setEnableScrollForReport(boolean enableScrollForReport) {
    mAdapter.setEnableScrollForReport(enableScrollForReport);
  }

  public void setEnableExposureReport(boolean enableExposureReport) {
    mAdapter.setEnableExposureReport(enableExposureReport);
  }

  public void setRefreshColors(HippyArray refreshColors) {
    mRefreshColors = refreshColors;
  }

  protected void setLoadingStatus(int loadingStatus, String text) {
    mAdapter.setLoadingStatus(loadingStatus, text);
  }

  @Override
  public void checkNotifyFooterAppearWithFewChild(int endOffset) {
  }

  @Override
  public void onScrollStateChanged(int oldState, int newState) {
    super.onScrollStateChanged(oldState, newState);
    if (getAdapter() != null) {
      mAdapter.checkScrollForReport();
      mAdapter.checkExposureForReport(oldState, newState);
    }
  }

  @Override
  public void onScrolled(int x, int y) {
    super.onScrolled(x, y);
    mEndChecker.onScroll(this, y);
  }

  public void startRefresh(int type) {
  }

  public void setRefreshPromptInfo(String descriptionText, int descriptionTextColor,
    int descriptionTextFontSize, String imgUrl, int imgWidth, int imgHeight) {
  }

  public void startRefreshWithType(boolean inInit) {
  }

  public void startRefreshWithOnlyAnimation(boolean inInit) {
  }

  protected boolean enableOnSrollReport() {
    return true;
  }

  protected ExposureForReport getExposureForReport(int oldState, int newState) {
    return mAdapter.getExposureForReportInner(oldState, newState);
  }

  @Override
  public void scrollToTopAtOnce() {
    super.scrollToTopAtOnce();
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();

    if (!mHasRemovePreDraw) {
      mViewTreeObserver = getViewTreeObserver();
      if (mPreDrawListener == null) {
        mPreDrawListener = new ViewTreeObserver.OnPreDrawListener() {
          @Override
          public boolean onPreDraw() {
            if (mAdapter.getItemCount() > 0
              && HippyWaterfallView.this.getChildCount() > 0) {
              mViewTreeObserver.removeOnPreDrawListener(this);
              mHasRemovePreDraw = true;
              post(new Runnable() {
                @Override
                public void run() {
                  getOnInitialListReadyEvent()
                    .send(HippyWaterfallView.this, null);
                }
              });

            }
            return true;
          }
        };
      }
      mViewTreeObserver.removeOnPreDrawListener(mPreDrawListener);
      mViewTreeObserver.addOnPreDrawListener(mPreDrawListener);

    }
  }

  @Override
  protected void onDetachedFromWindow() {
    stopScroll();
    if (mPreDrawListener != null && mViewTreeObserver != null) {
      mViewTreeObserver.removeOnPreDrawListener(mPreDrawListener);
    }
    super.onDetachedFromWindow();
  }

  @Override
  protected void checkRefreshHeadOnFlingRun() {
  }

  @Override
  public boolean isRefreshing() {
    return false;
  }

  @Override
  protected boolean changeUpOverScrollEnableOnComputeDxDy(int dx, int dy,
    boolean careSpringBackMaxDistance, Scroller scroller, boolean isTouch,
    boolean currentUpOverScrollEnabled) {
    return currentUpOverScrollEnabled;
  }

  @Override
  protected boolean checkShouldStopScroll() {
    return false;
  }

  @Override
  protected void invalidateRefreshHeader() {
  }

  @Override
  protected boolean shouldStopReleaseGlows(boolean canGoRefresh, boolean fromTouch) {
    return false;
  }

  @Override
  protected boolean shouldStopOnInterceptTouchEvent(MotionEvent e, int totalHeight,
    boolean upOverScrollEnabled) {
    return false;
  }

  @Override
  protected boolean shouldStopOnTouchEvent(MotionEvent e, int totalHeight,
    boolean upOverScrollEnabled) {
    return false;
  }

  protected void setPreloadItemNumber(int count) {
    mAdapter.setPreloadItemNum(count);
  }

  private int mFooterState = HippyListView.REFRESH_STATE_IDLE;

  @Override
  public int getFooterState() {
    return mFooterState;
  }

  @Override
  public void setFooterState(int state) {
    mFooterState = state;
  }

  @Override
  public void onFooterRefreshFinish() {
    setFooterState(HippyListView.REFRESH_STATE_LOADING);
  }

  public class HippyWaterfallAdapter extends RecyclerAdapter implements
    HippyWaterfallItemRenderNode.IRecycleItemTypeChange {

    private HippyWaterfallEvent mOnFooterAppearedEvent;
    private HippyWaterfallEvent mOnRefreshEvent;
    private HippyWaterfallEvent mOnScrollForReportEvent;
    private int mPreloadItemNum;
    private boolean mShouldUpdatePreloadDistance;
    private int mPreloadDistanceWithItemNumber;
    private boolean mOnPreloadCalled;
    private boolean mEnableScrollForReport;
    private boolean mEnableExposureReport;
    private HippyMap mScrollReportResultMap;
    private HippyMap mExposureReportResultMap;
    private OnListScrollListener mOnListScrollListener;

    private boolean mHasOnScrollForReport = false;
    private boolean mHasExposureReport = false;
    private boolean mHasOnRefresh = false;
    private boolean mHasOnFooterAppeared = false;
    private boolean mHasPreload = false;
    private boolean mHasSetLoadingStatus = false;

    public HippyWaterfallAdapter(RecyclerView recyclerView) {
      super(recyclerView);
      setLoadingStatus(IRecyclerViewFooter.LOADING_STATUS_LOADING);
    }

    ArrayList<ViewHolder> mListViewHolder;

    public int getRecyclerItemCount() {
      mListViewHolder = new ArrayList<>();

      Recycler recycler = mParentRecyclerView.getRecycler();

      mListViewHolder.addAll(recycler.mAttachedScrap);

      mListViewHolder.addAll(recycler.mCachedViews);

      for (int i = 0; i < recycler.getRecycledViewPool().mScrap.size(); i++) {
        mListViewHolder.addAll(recycler.getRecycledViewPool().mScrap.valueAt(i));
      }
      return mListViewHolder.size() + mParentRecyclerView.getChildCount();
    }

    View getRecyclerItemView(int index) {
      if (index < mListViewHolder.size()) {
        return mListViewHolder.get(index).mContent;
      } else {
        return mParentRecyclerView.getChildAt(index - mListViewHolder.size());
      }

    }

    @Override
    public ContentHolder onCreateContentViewWithPos(ViewGroup parent, int position,
      int viewType) {
      NodeHolder contentHolder = new NodeHolder();
      RenderNode contentViewRenderNode = mHippyContext.getRenderManager()
        .getRenderNode(getId()).getChildAt(position);
      contentViewRenderNode.setLazy(false);

      contentHolder.mContentView = contentViewRenderNode.createViewRecursive();
      FooterUtil.checkFooterBinding(mParentRecyclerView, contentHolder.mContentView);

      contentHolder.mBindNode = contentViewRenderNode;
      contentHolder.isCreated = true;
      return contentHolder;
    }

    public void onViewAbandonHelper(ViewHolderWrapper viewHolder) {
      onViewAbandon(viewHolder);
    }

    @Override
    protected void onViewAbandon(ViewHolderWrapper viewHolder) {
      // set is lazy true the holder is delete so delete view
      NodeHolder nodeHolder = (NodeHolder) viewHolder.mContentHolder;
      if (nodeHolder.mBindNode != null) {
        nodeHolder.mBindNode.setLazy(true);
        mHippyContext.getRenderManager().getControllerManager()
          .deleteChild(mParentRecyclerView.getId(), nodeHolder.mBindNode.getId());
      }

      if (nodeHolder.mBindNode instanceof HippyWaterfallItemRenderNode) {
        ((HippyWaterfallItemRenderNode) nodeHolder.mBindNode)
          .setRecycleItemTypeChangeListener(null);
      }

      super.onViewAbandon(viewHolder);
    }

    @Override
    public void onBindContentView(ContentHolder holder, int position, int layoutType) {
      NodeHolder contentHolder = (NodeHolder) holder;

      if (contentHolder.isCreated) {
        try {
          contentHolder.mBindNode.updateViewRecursive();
          contentHolder.isCreated = false;
        } catch (Throwable t) {
          Log.e(TAG, "onBindContentView #" + position, t);
          throw t;
        }
      } else {
        //step 1: diff
        RenderNode fromNode = contentHolder.mBindNode;
        if (contentHolder.mBindNode != null) {
          contentHolder.mBindNode.setLazy(true);
        }
        try {
          RenderNode toNode = mHippyContext.getRenderManager().getRenderNode(getId())
            .getChildAt(position);
          toNode.setLazy(false);

          ArrayList<DiffUtils.PatchType> patchTypes = DiffUtils
            .diff(contentHolder.mBindNode, toNode);

          try {
            //step:2 delete unUseful views
            DiffUtils.deleteViews(mHippyContext.getRenderManager().getControllerManager(),
              patchTypes);
            //step:3 replace id
            DiffUtils.replaceIds(mHippyContext.getRenderManager().getControllerManager(),
              patchTypes);
            //step:4 create view is do not  reUse
            DiffUtils.createView(patchTypes);
            //step:5 patch the dif result
            DiffUtils.doPatch(mHippyContext.getRenderManager().getControllerManager(),
              patchTypes);
          } catch (Throwable t) {
            Log.e(TAG, "onBindContentView #" + position, t);
            throw t;
          }

          contentHolder.mBindNode = toNode;
        } catch (Throwable t) {
        }

      }

      if (contentHolder.mContentView instanceof HippyPullFooterView) {
        FooterUtil.sendFooterReleasedEvent((HippyPullFooterView) contentHolder.mContentView);
      }

      if (contentHolder.mBindNode instanceof HippyWaterfallItemRenderNode) {
        ((HippyWaterfallItemRenderNode) contentHolder.mBindNode)
          .setRecycleItemTypeChangeListener(this);
      }
    }

    @Override
    public int getItemCount() {
      try {
        return getRenderNode().getChildCount();
      } catch (NullPointerException e) {
        e.printStackTrace();
        return 0;
      }
    }

    @Override
    public boolean isAutoCalculateItemHeight() {
      return true;
    }

    @Override
    public int getItemViewType(int index) {
      RenderNode itemNode = getItemNode(index);
      if (itemNode != null) {
        HippyMap props = itemNode.getProps();
        if (props != null && props.containsKey("type")) {
          return props.getInt("type");
        }

        if (itemNode instanceof PullFooterRenderNode) {
          return RecyclerViewBase.ViewHolder.TYPE_CUSTOM_FOOTER;
        }
        if (itemNode instanceof PullHeaderRenderNode) {
          return RecyclerViewBase.ViewHolder.TYPE_CUSTOM_HEADERE;
        }
      }

      return 0;
    }

    RenderNode getRenderNode() {
      return mHippyContext.getRenderManager().getRenderNode(getId());
    }

    View getHippyView(int id) {
      return mHippyContext.getRenderManager().getControllerManager().findView(id);
    }

    RenderNode getItemNode(int index) {
      return getRenderNode().getChildAt(index);
    }

    @Override
    public int getItemHeight(int index) {
      int itemHeight = 0;
      RenderNode listNode = mHippyContext.getRenderManager()
        .getRenderNode(mParentRecyclerView.getId());
      if (listNode != null && listNode.getChildCount() > index && index >= 0) {
        RenderNode listItemNode = listNode.getChildAt(index);
        if (listItemNode != null) {
          itemHeight = listItemNode.getHeight();
        }
      }
      return itemHeight + ((HippyWaterfallLayoutManager) mParentRecyclerView
        .getLayoutManager()).getItemGap();
    }

    @Override
    public int getHeightBefore(int pos) {
      return ((HippyWaterfallLayoutManager) getLayoutManager()).getHeightBefore(pos);
    }

    @Override
    public int getTotalHeight() {
      return getLayoutManager().getTotalHeight();
    }

    @Override
    public void notifyDataSetChanged() {
      setPreloadItemNum(getPreloadThresholdInItemNumber());
      super.notifyDataSetChanged();
    }

    @Override
    public void startRefreshData() {
      mHasOnRefresh = true;

      //sendEvent("OnRefreshEvent");
      getOnRefreshEvent().send(mParentRecyclerView, null);
    }

    public void startRefreshData(boolean fromPull) {
      mHasOnRefresh = true;
      HippyMap params = new HippyMap();
      params.pushString("refreshFrom", fromPull ? "pull" : "command");
      getOnRefreshEvent().send(mParentRecyclerView, params);
    }

    @Override
    public void notifyLastFooterAppeared() {
      super.notifyLastFooterAppeared();
      if (mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_LOADING
        && mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_CUSTOM
        && mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_NOMORE_CLICKBACKWARDS) {
        setLoadingStatus(IRecyclerViewFooter.LOADING_STATUS_LOADING);
      }

      if (mLoadingStatus == IRecyclerViewFooter.LOADING_STATUS_LOADING) {
        mHasOnFooterAppeared = true;

        getOnFooterAppearedEvent().send(mParentRecyclerView, null);
      }
    }

    protected void setLoadingStatus(int loadingStatus, String text) {
      if (loadingStatus != IRecyclerViewFooter.LOADING_STATUS_LOADING) {
        if (loadingStatus != IRecyclerViewFooter.LOADING_STATUS_CUSTOM) {
          mHasSetLoadingStatus = true;
          this.setLoadingStatus(loadingStatus);
        } else {
          mHasSetLoadingStatus = true;
          this.setLoadingStatus(loadingStatus);
        }

        if (this.mDefaultLoadingView != null) {
          this.mDefaultLoadingView.measure(
            MeasureSpec.makeMeasureSpec(this.mDefaultLoadingView.getWidth(), MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(this.mDefaultLoadingView.getHeight(), MeasureSpec.EXACTLY));
          this.mDefaultLoadingView.layout(this.mDefaultLoadingView.getLeft(),
            this.mDefaultLoadingView.getTop(), this.mDefaultLoadingView.getRight(),
            this.mDefaultLoadingView.getBottom());
          this.mDefaultLoadingView.invalidate();
        }

        mOnPreloadCalled = false;
      } else {
        mHasSetLoadingStatus = true;
        this.setLoadingStatus(loadingStatus);
      }
    }

    protected void setPreloadItemNum(int preloadItemNum) {
      mPreloadItemNum = preloadItemNum;
      mShouldUpdatePreloadDistance = true;
    }

    protected void setEnableScrollForReport(boolean enableScrollForReport) {
      mEnableScrollForReport = enableScrollForReport;
    }

    protected void setEnableExposureReport(boolean enableExposureReport) {
      mEnableExposureReport = enableExposureReport;
    }

    protected void checkScrollForReport() {
      if (!mEnableScrollForReport) {
        return;
      }

      int startEdgePos = (int) PixelUtil.px2dp(mParentRecyclerView.mOffsetY);
      int endEdgePos = (int) PixelUtil
        .px2dp(mParentRecyclerView.getHeight() + mParentRecyclerView.mOffsetY);
      int firstVisiblePos = ((HippyWaterfallLayoutManager) mParentRecyclerView
        .getLayoutManager()).findFirstVisibleItemPosition();
      int lastVisiblePos = ((HippyWaterfallLayoutManager) mParentRecyclerView
        .getLayoutManager()).findLastVisibleItemPosition();
      if (lastVisiblePos >= 1 && mParentRecyclerView.getLayoutManager()
        .findViewByPosition(lastVisiblePos) instanceof HippyPullFooterView) {
        lastVisiblePos = lastVisiblePos - 1;
      }

      if (mParentRecyclerView.mViewFlinger.getScroller() == null) {
        return;
      }

      float currentVelocity = Math
        .abs(mParentRecyclerView.mViewFlinger.getScroller().getCurrVelocity());
      int currentScrollState = mParentRecyclerView.getScrollState();

      HippyArray visibleItemArray = new HippyArray();
      for (int i = firstVisiblePos; i <= lastVisiblePos; i++) {
        View v = mParentRecyclerView.getLayoutManager()
          .findViewByPosition(i);
        if (v != null) {
          HippyMap itemData = new HippyMap();
          itemData.pushInt("x", v.getLeft());
          itemData.pushInt("y", v.getTop() + mOffsetY);
          itemData.pushInt("width", (int) PixelUtil.px2dp(getItemWidth(i)));
          itemData.pushInt("height", (int) PixelUtil.px2dp(getItemHeight(i)));

          visibleItemArray.pushMap(itemData);
        }
      }

      handleCurrentScrollStateInner(startEdgePos, endEdgePos, firstVisiblePos, lastVisiblePos,
        currentVelocity, currentScrollState, visibleItemArray);
    }

    void handleCurrentScrollStateInner(int startEdgePos, int endEdgePos,
      int firstVisiblePos, int lastVisiblePos, float currentVelocity,
      int currentScrollState,
      HippyArray visibleItemArray) {
      if ((currentScrollState == RecyclerViewBase.SCROLL_STATE_IDLE
        || currentScrollState == RecyclerViewBase.SCROLL_STATE_DRAGGING) && checkNeedToReport(0,
        currentScrollState)) {
        sendOnScrollForReport(startEdgePos, endEdgePos, firstVisiblePos, lastVisiblePos,
          currentScrollState, visibleItemArray);
      } else if (currentVelocity < mParentRecyclerView.getHeight() * 2 && checkNeedToReport(
        currentVelocity, currentScrollState)) {
        sendOnScrollForReport(startEdgePos, endEdgePos, firstVisiblePos, lastVisiblePos,
          currentScrollState, visibleItemArray);
      }
    }

    private void sendOnScrollForReport(int startEdgePos, int endEdgePos, int firstVisiblePos,
      int lastVisiblePos,
      int currentScrollState, HippyArray visibleItemArray) {
      mHasOnScrollForReport = true;

      if (mScrollReportResultMap == null) {
        mScrollReportResultMap = new HippyMap();
      }
      mScrollReportResultMap.clear();
      mScrollReportResultMap.pushInt("startEdgePos", startEdgePos);
      mScrollReportResultMap.pushInt("endEdgePos", endEdgePos);
      mScrollReportResultMap.pushInt("firstVisibleRowIndex", firstVisiblePos);
      mScrollReportResultMap.pushInt("lastVisibleRowIndex", lastVisiblePos);
      mScrollReportResultMap.pushInt("scrollState", currentScrollState);
      mScrollReportResultMap.pushArray("visibleRowFrames", visibleItemArray);
      getOnScrollForReportEvent().send(mParentRecyclerView, mScrollReportResultMap);
    }

    protected void checkExposureForReport(int oldState, int newState) {
      if (!mEnableExposureReport) {
        return;
      }

      ExposureForReport exposureForReport = getExposureForReport(oldState, newState);
      if (exposureForReport == null) {
        return;
      }
      if (checkNeedToReport(exposureForReport.mVelocity, newState)) {
        if (mExposureReportResultMap == null) {
          mExposureReportResultMap = new HippyMap();
        }
        mExposureReportResultMap.clear();
        mExposureReportResultMap.pushInt("startEdgePos", exposureForReport.mStartEdgePos);
        mExposureReportResultMap.pushInt("endEdgePos", exposureForReport.mEndEdgePos);
        mExposureReportResultMap
          .pushInt("firstVisibleRowIndex", exposureForReport.mFirstVisibleRowIndex);
        mExposureReportResultMap
          .pushInt("lastVisibleRowIndex", exposureForReport.mLastVisibleRowIndex);
        mExposureReportResultMap.pushInt("scrollState", exposureForReport.mScrollState);
        mExposureReportResultMap.pushArray("visibleRowFrames", exposureForReport.mVisibleRowFrames);

        exposureForReport.send(mParentRecyclerView, mExposureReportResultMap);
      }
    }

    protected ExposureForReport getExposureForReportInner(int oldState, int newState) {
      if (!mEnableExposureReport) {
        return null;
      }

      if (mParentRecyclerView.mViewFlinger.getScroller() == null) {
        return null;
      }
      mHasExposureReport = true;

      int startEdgePos = (int) PixelUtil.px2dp(mParentRecyclerView.mOffsetY);
      int endEdgePos = (int) PixelUtil
        .px2dp(mParentRecyclerView.getHeight() + mParentRecyclerView.mOffsetY);
      int firstVisiblePos = ((HippyWaterfallLayoutManager) mParentRecyclerView
        .getLayoutManager()).findFirstVisibleItemPosition();
      int lastVisiblePos = ((HippyWaterfallLayoutManager) mParentRecyclerView
        .getLayoutManager()).findLastVisibleItemPosition();
      if (lastVisiblePos >= 1 && mParentRecyclerView.getLayoutManager()
        .findViewByPosition(lastVisiblePos) instanceof HippyPullFooterView) {
        lastVisiblePos = lastVisiblePos - 1;
      }
      HippyArray visibleItemArray = new HippyArray();

      for (int i = firstVisiblePos; i <= lastVisiblePos; i++) {
        View v = mParentRecyclerView.getLayoutManager()
          .findViewByPosition(i);
        if (v != null) {
          HippyMap itemData = new HippyMap();
          itemData.pushInt("x", v.getLeft());
          itemData.pushInt("y", v.getTop() + mOffsetY);
          itemData.pushInt("width", (int) PixelUtil.px2dp(getItemWidth(i)));
          itemData.pushInt("height", (int) PixelUtil.px2dp(getItemHeight(i)));

          visibleItemArray.pushMap(itemData);
        }
      }

      float currentVelocity = Math
        .abs(mParentRecyclerView.mViewFlinger.getScroller().getCurrVelocity());
      return new ExposureForReport(mParentRecyclerView.getId(), startEdgePos, endEdgePos,
        firstVisiblePos, lastVisiblePos, (int) currentVelocity, newState,
        visibleItemArray);
    }


    protected boolean checkNeedToReport(float velocity, int scrollState) {
      return true;
    }

    @Override
    public void onPreload() {
      mHasPreload = true;

      mOnPreloadCalled = true;
    }

    public boolean hasCustomRecycler() {
      return true;
    }

    ViewHolder findBestHolderRecursive(int position, int targetType,
      Recycler recycler) {
      ViewHolder matchHolder = getScrapViewForPositionInner(position,
        targetType, recycler);
      if (matchHolder == null) {
        matchHolder = recycler.getViewHolderForPosition(position);
      }

      if (matchHolder != null && ((NodeHolder) matchHolder.mContentHolder).mBindNode
        .isDelete()) {
        matchHolder = findBestHolderRecursive(position, targetType, recycler);
      }

      return matchHolder;
    }

    @Override
    public ViewHolder findBestHolderForPosition(int position,
      Recycler recycler) {
      int targetType = getItemViewType(position);
      return findBestHolderRecursive(position, targetType, recycler);
    }

    private ViewHolder getScrapViewForPositionInner(int position, int type,
      Recycler recycler) {
      final int scrapCount = recycler.mAttachedScrap.size();
      // Try first for an exact, non-invalid match from scrap.
      for (int i = 0; i < scrapCount; i++) {
        final ViewHolder holder = recycler.mAttachedScrap.get(i);
        if (holder.getPosition() == position && !holder.isInvalid() && (!holder
          .isRemoved())) {
          if (holder.getItemViewType() == type
            && holder.mContentHolder instanceof NodeHolder) {
            RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
            RenderNode toNode = mHippyContext.getRenderManager()
              .getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
            if (holderNode == toNode) {
              recycler.mAttachedScrap.remove(i);
              holder.setScrapContainer(null);
              return holder;
            }
          }
        }
      }

      // Search in our first-level recycled view cache.
      final int cacheSize = recycler.mCachedViews.size();
      for (int i = 0; i < cacheSize; i++) {
        final ViewHolder holder = recycler.mCachedViews.get(i);
        if (holder.getPosition() == position && holder.getItemId() == type && !holder
          .isInvalid() && holder.mContentHolder instanceof NodeHolder) {
          RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
          RenderNode toNode = mHippyContext.getRenderManager()
            .getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
          if (holderNode == toNode) {
            recycler.mCachedViews.remove(i);
            return holder;
          }
        }
      }
      // Give up. Head to the shared pool.
      return this.getRecycledViewFromPoolInner(recycler.getRecycledViewPool(), type, position);
    }

    private ViewHolder getRecycledViewFromPoolInner(
      RecycledViewPool pool, int viewType, int position) {
      if (pool != null) {
        final ArrayList<ViewHolder> scrapHeap = pool.mScrap.get(viewType);
        if (scrapHeap != null && !scrapHeap.isEmpty()) {
          // traverse all scrap
          for (ViewHolder holder : scrapHeap) {
            if (holder.getItemViewType() == viewType
              && holder.mContentHolder instanceof NodeHolder) {
              RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
              RenderNode toNode = mHippyContext.getRenderManager()
                .getRenderNode(mParentRecyclerView.getId())
                .getChildAt(position);
              if (holderNode == toNode) {
                scrapHeap.remove(holder);
                return holder;
              }
            }
          }
        }
      }
      return null;
    }

    private void checkHolderType(int oldType, int newType,
      HippyWaterfallItemRenderNode listItemRenderNode) {
      //do checkHolderType onScreen
      if (doCheckHolderTypeOnScreen(oldType, newType, listItemRenderNode)) {
        return;
      }

      //do checkHolderType inCache
      final int scrapCount = mRecycler.mAttachedScrap.size();
      // Try first for an exact, non-invalid match from scrap.
      for (int i = 0; i < scrapCount; i++) {
        final ViewHolder holder = mRecycler.mAttachedScrap.get(i);

        if (holder.getItemViewType() == oldType
          && holder.mContentHolder instanceof NodeHolder) {
          RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
          if (holderNode == listItemRenderNode) {
            holder.setItemViewType(newType);
            return;
          }
        }
      }

      // Search in our first-level recycled view cache.
      final int cacheSize = mRecycler.mCachedViews.size();
      for (int i = 0; i < cacheSize; i++) {
        final ViewHolder holder = mRecycler.mCachedViews.get(i);
        if (holder.getItemViewType() == oldType
          && holder.mContentHolder instanceof NodeHolder) {
          RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
          if (holderNode == listItemRenderNode) {
            holder.setItemViewType(newType);
            return;
          }
        }
      }

      // Give up. Head to the shared pool.
      doHeadToTheSharedPool(oldType, newType, listItemRenderNode);
    }

    private boolean doCheckHolderTypeOnScreen(int oldType, int newType,
      HippyWaterfallItemRenderNode listItemRenderNode) {
      int count = mParentRecyclerView.getChildCount();
      for (int i = 0; i < count; i++) {
        final ViewHolder holder = mParentRecyclerView
          .getChildViewHolder(mParentRecyclerView.getChildAt(i));
        if (holder.getItemViewType() == oldType
          && holder.mContentHolder instanceof NodeHolder) {
          RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
          if (holderNode == listItemRenderNode) {
            holder.setItemViewType(newType);
            return true;
          }
        }
      }
      return false;
    }

    private void doHeadToTheSharedPool(int oldType, int newType,
      HippyWaterfallItemRenderNode listItemRenderNode) {
      if (mRecycler.getRecycledViewPool() != null) {
        final ArrayList<ViewHolder> scrapHeap = mRecycler
          .getRecycledViewPool().mScrap.get(oldType);
        if (scrapHeap != null && !scrapHeap.isEmpty()) {
          // traverse all scrap
          for (ViewHolder holder : scrapHeap) {
            if (holder.getItemViewType() == oldType
              && holder.mContentHolder instanceof NodeHolder) {
              RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
              if (holderNode == listItemRenderNode) {
                holder.setItemViewType(newType);
                scrapHeap.remove(holder);
                mRecycler.getRecycledViewPool().getScrapHeapForType(newType)
                  .add(holder);
                return;
              }
            }
          }
        }
      }
    }

    @Override
    public int getPreloadThresholdInItemNumber() {
      return mPreloadItemNum;
    }

    @Override
    public int calcPreloadThresholdWithItemNumber() {
      if (mShouldUpdatePreloadDistance) {
        int startIndex = getItemCount() - 1;
        int endIndex = getItemCount() - mPreloadItemNum;
        if (endIndex < 0) {
          endIndex = 0;
        }
        mPreloadDistanceWithItemNumber = 0;
        for (int i = startIndex; i >= endIndex; i--) {
          mPreloadDistanceWithItemNumber += getItemHeight(i);
        }
        mShouldUpdatePreloadDistance = false;
      }
      return mPreloadDistanceWithItemNumber;
    }

    @Override
    public void onSuddenStop() {
      checkScrollForReport();
    }

    private HippyWaterfallEvent getOnFooterAppearedEvent() {
      if (mOnFooterAppearedEvent == null) {
        mOnFooterAppearedEvent = new HippyWaterfallEvent("onFooterAppeared");
      }
      return mOnFooterAppearedEvent;
    }

    @Override
    public void onRecycleItemTypeChanged(int oldType, int newType,
      HippyWaterfallItemRenderNode listItemNode) {
      checkHolderType(oldType, newType, listItemNode);
    }

    private HippyWaterfallEvent getOnRefreshEvent() {
      if (mOnRefreshEvent == null) {
        mOnRefreshEvent = new HippyWaterfallEvent("onRefresh");
      }
      return mOnRefreshEvent;
    }

    private HippyWaterfallEvent getOnScrollForReportEvent() {
      if (mOnScrollForReportEvent == null) {
        mOnScrollForReportEvent = new HippyWaterfallEvent("onScrollForReport");
      }
      return mOnScrollForReportEvent;
    }

    public OnListScrollListener getOnListScrollListener() {
      if (mOnListScrollListener == null) {
        mOnListScrollListener = new OnListScrollListener() {
          @Override
          public void onStartDrag() {

          }

          @Override
          public void onScroll(int i, int i1) {
            if (mParentRecyclerView instanceof HippyWaterfallView
              && ((HippyWaterfallView) mParentRecyclerView)
              .enableOnSrollReport()) {
              checkScrollForReport();
            }
          }

          @Override
          public void onScrollEnd() {
            checkScrollForReport();
          }

          @Override
          public void onDragEnd() {

          }

          @Override
          public void onStartFling() {

          }
        };
      }
      return mOnListScrollListener;
    }
  }

  private static class NodeHolder extends ContentHolder {

    public RenderNode mBindNode;
    public boolean isCreated = true;

    @Override
    public String toString() {
      return "NodeHolder@" + Integer.toHexString(hashCode()) + " created=" + isCreated
        + " node=" + mBindNode.toString();
    }
  }

  public static class RNWFRecyclerPool extends RecycledViewPool {

    @Override
    public void putRecycledView(ViewHolder scrap, Adapter adapter) {
      final int viewType = scrap.getItemViewType();
      final ArrayList scrapHeap = getScrapHeapForType(viewType);
      if (mMaxScrap.get(viewType) <= scrapHeap.size()) {
        ViewHolder head = (ViewHolder) scrapHeap.get(0);
        scrapHeap.remove(0);
        if (adapter instanceof Adapter && head instanceof ViewHolderWrapper) {
          ((HippyWaterfallAdapter) adapter)
            .onViewAbandonHelper((ViewHolderWrapper) head);//scrap);
        }
        //return;
      }
      scrap.mPosition = NO_POSITION;
      //scrap.mDraggedPosition = NO_POSITION;
      scrap.mOldPosition = NO_POSITION;
      scrap.mItemId = NO_ID;
      scrap.clearFlagsForSharedPool();
      scrapHeap.add(scrap);
    }
  }

  public static class ExposureForReport extends HippyViewEvent {

    public int mStartEdgePos = 0;
    public int mEndEdgePos = 0;
    public int mFirstVisibleRowIndex = 0;
    public int mLastVisibleRowIndex = 0;
    public int mVelocity = 0;
    public int mScrollState = 0;
    public HippyArray mVisibleRowFrames = null;

    public ExposureForReport(int tag, int startEdgePos, int endEdgePos, int firstVisiblePos,
      int lastVisiblePos, int velocity, int scrollState, HippyArray visibleItemArray) {
      super("onExposureReport");
      mStartEdgePos = startEdgePos;
      mEndEdgePos = endEdgePos;
      mFirstVisibleRowIndex = firstVisiblePos;
      mLastVisibleRowIndex = lastVisiblePos;
      mVelocity = velocity;
      mScrollState = scrollState;
      mVisibleRowFrames = visibleItemArray;
    }
  }

  private OnInitialListReadyEvent getOnInitialListReadyEvent() {
    if (mOnInitialListReadyEvent == null) {
      mOnInitialListReadyEvent = new OnInitialListReadyEvent("initialListReady");
    }
    return mOnInitialListReadyEvent;
  }

  private static class OnInitialListReadyEvent extends HippyViewEvent {

    public OnInitialListReadyEvent(String eventName) {
      super(eventName);
    }
  }

  static class HippyWaterfallEvent extends HippyViewEvent {

    String eventName;

    public HippyWaterfallEvent(String name) {
      super(name);
      eventName = name;
    }

    @Override
    public void send(View view, Object param) {
      super.send(view, param);
    }
  }
}
