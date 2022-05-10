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

import android.graphics.Rect;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import androidx.recyclerview.widget.RecyclerView.LayoutManager;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.StrictFocusFinder;
import com.tencent.mtt.hippy.views.list.HippyListItemView;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;

public class HippyRecycleViewFocusHelper {

  private static final String TAG = "HippyRecycleView";
  private View mFocusedView;
  private int mKeyCode = KeyEvent.KEYCODE_DPAD_CENTER;
  private HippyRecyclerView mRecyclerView;
  private Rect mFocusRect = new Rect();

  public HippyRecycleViewFocusHelper(HippyRecyclerView recyclerView) {
    this.mRecyclerView = recyclerView;
  }

  public void setListData() {
    mFocusedView = null;
  }

  public void setKeyCode(int keyCode) {
    mKeyCode = keyCode;
  }

  public void requestChildFocus(View child, View focused) {
    if (mRecyclerView.getLayoutManager().canScrollVertically()) {
      scrollToFocusChildVertical(focused);
    } else {
      scrollToFocusChildHorizontal(focused);
    }
    mFocusedView = focused;
  }

  private void scrollToFocusChildVertical(View focused) {
    View parent = getParentRecycleItem(focused);
    if (parent != null) {

      int focusPos = mRecyclerView.getLayoutManager().getPosition(mRecyclerView.getFocusedChild());
      int offset = getOffset(parent, focusPos);

      LogUtils.d(TAG, "requestChildFocus offset=" + offset);
      // 校验滚动位置是否合适
      if (mKeyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
        // 如果向下滑，并且最后一个Layout在界面上，能向下滑动的最大距离为最后一个Layout到下边界的距离
        // 将最后一个Layout对齐到下边界，可以做反向距离纠正
        offset = getOffsetKeyDown(offset);
      } else if (mKeyCode == KeyEvent.KEYCODE_DPAD_UP) {
        // 如果向上滑，并且第一个Layout在界面上，能向上滑动的最大距离为第一个Layout到上边界的距离
        // 将第一个Layout对齐到上边界，可以做反向距离纠正
        offset = getOffsetKeyUp(offset);
      }

      if (isNoFocusDoNothing()) {
        //需求1-初次进入页面首屏不滚动
      } else if (isSameItemDoNothing(focused)) {
        //需求2-同一个item内部不滚动
      } else {
        mRecyclerView.smoothScrollBy(0, offset);
      }
    }
  }

  public void scrollToFocusChildHorizontal(View focused) {
    focused.getDrawingRect(mFocusRect);
    mRecyclerView.offsetDescendantRectToMyCoords(focused, mFocusRect);
    int scrollX = computeScrollDelta(mFocusRect);
    if (scrollX != 0) {
      mRecyclerView.scrollBy(scrollX, 0);
    }
  }

  protected int computeScrollDelta(Rect rect) {
    if (mRecyclerView.getChildCount() == 0) {
      return 0;
    }
    int width = mRecyclerView.getWidth();
    int screenLeft = mRecyclerView.getScrollX();
    int screenRight = screenLeft + width;
    int fadingEdge = mRecyclerView.getHorizontalFadingEdgeLength();
    if (rect.left > 0) {
      screenLeft += fadingEdge;
    }
    if (rect.right < mRecyclerView.getChildAt(0).getWidth()) {
      screenRight -= fadingEdge;
    }

    int scrollXDelta = 0;
    if (rect.right > screenRight && rect.left > screenLeft) {
      if (rect.width() > width) {
        scrollXDelta += (rect.left - screenLeft);
      } else {
        scrollXDelta += (rect.right - screenRight);
      }
      int right = mRecyclerView.getChildAt(0).getRight();
      int distanceToRight = right - screenRight;
      scrollXDelta = Math.min(scrollXDelta, distanceToRight);

    } else if (rect.left < screenLeft && rect.right < screenRight) {
      if (rect.width() > width) {
        scrollXDelta -= (screenRight - rect.right);
      } else {
        scrollXDelta -= (screenLeft - rect.left);
      }
      scrollXDelta = Math.max(scrollXDelta, -mRecyclerView.getScrollX());
    }
    return scrollXDelta;
  }

