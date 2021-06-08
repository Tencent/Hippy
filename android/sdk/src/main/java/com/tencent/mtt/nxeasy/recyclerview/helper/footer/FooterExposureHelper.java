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

package com.tencent.mtt.nxeasy.recyclerview.helper.footer;

import android.graphics.Rect;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import android.view.View.OnAttachStateChangeListener;

public class FooterExposureHelper extends RecyclerView.OnScrollListener implements
    OnAttachStateChangeListener {

  private View exposureView;
  private IFooterLoadMoreListener footerListener;
  private boolean isViewVisible = false;
  private float visibleRate = 0.3f;
  private Runnable checkVisibleRunnable;

  public FooterExposureHelper() {
    checkVisibleRunnable = new Runnable() {
      @Override
      public void run() {
        if (isViewChangeToVisible(exposureView)) {
          notifyFooterAppeared();
        }
      }
    };
  }

  /**
   * 设置显示view的面积伐值，超过比例就回调显示
   *
   * @param visibleRate (0,1] 1: 100%显示
   */
  public void setVisibleRate(float visibleRate) {
    if (visibleRate > 0) {
      this.visibleRate = Math.min(visibleRate, 1);
    }
  }

  /**
   * @param exposureView 设置需要监控曝光的View
   */
  public void setExposureView(View exposureView) {
    if (this.exposureView != null) {
      this.exposureView.removeCallbacks(checkVisibleRunnable);
      this.exposureView.removeOnAttachStateChangeListener(this);
    }
    isViewVisible = false;
    this.exposureView = exposureView;
    if (this.exposureView != null) {
      this.exposureView.addOnAttachStateChangeListener(this);
    }
  }

  public void setFooterListener(IFooterLoadMoreListener footerListener) {
    this.footerListener = footerListener;
  }

  /**
   * 判断一个view在屏幕上是否可见
   */
  public boolean isViewChangeToVisible(View view) {
    if (isViewVisible) {
      return false;
    }
    if (!view.isShown()) {
      isViewVisible = false;
      return false;
    }
    Rect bounds = new Rect();
    boolean ret = view.getGlobalVisibleRect(bounds);
    int totalArea = view.getWidth() * view.getHeight();

    if (!ret || totalArea == 0) {
      isViewVisible = false;
      return false;
    }
    int viewedArea = bounds.width() * bounds.height();
    isViewVisible = viewedArea * 1f / totalArea > visibleRate;
    return isViewVisible;
  }

  void notifyFooterAppeared() {
    if (footerListener != null) {
      footerListener.onFooterLoadMore();
    }
  }

  @Override
  public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
    //onLayout排版的时候会调用过来，这里不能在排版的时候去请求数据，需要post一下
    if (exposureView != null) {
      exposureView.removeCallbacks(checkVisibleRunnable);
      exposureView.post(checkVisibleRunnable);
    }
  }

  @Override
  public void onViewDetachedFromWindow(View v) {
    isViewVisible = false;
  }

  @Override
  public void onViewAttachedToWindow(View v) {

  }
}
