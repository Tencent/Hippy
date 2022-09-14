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
package com.tencent.mtt.hippy.views.common;

import androidx.core.view.NestedScrollingChild;
import androidx.core.view.NestedScrollingChild2;
import androidx.core.view.NestedScrollingParent;
import androidx.core.view.NestedScrollingParent2;

public interface HippyNestedScrollComponent {

  String PROP_PRIORITY = "nestedScrollPriority";
  String PROP_LEFT_PRIORITY = "nestedScrollLeftPriority";
  String PROP_TOP_PRIORITY = "nestedScrollTopPriority";
  String PROP_RIGHT_PRIORITY = "nestedScrollRightPriority";
  String PROP_BOTTOM_PRIORITY = "nestedScrollBottomPriority";

  String PRIORITY_PARENT = "parent";
  String PRIORITY_SELF = "self";
  String PRIORITY_NONE = "none";

  int DIRECTION_INVALID = -1;
  int DIRECTION_ALL = 0;
  int DIRECTION_LEFT = 1;
  int DIRECTION_TOP = 2;
  int DIRECTION_RIGHT = 3;
  int DIRECTION_BOTTOM = 4;

  void setNestedScrollPriority(int direction, Priority priority);

  Priority getNestedScrollPriority(int direction);

  enum Priority {
    NOT_SET,
    PARENT,
    SELF,
    NONE,
  }

  /**
   * 嵌套滚动接口声明
   */
  interface HippyNestedScrollTarget extends HippyNestedScrollComponent, NestedScrollingParent, NestedScrollingChild {
  }

  /**
   * 比{@link HippyNestedScrollTarget}增加了惯性滚动类型
   */
  interface HippyNestedScrollTarget2 extends HippyNestedScrollTarget, NestedScrollingParent2, NestedScrollingChild2 {
  }
}
