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

import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.LAYOUT_TYPE_WATERFALL;

import android.content.Context;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.util.Log;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.uimanager.PullFooterRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.HippyViewUtil;
import com.tencent.mtt.hippy.views.refresh.FooterUtil;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.waterfalllist.HippyWaterfallView.HippyWaterfallAdapter;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerAdapter;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A {@link HippyWaterfallLayoutManager} implementation which provides similar functionality to
 * {@link android.widget.ListView}.
 */
public class HippyWaterfallLayoutManager extends BaseLayoutManager {

  private static final String TAG = "HippyWaterfallLayout";

  static final int MIN_COLUMN = 2;
  int mColumns = MIN_COLUMN;
  int mItemGap = 0;
  int mColumnSpacing = 0;
  boolean mPaddingStartZero = true;
  boolean mBannerViewMatch = false;
  boolean mHasContainBannerView = false;
  ArrayList<Integer> mHeaderHeight = new ArrayList<Integer>();
  private boolean mEndReached = false;

  public HippyWaterfallLayoutManager(Context context) {
    this(context, VERTICAL, false);
  }

  /**
   * @param context       Current context, will be used to access resources.
   * @param orientation   Layout orientation. Should be {@link #HORIZONTAL} or {@link #VERTICAL}.
   * @param reverseLayout When set to true, renders the layout from end to start.
   */
  public HippyWaterfallLayoutManager(Context context, int orientation, boolean reverseLayout) {
    super(context, orientation, false);
  }

  public boolean getContainBannerView() {
    return mHasContainBannerView;
  }

  public void setContainBannerView(boolean containBannerView) {
    mHasContainBannerView = containBannerView;
  }

  public int getColumns() {
    return mColumns;
  }

  public void setColumns(int columns) {
    this.mColumns = Math.max(2, columns);
  }

  public int getItemGap() {
    return mItemGap;
  }

  public void setItemGap(int gap) {
    mItemGap = Math.max(0, gap);
  }

  public void setColumnSpacing(int spacing) {
    mColumnSpacing = Math.max(0, spacing);
  }

  public int getColumnSpacing() {
    return mColumnSpacing;
  }

  public void setPaddingStartZero(boolean paddingStartZero) {
    mPaddingStartZero = paddingStartZero;
  }

  public void setBannerViewMatch(boolean bannerViewMatch) {
    mBannerViewMatch = bannerViewMatch;
  }


  public int getHeaderHeight(int index) {
    if (index <= 0 || index > mHeaderHeight.size()) {
      return 0;
    }
    return mHeaderHeight.get(index - 1);
  }

  int[] calculateColumnHeightsBefore(int position, boolean caculateOffsetmap) {
    // #lizard forgives
    int[] columnHeights = new int[mColumns];
    SparseArray<List<Integer>> items = new SparseArray<>();
    int n = 0;

    HippyWaterfallAdapter adapter = (HippyWaterfallAdapter) mRecyclerView.getAdapter();

    if (mHasContainBannerView) {
      position += 1;
    }

    for (int i = 0; i < position; i++) {
      int targetColumnIndex = 0;
      for (int j = 0; j < columnHeights.length; j++) {
        if (columnHeights[targetColumnIndex] > columnHeights[j]) {
          targetColumnIndex = j;
        }
      }

      if (mHasContainBannerView) {
        if (i == 0 || i == 1) {
          n = 0;
        } else if (i > 1) {
          n = i - 1;
        }
      } else {
        n = i;
      }

      int myHeight = adapter.getItemHeight(n) + adapter
        .getItemMaigin(RecyclerAdapter.LOCATION_TOP, n)
        + adapter.getItemMaigin(RecyclerAdapter.LOCATION_BOTTOM, n);

      RenderNode node = adapter.getItemNode(i);
      if (node instanceof PullFooterRenderNode) {
        int height = getHightestColumnHeight(columnHeights) + myHeight;
        Arrays.fill(columnHeights, height);
      } else {
        columnHeights[targetColumnIndex] += myHeight;
      }
    }
    return columnHeights;
  }

