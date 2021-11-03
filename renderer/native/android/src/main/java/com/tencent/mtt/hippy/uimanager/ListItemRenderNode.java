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
package com.tencent.mtt.hippy.uimanager;

import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.views.list.IRecycleItemTypeChange;

@SuppressWarnings({"deprecation", "unused"})
public class ListItemRenderNode extends RenderNode {

  public static final String ITEM_VIEW_TYPE = "type";
  public static final String ITEM_STICKY = "sticky";
  public static final String ITEM_VIEW_TYPE_NEW = "itemViewType";

  private boolean mShouldSticky;
  private IRecycleItemTypeChange mRecycleItemTypeChangeListener;

  public ListItemRenderNode(int mId, HippyMap mPropsToUpdate, String className,
          ViewGroup mRootView, ControllerManager componentManager,
      boolean isLazyLoad) {
    super(mId, mPropsToUpdate, className, mRootView, componentManager, isLazyLoad);
    if (mProps.get(ITEM_STICKY) != null) {
      mShouldSticky = mProps.getBoolean(ITEM_STICKY);
    }
  }

  /**
   * y值是前端传入的，前端没有复用的概念，所有y是整个list长度的y值，并不是recyclerView的排版的y。 真正意义上面的y是排版到屏幕范围以内的y，也是子view相对于recyclerView的起始位置的y，也就是子view的top
   * 系统的recyclerView在刷新list前，layoutManager会调用anchorInfo.assignFromView，取第一个view计算当前的
   * anchorInfo，如果整个地方把y值修改了，导致anchorInfo会取不对. 这里保证updateLayout不要改变已经挂在到RecyclerView的view的top
   */
  @Override
  public void updateLayout(int x, int y, int w, int h) {
    super.updateLayout(x, y, w, h);
    View renderView = mComponentManager.mControllerRegistry.getView(mId);
    mY = renderView != null ? renderView.getTop() : 0;
    if (getParent() != null && mComponentManager != null && mComponentManager.getRenderManager()
        != null) { // 若屏幕内node更新引起了item整体变化，需要通知ListView发起dispatchLayout重排版
      RenderManager renderManager = mComponentManager.getRenderManager();
      if (renderManager != null) {
        renderManager.addUpdateNodeIfNeeded(getParent());
      }
    }
  }

  @Override
  public void updateNode(HippyMap map) {
    int oldType = getTypeFromMap(mProps);
    int newType = getTypeFromMap(map);
    if (mRecycleItemTypeChangeListener != null && oldType != newType) {
      mRecycleItemTypeChangeListener.onRecycleItemTypeChanged(oldType, newType, this);
    }
    super.updateNode(map);
    if (mProps.get(ITEM_STICKY) != null) {
      mShouldSticky = mProps.getBoolean(ITEM_STICKY);
    }
  }

  /**
   * 获取item的Type，用于recyclerView的缓存复用
   *
   * @return
   */
  public int getItemViewType() {
    return getTypeFromMap(mProps);
  }

  /**
   * 兼容各种版本的itemType
   */
  private int getTypeFromMap(HippyMap hippyMap) {
    int viewType = hippyMap.getInt(ITEM_VIEW_TYPE);
    if (viewType <= 0 && hippyMap.getString(ITEM_VIEW_TYPE) != null) {
      try {
        viewType = Integer.parseInt(hippyMap.getString(ITEM_VIEW_TYPE));
      } catch (NumberFormatException e) {
        //do nothing
      }
    }
    if (viewType <= 0) {
      viewType = hippyMap.getInt(ListItemRenderNode.ITEM_VIEW_TYPE_NEW);
    }
    return viewType;
  }

  @Override
  public int indexFromParent() {
    return super.indexFromParent();
  }

  public void setRecycleItemTypeChangeListener(
      IRecycleItemTypeChange recycleItemTypeChangeListener) {
    mRecycleItemTypeChangeListener = recycleItemTypeChangeListener;
  }

  public boolean isPullFooter() {
    return false;
  }

  public boolean isPullHeader() {
    return false;
  }

  public boolean shouldSticky() {
    return mShouldSticky;
  }

  /**
   * 异常情况下，如果view已经存在，需要删除它，前提是view没有parent的情况， 有parent的情况出现在sticky属性的view，当前可能是正在置顶的view，这种是不能调用删除的，是正常情况，
   * hasView为true，通过createView是拿到已经存在的view。
   *
   * @return 是否需要删除view
   */
  public boolean needDeleteExistRenderView() {
    if (mComponentManager.hasView(mId)) {
      return mComponentManager.createView(mRootView, mId, mClassName, mProps).getParent() == null;
    }
    return false;
  }

  public boolean isViewExist() {
    return mComponentManager.hasView(mId);
  }

  public boolean hasRootView() {
    return mRootView != null;
  }
}
