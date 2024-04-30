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

import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_BOTTOM;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_LEFT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_RIGHT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.DIRECTION_TOP;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_NONE;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_PARENT;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.PRIORITY_SELF;
import static com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.Priority;

import android.view.View;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
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
            case HippyControllerProps.DEFAULT:
                return Priority.NOT_SET;
            default:
                throw new RuntimeException("Invalid priority: " + name);
        }
    }

    public static Priority priorityOfX(View target, int dx) {
        // not scrolling, priority is NONE
        if (dx == 0) {
            return Priority.NONE;
        }
        // non-HippyNestedScrollTarget View, priority is SELF
        if (!(target instanceof HippyNestedScrollTarget)) {
            return Priority.SELF;
        }
        // get priority from target by direction
        return ((HippyNestedScrollTarget) target).getNestedScrollPriority(
            dx > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT);
    }

    public static Priority priorityOfY(View target, int dy) {
        // not scrolling, priority is NONE
        if (dy == 0) {
            return Priority.NONE;
        }
        // non-HippyNestedScrollTarget View, priority is SELF
        if (!(target instanceof HippyNestedScrollTarget)) {
            return Priority.SELF;
        }
        // get priority from target by direction
        return ((HippyNestedScrollTarget) target).getNestedScrollPriority(
            dy > 0 ? DIRECTION_TOP : DIRECTION_BOTTOM);
    }
}