  // calculate the height of every column after the item with index position.
  public int[] calculateColumnHeightsAfter(int position) {
    // #lizard forgives
    int[] columnHeights = new int[mColumns];
    SparseArray<List<Integer>> items = new SparseArray<>();
    int n = 0;
    HippyWaterfallAdapter adapter = (HippyWaterfallAdapter) mRecyclerView.getAdapter();

    if (mHasContainBannerView) {
      position += 1;
    }

    for (int i = 0; i <= position; i++) {
      int targetColumnIndex = 0;
      for (int j = 0; j < columnHeights.length; j++) {
        if (columnHeights[targetColumnIndex] > columnHeights[j]) {
          targetColumnIndex = j;
        }
      }

      if (mHasContainBannerView) {
        if (i == 0 || i == 1) {
          n = 0;
        } else if (i > 1) {
          n = i - 1;
        }
      } else {
        n = i;
      }

      int myHeight = adapter.getItemHeight(n) + adapter
        .getItemMaigin(RecyclerAdapter.LOCATION_TOP, n)
        + adapter.getItemMaigin(RecyclerAdapter.LOCATION_BOTTOM, n);

      RenderNode node = adapter.getItemNode(i);
      if (node instanceof PullFooterRenderNode) {
        int height = getHightestColumnHeight(columnHeights) + myHeight;
        Arrays.fill(columnHeights, height);
      } else {
        columnHeights[targetColumnIndex] += myHeight;
      }
    }
    return columnHeights;
  }

  public static int getShortestColumnIndex(int[] columnHeights) {
    int shortestColumnIndex = 0;
    for (int j = 0; j < columnHeights.length; ++j) {
      if (columnHeights[shortestColumnIndex] > columnHeights[j]) {
        shortestColumnIndex = j;
      }
    }
    return shortestColumnIndex;
  }

  public static int getShortestColumnHeight(int[] columnHeights) {
    return columnHeights[getShortestColumnIndex(columnHeights)];
  }

  public static int getHightestColumnHeight(int[] columnHeights) {
    int heightestColumnIndex = 0;
    for (int j = 0; j < columnHeights.length; j++) {
      if (columnHeights[heightestColumnIndex] < columnHeights[j]) {
        heightestColumnIndex = j;
      }
    }
    return columnHeights[heightestColumnIndex];
  }

  @Override
  protected void updateRenderState(int layoutDirection, int requiredSpace,
    boolean canUseExistingSpace, RecyclerViewBase.State state) {
    super.updateRenderState(layoutDirection, requiredSpace, canUseExistingSpace, state);
    resetTargetColumn();
  }

  @Override
  protected void updateRenderStateToFillStart(int itemPosition, int offset) {
    super.updateRenderStateToFillStart(itemPosition, offset);
    if (mHasContainBannerView && itemPosition == 0) {
      ((WaterFallRenderState) mRenderState).targetColumn = 0;
    } else {
      resetTargetColumn();
    }
  }

  @Override
  protected void updateRenderStateToFillEnd(int itemPosition, int offset) {
    super.updateRenderStateToFillEnd(itemPosition, offset);
    if (mHasContainBannerView && itemPosition == 0) {
      ((WaterFallRenderState) mRenderState).targetColumn = 0;
    } else {
      resetTargetColumn();
    }
  }

  private void resetTargetColumn() {
    if (mHasContainBannerView && mRenderState.mCurrentPosition == 0) {
      ((WaterFallRenderState) mRenderState).targetColumn = 0;
    } else {
      int[] columnHeights = calculateColumnHeightsBefore(mRenderState.mCurrentPosition,
        false);
      ((WaterFallRenderState) mRenderState).targetColumn = getShortestColumnIndex(
        columnHeights);
    }
  }

