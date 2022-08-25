package com.tencent.mtt.hippy.views.common;

import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_BOTTOM;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_LEFT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_RIGHT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_TOP;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_NONE;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_PARENT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_SELF;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.Priority;

import android.view.View;

import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.HippyNestedScrollTarget;

public class HippyNestedScrollHelper {

  public static Priority priorityOf(String name) {
    switch (name) {
      case PRIORITY_SELF:
        return Priority.SELF;
      case PRIORITY_PARENT:
        return Priority.PARENT;
      case PRIORITY_NONE:
        return Priority.NONE;
      default:
        throw new RuntimeException("Invalid priority: " + name);
    }
  }

  public static Priority priorityOfX(View target, int dx) {
    if (dx == 0) {
      return Priority.NONE;
    }
    if (!(target instanceof HippyNestedScrollTarget)) {
      return Priority.SELF;
    }
    return ((HippyNestedScrollTarget) target).getNestedScrollPriority(dx > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT);
  }

  public static Priority priorityOfY(View target, int dy) {
    if (dy == 0) {
      return Priority.NONE;
    }
    if (!(target instanceof HippyNestedScrollTarget)) {
      return Priority.SELF;
    }
    return ((HippyNestedScrollTarget) target).getNestedScrollPriority(dy > 0 ? DIRECTION_TOP : DIRECTION_BOTTOM);
  }
}