  private boolean isSameItemDoNothing(View focused) {
    return mFocusedView != null && isViewOfSameRecycleItem(mFocusedView, focused);
  }

  private boolean isNoFocusDoNothing() {
    return mFocusedView == null && getFirstFocusHeightBefore() < mRecyclerView.getHeight();
  }

  private int getFirstFocusHeightBefore() {
    View focusItem = mRecyclerView.getFocusedChild();
    int focusIndex = mRecyclerView.getLayoutManager().getPosition(focusItem);
    if (focusItem != null) {
      View focusItemReal = getRealFocusedChild(focusItem);
      return mRecyclerView.getTotalHeightBefore(focusIndex) + focusItemReal.getHeight();
    }

    return mRecyclerView.getTotalHeightBefore(focusIndex);
  }

  private View getRealFocusedChild(View parent) {
    if (parent instanceof ViewGroup) {
      View focusView = ((ViewGroup) parent).getFocusedChild();
      if (focusView == null) {
        return parent;
      }
      return getRealFocusedChild(focusView);
    }
    return parent;
  }

  private View getParentRecycleItem(View focused) {
    if (focused instanceof HippyPullHeaderView || focused instanceof HippyPullFooterView) {
      return (View) focused.getParent();
    }

    if (focused instanceof HippyListItemView) {
      return focused;
    }

    final ViewParent theParent = focused.getParent();
    if (theParent == null) {
      return null;
    }
    return getParentRecycleItem((View) theParent);
  }

  private int getOffsetKeyUp(int offset) {
    if (mRecyclerView.getAdapter().getItemCount() == mRecyclerView.getChildCount()) {
      View view = mRecyclerView.getChildAt(0);
      int maxTop = view.getBottom() - view.getHeight();
      if (offset > 0) {
        offset = 0;
      } else if (offset < maxTop) {
        offset = maxTop;
      }
      LogUtils.d(TAG, "requestChildFocus offset=" + offset + ",max_top=" + maxTop);
    } else if (offset > 0) {
      offset = 0;
    }
    return offset;
  }

  private int getOffsetKeyDown(int offset) {
    if (mRecyclerView.getAdapter().getItemCount() == mRecyclerView.getChildCount()) {
      View view = mRecyclerView.getChildAt(mRecyclerView.getChildCount() - 1);
      int maxBottom = view.getTop() + view.getHeight() - mRecyclerView.getHeight();
      if (offset < 0) {
        offset = 0;
      } else if (offset > maxBottom) {
        offset = maxBottom;
      }
      LogUtils
        .d(TAG, "requestChildFocus offset=" + offset + ",max_bottom=" + maxBottom);
    } else if (offset < 0) {
      offset = 0;
    }
    return offset;
  }

  private int getOffset(View parent, int focusPos) {
    int offset = 0;
    if (isBottomEdge(focusPos)) {
      offset = parent.getTop() + parent.getHeight() - mRecyclerView.getHeight();
    } else if (isTopEdge(focusPos)) {
      offset = parent.getBottom() - parent.getHeight();
    } else {
      offset = parent.getTop() + parent.getHeight() / 2 - mRecyclerView.getHeight() / 2;
    }
    return offset;
  }

  private boolean isViewOfSameRecycleItem(View view, View view1) {
    if (view == view1) {
      return true;
    }
    ViewHolder viewHolder = mRecyclerView.getChildViewHolder(view);
    ViewHolder viewHolder1 = mRecyclerView.getChildViewHolder(view1);
    if (mRecyclerView.isTheSameRenderNode((HippyRecyclerViewHolder) viewHolder,
      (HippyRecyclerViewHolder) viewHolder1)) {
      return true;
    }

    return false;
  }

  public boolean isTopEdge(int childPosition) {
    LayoutManager layoutManager = mRecyclerView.getLayoutManager();
    if (layoutManager.canScrollVertically()) {
      return childPosition == 0;
    }
    return false;
  }