  // #lizard forgives
  void compensateLayoutStart(WaterFallRenderState renderState) {//转屏的时候需要往前回溯几个，以免顶部出现空白
    if (renderState.mCurrentPosition <= 0
      || renderState.mLayoutDirection != RenderState.LAYOUT_END
      || renderState.mOffset >= 0) {
      return;
    }

    int[] columnHeights = calculateColumnHeightsBefore(renderState.mCurrentPosition, false);
    int maxHeight = columnHeights[0];
    int minHeight = columnHeights[0];
    for (int i = 1; i < columnHeights.length; ++i) {
      int one = columnHeights[i];
      if (one > maxHeight) {
        maxHeight = one;
      } else if (one < minHeight) {
        minHeight = one;
      }
    }

    int screenTop = minHeight - renderState.mOffset;
    if (maxHeight <= screenTop) {
      return;
    }

    final int rollbackLimit = mColumns;
    int resultPosition = 0, resultHeight = 0, resultColumn = renderState.targetColumn;
    for (int position = renderState.mCurrentPosition - 1;
      position > 0 && renderState.mCurrentPosition - position < rollbackLimit;
      --position) {
      columnHeights = calculateColumnHeightsBefore(position, false);
      maxHeight = columnHeights[0];
      minHeight = columnHeights[0];
      int minColumns = 0;
      for (int i = 1; i < columnHeights.length; ++i) {
        int one = columnHeights[i];
        if (one > maxHeight) {
          maxHeight = one;
        } else if (one < minHeight) {
          minHeight = one;
          minColumns = i;
        }
      }

      if (maxHeight <= screenTop) {
        resultPosition = position;
        resultHeight = minHeight;
        resultColumn = minColumns;
        break;
      }
    }

    if (renderState.mCurrentPosition - resultPosition >= rollbackLimit) {
      Log.e(TAG, "compensateLayoutStart: discard inappropriate sugguestion "
        + renderState.mCurrentPosition + " -> " + resultPosition);
      return;
    }

    int resultOffset = resultHeight - screenTop;
    Log.d(TAG, "compensateLayoutStart: position=" + renderState.mCurrentPosition + "->"
      + resultPosition + " mOffset=" + renderState.mOffset + "->"
      + resultOffset + " column=" + renderState.targetColumn + "->" + resultColumn);
    renderState.mCurrentPosition = resultPosition;
    renderState.mOffset = resultOffset;
    renderState.targetColumn = resultColumn;
  }

