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

package com.tencent.mtt.hippy.views.scroll;

import android.graphics.Rect;
import android.view.View;
import com.tencent.mtt.hippy.utils.StrictFocusFinder;

public class HippyHorizontalScrollViewFocusHelper {

  private HippyHorizontalScrollView mScrollView;
  private Rect mFocusRect = new Rect();

  public HippyHorizontalScrollViewFocusHelper(HippyHorizontalScrollView scrollView) {
    this.mScrollView = scrollView;
  }

  public View focusSearch(View focused, int direction) {
    View nextFocus = StrictFocusFinder.getInstance().findNextFocus(mScrollView, focused, direction);
    if (nextFocus == null && mScrollView.getParent() != null) {
      return mScrollView.getParent().focusSearch(focused, direction);
    }
    return nextFocus;
  }

  public void scrollToFocusChild(View child) {
    child.getDrawingRect(mFocusRect);
    mScrollView.offsetDescendantRectToMyCoords(child, mFocusRect);
    int scrollX = computeScrollDelta(mFocusRect);
    if (scrollX != 0) {
      mScrollView.scrollBy(scrollX, 0);
    }
  }

  protected int computeScrollDelta(Rect rect) {
    if (mScrollView.getChildCount() == 0) {
      return 0;
    }
    int width = mScrollView.getWidth();
    int screenLeft = mScrollView.getScrollX();
    int screenRight = screenLeft + width;
    int fadingEdge = mScrollView.getHorizontalFadingEdgeLength();
    if (rect.left > 0) {
      screenLeft += fadingEdge;
    }
    if (rect.right < mScrollView.getChildAt(0).getWidth()) {
      screenRight -= fadingEdge;
    }

    int scrollXDelta = 0;
    if (rect.right > screenRight && rect.left > screenLeft) {
      if (rect.width() > width) {
        scrollXDelta += (rect.left - screenLeft);
      } else {
        scrollXDelta += (rect.right - screenRight);
      }
      int right = mScrollView.getChildAt(0).getRight();
      int distanceToRight = right - screenRight;
      scrollXDelta = Math.min(scrollXDelta, distanceToRight);

    } else if (rect.left < screenLeft && rect.right < screenRight) {
      if (rect.width() > width) {
        scrollXDelta -= (screenRight - rect.right);
      } else {
        scrollXDelta -= (screenLeft - rect.left);
      }
      scrollXDelta = Math.max(scrollXDelta, -mScrollView.getScrollX());
    }
    return scrollXDelta;
  }
}
