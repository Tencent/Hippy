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
package com.tencent.mtt.hippy.views.list;

import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.supportui.views.recyclerview.ContentHolder;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;

public class NodeHolder extends ContentHolder {

  public RenderNode mBindNode;
  public boolean isCreated = true;

  @Override
  public void inTraversals(int traversalPurpose, int position, RecyclerViewBase recyclerView) {
    super.inTraversals(traversalPurpose, position, recyclerView);
    if (recyclerView != null) {
      recyclerView.handleInTraversal(traversalPurpose, position, mContentView);
    }
  }
}