  /**
   * The magic functions :). Fills the given layout, defined by the renderState. This is fairly
   * independent from the rest of the {@link HippyWaterfallLayoutManager} and with little change,
   * can be made publicly available as a helper class.
   *
   * @param recycler        Current recycler that is attached to RecyclerView
   * @param renderState     Configuration on how we should fill out the available space.
   * @param state           Context passed by the RecyclerView to control scroll steps.
   * @param stopOnFocusable If true, filling stops in the first focusable new child
   * @return Number of pixels that it added. Useful for scoll functions.
   */
  // #lizard forgives
  protected int fill(RecyclerViewBase.Recycler recycler, RenderState renderState,
    RecyclerViewBase.State state, boolean stopOnFocusable) {

    compensateLayoutStart((WaterFallRenderState) renderState);

    final int itemWidth = (getWidth() - getPaddingLeft() - getPaddingRight()) / mColumns;
    final int itemGapH = getColumnSpacing() * (mColumns - 1) / mColumns;

    // max offset we should set is mFastScroll + available
    final int start = renderState.mAvailable;
    if (renderState.mScrollingOffset != RenderState.SCOLLING_OFFSET_NaN) {
      // TODO ugly bug fix. should not happen
      if (renderState.mAvailable < 0) {
        renderState.mScrollingOffset += renderState.mAvailable;
      }
      recycleByRenderState(recycler, renderState);
    }
    int remainingSpace = renderState.mAvailable + renderState.mExtra;
    while (remainingSpace > 0) {
      int hasMoreState = renderState.hasMore(state);

      boolean isEndReached = renderState.mItemDirection > 0 && !mEndReached
        && (hasMoreState == RenderState.FILL_TYPE_NOMORE
        || hasMoreState == RenderState.FILL_TYPE_FOOTER);
      if (isEndReached) {
        mEndReached = true;
        if (mRecyclerView.getAdapter() != null) {
          mRecyclerView.getAdapter().notifyEndReached();
        }
      }

      if (hasMoreState == RenderState.FILL_TYPE_NOMORE) {
        return remainingSpace;
      }

      int index = renderState.mCurrentPosition;
      int firstItemWidth = itemWidth;
      if (mHasContainBannerView && index == 0) {
        firstItemWidth = (getWidth() - getPaddingLeft() - getPaddingRight());
      }
      //            int currentRenderState = renderState.hasMore(state);
      View view = getNextView(recycler, renderState, state);
      if (view == null) {
        if (false && renderState.mScrapList == null) {
          throw new RuntimeException("received null view when unexpected");
        }
        // if we are laying out views in scrap, this may return null
        // which means there is
        // no more items to layout.
        break;
      }

      mEndReached = false;

      if (isFooterView(view)) {
        firstItemWidth = (getWidth() - getPaddingLeft() - getPaddingRight());
      }

      RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view
        .getLayoutParams();
      if (params instanceof LayoutParams) {
        ((LayoutParams) params).mLocateAtColumn = -1;
      }
      if (!params.isItemRemoved() && mRenderState.mScrapList == null) {
        if (mShouldReverseLayout == (renderState.mLayoutDirection
          == RenderState.LAYOUT_START)) {
          addView(view);
        } else {
          addView(view, 0);
        }
      }

      int viewType = params.mViewHolder.mViewType;
      int widthUsed = 0;

      if (viewType == RecyclerViewBase.ViewHolder.TYPE_NORMAL) {
        if (params instanceof LayoutParams) {
          int targetColumn = ((WaterFallRenderState) mRenderState).targetColumn;
          ((LayoutParams) params).mLocateAtColumn = targetColumn;
          if (!isFooterView(view)) {
            setChildPadding(itemGapH, index, view, targetColumn);
          }
        }
        if (getOrientation() == VERTICAL) {
          params.width = firstItemWidth - params.leftMargin - params.rightMargin;
        } else {
          params.height = firstItemWidth - params.topMargin - params.bottomMargin;
        }

        if (mRecyclerView.getAdapter() instanceof RecyclerAdapter
          && ((RecyclerAdapter) mRecyclerView.getAdapter())
          .isAutoCalculateItemHeight() && view instanceof RecyclerViewItem) {
          if (((RecyclerViewItem) view).getChildCount() > 0) {
            View contentView = ((RecyclerViewItem) view).getChildAt(0);
            ViewGroup.LayoutParams contentLayout = contentView.getLayoutParams();
            if (contentLayout != null) {
              contentLayout.width = params.width;
            } else {
              contentLayout = new ViewGroup.LayoutParams(params);
            }
            if (!mHasContainBannerView || index != 0 || !mBannerViewMatch) {
              if (!isFooterView(view)) {
                if (contentLayout.width > 0) {
                  contentLayout.width -= itemGapH;
                }
              }
            }
            contentView.setLayoutParams(contentLayout);

            int widthSpec = View.MeasureSpec
              .makeMeasureSpec(contentLayout.width, View.MeasureSpec.AT_MOST);
            int heightSpec = View.MeasureSpec
              .makeMeasureSpec(contentView.getMeasuredHeight(),
                View.MeasureSpec.AT_MOST);
            contentView.measure(widthSpec, heightSpec);
          }
        }

        if (isFooterView(view)) {
          widthUsed = 0;
        } else if (mHasContainBannerView && index == 0) {
          widthUsed = mRecyclerView.getMeasuredWidth();
        } else {
          widthUsed =
            mRecyclerView.getMeasuredWidth() * (getColumns() - 1) / getColumns();
        }
      }

      // TODO
      //            if (viewType == RecyclerView.ViewHolder.TYPE_FOOTER || viewType == RecyclerView.ViewHolder.TYPE_HEADERE)
      //            {
      //                if (view instanceof QBViewInterface)
      //                {
      //                    ((QBViewInterface) view).switchSkin();
      //                }
      //            }

      measureChildWithMargins(view, widthUsed, 0);
      if (mRecyclerView.getAdapter() instanceof RecyclerAdapter
        && ((RecyclerAdapter) mRecyclerView.getAdapter()).isAutoCalculateItemHeight()) {
        if (view instanceof RecyclerViewItem) {
          if (((RecyclerViewItem) view).getChildCount() > 0) {
            recordItemSize(index, ((RecyclerViewItem) view).getChildAt(0));
            //((QBRecyclerAdapter) mRecyclerView.getAdapter()).forceUpdateOffsetMap();
          }
        } else {
          if (viewType == RecyclerViewBase.ViewHolder.TYPE_HEADERE) {
            int height = view.getMeasuredHeight();
            int headerIndex = Math.abs(index) - 1;
            while (headerIndex >= mHeaderHeight.size()) {
              mHeaderHeight.add(0);
            }
            mHeaderHeight.set(headerIndex, height);
          }
        }
        if (renderState.hasMore(state) == RenderState.FILL_TYPE_NOMORE) {
          mRecyclerView.mState.mTotalHeight = mRecyclerView.getAdapter().getListTotalHeight();
        }
      }

      int addViewLength = mOrientationHelper.getDecoratedMeasurement(view);
      int left, top, right, bottom;
      if (getOrientation() == VERTICAL) {

        if (isFooterView(view) || viewType == RecyclerViewBase.ViewHolder.TYPE_FOOTER) {
          left = getPaddingLeft();
          right = left + mOrientationHelper.getDecoratedMeasurementInOther(view);
          top = mOrientationHelper.getDecoratedEnd(getChildClosestToDefaultFooter());
          bottom = mOrientationHelper.getDecoratedEnd(getChildClosestToDefaultFooter())
            + addViewLength;
        } else if (viewType == RecyclerViewBase.ViewHolder.TYPE_HEADERE) {
          left = getPaddingLeft();
          right = left + mOrientationHelper.getDecoratedMeasurementInOther(view);
          if (renderState.mLayoutDirection == RenderState.LAYOUT_START) {
            bottom = renderState.mOffset;
            top = renderState.mOffset - addViewLength;
          } else {
            top = renderState.mOffset;
            bottom = renderState.mOffset + addViewLength;
          }
        } else {
          // the layout derection of waterfall will not care about
          // left-hander.
          left = ((WaterFallRenderState) mRenderState).targetColumn * itemWidth
            + getPaddingLeft();
          right = left + mOrientationHelper.getDecoratedMeasurementInOther(view);
          if (renderState.mLayoutDirection == RenderState.LAYOUT_START) {
            // renderState.mOffset = a;
            bottom = renderState.mOffset;
            top = renderState.mOffset - addViewLength;
          } else {
            top = renderState.mOffset;
            bottom = renderState.mOffset + addViewLength;
          }
        }
      } else {
        if (renderState.mLayoutDirection == RenderState.LAYOUT_START) {
          // renderState.mOffset = a;
          bottom = getHeight() - getPaddingBottom()
            - itemWidth * ((WaterFallRenderState) mRenderState).targetColumn;
          top = bottom - mOrientationHelper.getDecoratedMeasurementInOther(view);
          right = renderState.mOffset;
          left = renderState.mOffset - addViewLength;
        } else {
          top = ((WaterFallRenderState) mRenderState).targetColumn * itemWidth
            + getPaddingTop();
          bottom = top + mOrientationHelper.getDecoratedMeasurementInOther(view);
          left = renderState.mOffset;
          right = renderState.mOffset + addViewLength;
        }
      }
      // We calculate everything with View's bounding box (which includes
      // decor and margins)
      // To calculate correct layout position, we subtract margins.
      layoutDecorated(view, left + params.leftMargin, top + params.topMargin,
        right - params.rightMargin, bottom - params.bottomMargin);

      if (!params.isItemRemoved()) {
        int cosume = 0;
        if (viewType == RecyclerViewBase.ViewHolder.TYPE_FOOTER) {
          int oldOffsetY = renderState.mOffset;
          renderState.mOffset = mOrientationHelper
            .getDecoratedEnd(getChildClosestToDefaultFooter());
          renderState.mOffset += mOrientationHelper.getDecoratedMeasurement(view);
          Log.d(TAG, "fill: mOffset=" + renderState.mOffset + " viewType=" + viewType + " @1");
          cosume = renderState.mOffset - oldOffsetY;
        } else if (viewType == RecyclerViewBase.ViewHolder.TYPE_HEADERE) {
          if (renderState.mLayoutDirection == RenderState.LAYOUT_START) {
            cosume = -mOrientationHelper.getDecoratedMeasurement(view);
          } else {
            cosume = mOrientationHelper.getDecoratedMeasurement(view);
          }
          renderState.mOffset += cosume;
          Log.d(TAG, "fill: mOffset=" + renderState.mOffset + " viewType=" + viewType + " @2");
        } else {
          if (renderState.mLayoutDirection == RenderState.LAYOUT_START) {
            int[] columnHeightBefore = calculateColumnHeightsAfter(
              renderState.mCurrentPosition - renderState.mItemDirection);
            int[] columnHeightAfter = calculateColumnHeightsBefore(
              renderState.mCurrentPosition - renderState.mItemDirection, false);
            int heightestHeightBefore = getHightestColumnHeight(columnHeightBefore);
            int heightestHeightAfter = getHightestColumnHeight(columnHeightAfter);
            cosume = heightestHeightAfter - heightestHeightBefore;
            renderState.mOffset = mOrientationHelper
              .getDecoratedStart(getChildClosestToStartInScreen());
            Log.d(TAG, "fill: mOffset=" + renderState.mOffset + " viewType=" + viewType + " @3");
          } else {
            if (mHasContainBannerView && index == 0) {
              cosume = addViewLength;
              renderState.mOffset += cosume;
              Log.d(TAG, "fill: mOffset=" + renderState.mOffset + " cosume=" + cosume + " viewType="
                + viewType + " @4");
            } else {
              int[] columnHeightBefore = calculateColumnHeightsBefore(
                renderState.mCurrentPosition - renderState.mItemDirection,
                false);
              int[] columnHeightAfter = calculateColumnHeightsAfter(
                renderState.mCurrentPosition - renderState.mItemDirection);
              int shortestHeightBefore = getShortestColumnHeight(columnHeightBefore);
              int shortestHeightAfter = getShortestColumnHeight(columnHeightAfter);
              cosume = shortestHeightAfter - shortestHeightBefore;
              renderState.mOffset += cosume;
              Log.d(TAG, "fill: mOffset=" + renderState.mOffset + " cosume=" + cosume + " viewType="
                + viewType + " @5");
            }
          }
        }

        if (mHasContainBannerView && index == 0) {
          ((WaterFallRenderState) mRenderState).targetColumn = 0;
        } else {
          resetTargetColumn();
        }

        renderState.mAvailable -= Math.abs(cosume);
        // we keep a separate remaining space because mAvailable is
        // important for recycling
        remainingSpace -= Math.abs(cosume);

        if (renderState.mScrollingOffset != RenderState.SCOLLING_OFFSET_NaN) {
          renderState.mScrollingOffset += Math.abs(cosume);
          if (renderState.mAvailable < 0) {
            renderState.mScrollingOffset += renderState.mAvailable;
          }
          recycleByRenderState(recycler, renderState);
        }
      }

      if (stopOnFocusable && view.isFocusable()) {
        break;
      }

      if (state != null && state.getTargetScrollPosition() == getPosition(view)) {
        break;
      }
    }
    return start - renderState.mAvailable;
  }

