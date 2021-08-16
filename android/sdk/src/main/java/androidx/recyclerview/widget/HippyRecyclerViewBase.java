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

package androidx.recyclerview.widget;


import android.content.Context;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.util.AttributeSet;
import androidx.recyclerview.widget.LinearLayoutManager;

public class HippyRecyclerViewBase extends EasyRecyclerView {

  public HippyRecyclerViewBase(@NonNull Context context) {
    super(context);
  }

  public HippyRecyclerViewBase(@NonNull Context context, @Nullable AttributeSet attrs) {
    super(context, attrs);
  }

  public HippyRecyclerViewBase(@NonNull Context context, @Nullable AttributeSet attrs,
      int defStyle) {
    super(context, attrs, defStyle);
  }

  /**
   * @param position 从哪一个数据位置开始排版,将position的item置顶
   * @param offset   相对于RecyclerView底部的offset，offset>0：内容下移，offset<0：内容上移
   */
  public void scrollToPositionWithOffset(int position, int offset) {
    if (mLayoutSuppressed) {
      return;
    }
    stopScroll();
    if (this.mLayout == null) {
      android.util.Log.e("RecyclerView",
          "Cannot scroll to position a LayoutManager set. Call setLayoutManager with a non-null argument.");
    } else {
      LayoutManager layoutManager = getLayoutManager();
      if (layoutManager instanceof LinearLayoutManager) {
        ((LinearLayoutManager) layoutManager).scrollToPositionWithOffset(position, offset);
      } else {
        this.mLayout.scrollToPosition(position);
      }
      this.awakenScrollBars();
    }
  }

  @Override
  String exceptionLabel() {
    return super.exceptionLabel() + ",state:" + getStateInfo();
  }

  public String getStateInfo() {
    if (mState != null) {
      return mState.toString();
    }
    return null;
  }
}
