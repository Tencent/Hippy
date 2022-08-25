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
  int DIRECTION_LEFT = 0;
  int DIRECTION_TOP = 1;
  int DIRECTION_RIGHT = 2;
  int DIRECTION_BOTTOM = 3;

  void setNestedScrollPriority(int direction, Priority priority);

  Priority getNestedScrollPriority(int direction);

  enum Priority {
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