  void setChildPadding(int itemGapH, int index, View view, int targetColumn) {
    if (mHasContainBannerView && index == 0) {
      if (mBannerViewMatch) {
        view.setPadding(0, 0, 0, mItemGap);
      } else {
        view.setPadding(itemGapH / 2, 0, itemGapH / 2, mItemGap);
      }
    } else {
      if (mPaddingStartZero) {
        if (targetColumn == 0) {
          view.setPadding(0, 0, itemGapH, mItemGap);
        } else if (targetColumn == mColumns - 1) {
          view.setPadding(itemGapH, 0, 0, mItemGap);
        } else {
          view.setPadding(itemGapH / 2, 0, itemGapH / 2, mItemGap);
        }
      } else {
        int edgePadding = itemGapH * mColumns / (mColumns + 1);
        if (targetColumn == 0) {
          view.setPadding(edgePadding, 0, itemGapH - edgePadding, mItemGap);
        } else if (targetColumn == mColumns - 1) {
          view.setPadding(itemGapH - edgePadding, 0, edgePadding, mItemGap);
        } else {
          view.setPadding(itemGapH / 2, 0, itemGapH / 2, mItemGap);
        }
      }
    }
  }

  @Override
  public void measureChildWithMargins(View child, int widthUsed, int heightUsed) {
    RecyclerViewBase.LayoutParams lp = null;
    if (child == null) {
      return;
    }
    if (child.getLayoutParams() != null) {
      lp = (RecyclerViewBase.LayoutParams) child.getLayoutParams();
    } else {
      lp = generateDefaultLayoutParams();
    }
    final Rect insets = mRecyclerView.getItemDecorInsetsForChild(child);
    widthUsed += insets.left + insets.right;
    heightUsed += insets.top + insets.bottom;

    MeasureWH measureWH = new MeasureWH();
    measureWH.width = lp.width;
    measureWH.height = lp.height;
    if (mRecyclerView.getAdapter() instanceof RecyclerAdapter) {
      boolean enableAutoItemHeight = ((RecyclerAdapter) mRecyclerView.getAdapter())
        .isAutoCalculateItemHeight();
      if (enableAutoItemHeight) {
        if (child instanceof RecyclerViewItem) {
          if (((RecyclerViewItem) child).getChildCount() > 0) {
            View contentView = ((RecyclerViewItem) child).getChildAt(0);
            if (isFooterView(contentView)) {
              setFooterMeasureWH(contentView, measureWH);
            } else {
              measureWH.width = contentView.getMeasuredWidth()
                + child.getPaddingRight() + child
                .getPaddingLeft();//mItemGap * (mColumns - 1) / mColumns;
              measureWH.height = contentView.getMeasuredHeight()
                + mItemGap;// + ((RecyclerAdapter) mRecyclerView.getAdapter()).getDividerHeight(0)
            }
          }
        } else if (child instanceof HippyPullFooterView) {
          setFooterMeasureWH(child, measureWH);
        } else if (child instanceof ViewGroup) {
          ViewGroup viewGroup = (ViewGroup) child;
          if (viewGroup.getChildCount() > 0) {
            View contentView = viewGroup.getChildAt(0);
            measureWH.width = contentView.getMeasuredWidth();
            measureWH.height = contentView.getMeasuredHeight();
          }
        }
      }
    }

    final int widthSpec = getChildMeasureSpec(getWidth(),
      getPaddingLeft() + getPaddingRight() + lp.leftMargin + lp.rightMargin + widthUsed,
      measureWH.width, canScrollHorizontally());
    final int heightSpec = getChildMeasureSpec(getHeight(),
      getPaddingTop() + getPaddingBottom() + lp.topMargin + lp.bottomMargin + heightUsed,
      measureWH.height, canScrollVertically());

    child.measure(widthSpec, heightSpec);
  }

