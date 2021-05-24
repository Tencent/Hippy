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

package androidx.recyclerview.widget;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView.Adapter;
import androidx.recyclerview.widget.RecyclerView.LayoutParams;
import androidx.recyclerview.widget.RecyclerView.State;
import android.util.AttributeSet;
import android.view.View;
import java.util.HashMap;

public class EasyLinearLayoutManager extends LinearLayoutManager {

  /**
   * 无效的高度
   */
  public static final int INVALID_HEIGHT = -1;
  private static final LayoutParams ITEM_LAYOUT_PARAMS = new LayoutParams(0, 0);
  /**
   * 由于排版后才知道对应item的高度，topMargin和bottomMargin，所以这里缓存一下这些值
   */
  protected HashMap<Integer, Integer> itemHeightMaps = new HashMap<>();
  protected HashMap<Integer, Integer> itemTopMarginMaps = new HashMap<>();
  protected HashMap<Integer, Integer> itemBottomMarginMaps = new HashMap<>();

  public EasyLinearLayoutManager(Context context) {
    super(context);
  }

  public EasyLinearLayoutManager(Context context, int orientation, boolean reverseLayout) {
    super(context, orientation, reverseLayout);
  }

  public EasyLinearLayoutManager(Context context, AttributeSet attrs, int defStyleAttr,
      int defStyleRes) {
    super(context, attrs, defStyleAttr, defStyleRes);
  }

  /**
   * 排版完成后，缓存view的排版信息
   */
  @Override
  public void layoutDecoratedWithMargins(@NonNull View child, int left, int top, int right,
      int bottom) {
    super.layoutDecoratedWithMargins(child, left, top, right, bottom);
    cacheItemLayoutParams(bottom - top, (LayoutParams) child.getLayoutParams(), getPosition(child));
  }

  /**
   * 缓存Item排版信息，缓存信息有两种来源 一种是排版过程中的得到实际上屏的排版信息 {@link #layoutDecoratedWithMargins(View, int, int,
   * int, int)} 一种是从adapter获取的item的预排版信息 {@link #getItemHeightFromAdapter(int)}
   *
   * @param height       item的高度
   * @param layoutParams 排版参数
   * @param position     位置
   */
  private void cacheItemLayoutParams(int height, LayoutParams layoutParams, int position) {
    itemBottomMarginMaps.put(position, layoutParams.bottomMargin);
    itemTopMarginMaps.put(position, layoutParams.topMargin);
    itemHeightMaps.put(position, height);
  }

  /**
   * 从adapter 获取position对应的排版信息，这里不需要排版，是item预先指定的高度
   */
  int getItemHeightFromAdapter(int position) {
    Adapter adapter = mRecyclerView.getAdapter();
    if (adapter instanceof IItemLayoutParams) {
      IItemLayoutParams layoutInfo = (IItemLayoutParams) adapter;
      resetLayoutParams();
      layoutInfo.getItemLayoutParams(position, ITEM_LAYOUT_PARAMS);
      if (ITEM_LAYOUT_PARAMS.height >= 0) {
        cacheItemLayoutParams(ITEM_LAYOUT_PARAMS.height, ITEM_LAYOUT_PARAMS, position);
        return ITEM_LAYOUT_PARAMS.height + ITEM_LAYOUT_PARAMS.bottomMargin
            + ITEM_LAYOUT_PARAMS.topMargin;
      }
    }
    return INVALID_HEIGHT;
  }

  /**
   * 清除之前的缓存数据,ITEM_LAYOUT_PARAMS 不是最终用来排版的，只是一个参数的载体
   */
  private static void resetLayoutParams() {
    ITEM_LAYOUT_PARAMS.height = 0;
    ITEM_LAYOUT_PARAMS.topMargin = 0;
    ITEM_LAYOUT_PARAMS.rightMargin = 0;
    ITEM_LAYOUT_PARAMS.leftMargin = 0;
    ITEM_LAYOUT_PARAMS.bottomMargin = 0;
  }

  /**
   * 计算position以前（包含position）的高度，如果发现其中有一个没有缓存，那么得出来的值是无效的
   */
  int getHeightUntilPosition(int position) {
    int totalHeight = 0;
    for (int i = 0; i <= position; i++) {
      Integer height = itemHeightMaps.get(i);
      if (height == null) {
        height = getItemHeightFromAdapter(i);
      }
      if (height != null && height != INVALID_HEIGHT) {
        totalHeight += height;
      } else {
        return INVALID_HEIGHT;
      }
    }
    return totalHeight;
  }

  /**
   * 由于父类的computeVerticalScrollOffset是基于平均值计算高度。对于Item类型和高度不一样的情况，计算是有误差的。
   * 用第一个可见view的前面总的内容高度减去第一个可见view的底部位置
   *
   * @return 当前的内容偏移，也就是被推出顶部以外的内容高度。
   */
  @Override
  public int computeVerticalScrollOffset(State state) {
    if (getChildCount() <= 0 || getItemCount() <= 0) {
      return 0;
    }
    int firstVisiblePosition = findFirstVisibleItemPosition();
    View firstVisibleView = findViewByPosition(firstVisiblePosition);
    int heightUntilPosition = getHeightUntilPosition(firstVisiblePosition);
    if (firstVisibleView != null && heightUntilPosition != INVALID_HEIGHT) {
      return heightUntilPosition - mOrientationHelper.getDecoratedEnd(firstVisibleView);
    }
    return super.computeVerticalScrollOffset(state);
  }


  /**
   * 由于父类的computeVerticalScrollRange是基于平均值计算高度。对于Item类型和高度不一样的情况，计算是有误差的。
   *
   * @return 内容的总高度
   **/
  @Override
  public int computeVerticalScrollRange(State state) {
    int heightUntilPosition = getHeightUntilPosition(getItemCount() - 1);
    if (heightUntilPosition != INVALID_HEIGHT) {
      return heightUntilPosition;
    }
    return super.computeVerticalScrollRange(state);
  }
}
