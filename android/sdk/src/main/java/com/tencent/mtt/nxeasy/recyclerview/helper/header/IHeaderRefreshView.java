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

package com.tencent.mtt.nxeasy.recyclerview.helper.header;

import android.view.View;

public interface IHeaderRefreshView {

  /**
   * 状态机： 1:HEADER_STATUS_FOLDED -> HEADER_STATUS_DRAGGING 2:HEADER_STATUS_DRAGGING->
   * HEADER_STATUS_TO_REFRESH ，或者HEADER_STATUS_DRAGGING-> HEADER_STATUS_TO_FOLD
   * 3:HEADER_STATUS_DRAG_TO_REFRESH -> HEADER_STATUS_REFRESHING 4:HEADER_STATUS_CLICK_TO_REFRESH ->
   * HEADER_STATUS_REFRESHING 5:HEADER_STATUS_REFRESHING -> HEADER_STATUS_TO_FOLD
   * 6:HEADER_STATUS_TO_FOLD -> HEADER_STATUS_FOLDED
   */
  int HEADER_STATUS_FOLDED = 0;//收起状态
  int HEADER_STATUS_DRAGGING = 1;//拖动状态
  int HEADER_STATUS_DRAG_TO_REFRESH = 2;//下拉拖动触发刷新
  int HEADER_STATUS_CLICK_TO_REFRESH = 3;//外部点击触发刷新
  int HEADER_STATUS_REFRESHING = 4;//正在刷新
  int HEADER_STATUS_TO_FOLD = 5;//去向收起

  View getView();

  void onStartDrag();

  void onHeaderHeightChanged(int sumOffset);

  void onRefreshing();

  int getContentHeight();

  void onFolded();
}