  public boolean isBottomEdge(int childPosition) {
    LayoutManager layoutManager = mRecyclerView.getLayoutManager();
    if (layoutManager.canScrollVertically()) {
      return childPosition == mRecyclerView.getLayoutManager().getItemCount() - 1;
    }
    return false;
  }

  public int getFirstVisiblePosition() {
    if (mRecyclerView.getChildCount() == 0) {
      return 0;
    } else {
      return getChildAdapterPosition(mRecyclerView.getChildAt(0));
    }
  }

  public int getChildAdapterPosition(View view) {
    LayoutManager layoutManager = mRecyclerView.getLayoutManager();
    for (int i = 0; i < layoutManager.getChildCount(); i++) {
      if (layoutManager.findViewByPosition(i) == view) {
        return i;
      }
    }

    return -1;
  }

  public View focusSearch(View focused, int direction) {
    View nextFocus = StrictFocusFinder.getInstance().findNextFocus(mRecyclerView, focused, direction);
    if (nextFocus == null && mRecyclerView.getParent() != null) {
      return mRecyclerView.getParent().focusSearch(focused, direction);
    }
    return nextFocus;
  }

  public int getChildDrawingOrder(int childCount, int i) {
    View view = mRecyclerView.getFocusedChild();
    if (null != view) {
      int position = getChildAdapterPosition(view) - getFirstVisiblePosition();
      if (position < 0) {
        return i;
      } else {
        if (i == childCount - 1) {
          if (position > i) {
            position = i;
          }
          return position;
        }
        if (i == position) {
          return childCount - 1;
        }
      }
    }
    return i;
  }

  public boolean requestChildRectangleOnScreen(View child, Rect rect, boolean immediate) {
    final int parentLeft = mRecyclerView.getPaddingLeft();
    final int parentRight = mRecyclerView.getWidth() - mRecyclerView.getPaddingRight();

    final int parentTop = mRecyclerView.getPaddingTop();
    final int parentBottom = mRecyclerView.getHeight() - mRecyclerView.getPaddingBottom();

    final int childLeft = child.getLeft() + rect.left;
    final int childTop = child.getTop() + rect.top;

    final int childRight = childLeft + rect.width();
    final int childBottom = childTop + rect.height();

    final int offScreenLeft = Math.min(0, childLeft - parentLeft);
    final int offScreenRight = Math.max(0, childRight - parentRight);

    final int offScreenTop = Math.min(0, childTop - parentTop);
    final int offScreenBottom = Math.max(0, childBottom - parentBottom);

    final boolean canScrollHorizontal = mRecyclerView.getLayoutManager().canScrollHorizontally();
    final boolean canScrollVertical = mRecyclerView.getLayoutManager().canScrollVertically();

    // Favor the "start" layout direction over the end when bringing one side or the other
    // of a large rect into view. If we decide to bring in end because start is already
    // visible, limit the scroll such that start won't go out of bounds.
    final int dx;
    if (canScrollHorizontal) {
      if (/*ViewCompat.getLayoutDirection(this) == ViewCompat.LAYOUT_DIRECTION_RTL*/false) {
        dx = offScreenRight != 0 ? offScreenRight
          : Math.max(offScreenLeft, childRight - parentRight);
      } else {
        dx = offScreenLeft != 0 ? offScreenLeft
          : Math.min(childLeft - parentLeft, offScreenRight);
      }
    } else {
      dx = 0;
    }

    // Favor bringing the top into view over the bottom. If top is already visible and
    // we should scroll to make bottom visible, make sure top does not go out of bounds.
    final int dy;
    if (canScrollVertical) {
      dy = offScreenTop != 0 ? offScreenTop : Math.min(childTop - parentTop, offScreenBottom);
    } else {
      dy = 0;
    }

    if (dx != 0 || dy != 0) {
      if (immediate) {
        mRecyclerView.scrollBy(dx, dy);
      } else {
        mRecyclerView.smoothScrollBy(dx, dy);
      }
      mRecyclerView.postInvalidate();
      return true;
    }
    return false;
  }
}