  public static class MeasureWH {

    int width;
    int height;
  }

  void setFooterMeasureWH(View footerView, MeasureWH measureWH) {
    RenderNode footerNode = HippyViewUtil.getRenderNode(footerView);
    if (footerNode != null) {
      measureWH.width = footerNode.getWidth();
      measureWH.height = footerNode.getHeight() + mItemGap;
    } else {
      measureWH.width = footerView.getWidth();
      measureWH.height = footerView.getHeight() + mItemGap;
    }
  }

  protected static class WaterFallRenderState extends RenderState {

    public int targetColumn = 0;
  }

  @Override
  protected void ensureRenderState() {
    if (this.mRenderState == null) {
      this.mRenderState = new WaterFallRenderState();
    }

    super.ensureRenderState();
  }

  @Override
  public void calculateOffsetMap(SparseIntArray offsetMap, int startOffset) {
    RecyclerAdapter adapter = (RecyclerAdapter) mRecyclerView.getAdapter();
    int itemCount = adapter.getItemCount();
    int[] columnHeights = new int[mColumns];
    for (int i = 0; i < itemCount; i++) {
      int targetColumnIndex = getShortestColumnIndex(columnHeights);
      offsetMap.append(i, columnHeights[targetColumnIndex]);
      columnHeights[targetColumnIndex] += adapter.getItemHeight(i) + adapter
        .getItemMaigin(RecyclerAdapter.LOCATION_TOP, i)
        + adapter.getItemMaigin(RecyclerAdapter.LOCATION_BOTTOM, i);
    }
  }

  @Override
  public int getLayoutType() {
    return LAYOUT_TYPE_WATERFALL;
  }

  public RecyclerViewBase.LayoutParams onCreateItemLayoutParams(
    RecyclerView.ViewHolderWrapper holder, int position, int layoutType,
    int cardType) {
    int itemHeight = mRecyclerView.getAdapter().getItemHeight(position);
    ViewGroup.LayoutParams lp = holder.itemView.getLayoutParams();
    if (lp == null) {
      return new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, itemHeight);
    }
    if (lp instanceof LayoutParams) {
      return (RecyclerViewBase.LayoutParams) lp;
    } else {
      return new LayoutParams(lp.width, itemHeight);
    }
  }

  public static class LayoutParams extends RecyclerViewBase.LayoutParams {

    public int mLocateAtColumn = -1;

    public LayoutParams(Context c, AttributeSet attrs) {
      super(c, attrs);
    }

    public LayoutParams(int width, int height) {
      super(width, height);
    }

    public LayoutParams(LayoutParams source) {
      super(source);
      mLocateAtColumn = source.mLocateAtColumn;
    }

    public LayoutParams(ViewGroup.MarginLayoutParams source) {
      super(source);
    }

    public LayoutParams(ViewGroup.LayoutParams source) {
      super(source);
    }
  }

  @Override
  public int getHeightBefore(int pos) {
    int[] columnHeights = calculateColumnHeightsBefore(pos, false);
    return columnHeights[getShortestColumnIndex(columnHeights)];
  }

  public int getTotalHeight() {
    int[] columnHeights = calculateColumnHeightsBefore(getItemCount(), false);
    return getHightestColumnHeight(columnHeights);
  }

  /**
   * Convenience method to find the child closes to start. Caller should check it has enough
   * children.
   *
   * @return The shortest column's top child.
   */
  public View getChildClosestToStartInScreen() {
    return mShouldReverseLayout ? getChildClosestToEndInternal()
      : getChildClosestToStartInternal();
  }

  /**
   * Convenience method to find the child closes to end. Caller should check it has enough
   * children.
   *
   * @return The shortest column's bottom child.
   */
  public View getChildClosestToEndInScreen() {
    return mShouldReverseLayout ? getChildClosestToStartInternal()
      : getChildClosestToEndInternal();
  }

  /**
   * Convenience method to find the child closes to end. Caller should check it has enough
   * children.
   *
   * @return The shortest column's bottom child.
   */
  private View getChildClosestToDefaultFooter() {
    View[] childsClosestToEnd = new View[mColumns];
    for (int i = 0; i < getChildCount() - 1; i++) {
      View view = getChildAt(i);
      LayoutParams params = (LayoutParams) view.getLayoutParams();
      for (int j = 0; j < mColumns; j++) {
        if (params.mLocateAtColumn == j) {
          childsClosestToEnd[j] = view;
          break;
        }
      }
    }
    int targetIndex = 0;
    for (int i = 0; i < mColumns; i++) {
      if (childsClosestToEnd[targetIndex] == null) {
        break;
      }
      if (childsClosestToEnd[i] == null) {
        break;
      }
      if (childsClosestToEnd[targetIndex].getBottom() < childsClosestToEnd[i].getBottom()) {
        targetIndex = i;
      }
    }
    return childsClosestToEnd[targetIndex];
  }

  /**
   * Convenience method to find the child closes to end. Caller should check it has enough
   * children.
   *
   * @return The shortest column's bottom child.
   */
  private View getChildClosestToEndInternal() {
    if (mHasContainBannerView && getChildCount() == 1) {
      return getChildAt(0);
    }

    View[] childsClosestToEnd = new View[mColumns];
    for (int i = 0; i < getChildCount(); i++) {
      View view = getChildAt(i);
      if (view.getLayoutParams() instanceof LayoutParams) {
        LayoutParams params = (LayoutParams) view.getLayoutParams();
        for (int j = 0; j < mColumns; j++) {
          if (params.mLocateAtColumn == j) {
            childsClosestToEnd[j] = view;
            break;
          }
        }
      }
    }
    int targetIndex = 0;
    for (int i = 0; i < mColumns; i++) {
      if (childsClosestToEnd[targetIndex] == null) {
        break;
      }
      if (childsClosestToEnd[i] == null) {
        targetIndex = i;
        break;
      }

      boolean isLastView = (getPosition(childsClosestToEnd[i]) == getItemCount() - 1);
      if (isLastView) {
        targetIndex = i;
        break;
      }

      boolean isFooter = isFooterView(childsClosestToEnd[targetIndex]);
      if (isFooter) {
        targetIndex = i;
        break;
      }
      if (childsClosestToEnd[targetIndex].getBottom() > childsClosestToEnd[i].getBottom()) {
        targetIndex = i;
      }
    }
    return childsClosestToEnd[targetIndex];
  }

  private boolean isFooterView(View target) {
    return FooterUtil.isFooterView(target);
  }

  /**
   * Convenience method to find the child closes to end. Caller should check it has enough
   * children.
   *
   * @return The shortest column's bottom child.
   */
  private View getChildClosestToStartInternal() {
    int targetPosition =
      getPosition(getChildClosestToStartByOrder()) + mRenderState.mItemDirection;
    int[] columnHeights = calculateColumnHeightsBefore(targetPosition, false);
    int targetColumn = getShortestColumnIndex(columnHeights);
    View view = null;
    for (int i = 0; i < getChildCount(); i++) {
      view = getChildAt(i);
      if (view.getLayoutParams() instanceof LayoutParams) {
        LayoutParams params = (LayoutParams) view.getLayoutParams();
        if (params.mLocateAtColumn == targetColumn) {
          break;
        }
      }
    }
    return view;
  }
}
