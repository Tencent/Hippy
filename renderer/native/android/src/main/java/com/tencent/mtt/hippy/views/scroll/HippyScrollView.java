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

package com.tencent.mtt.hippy.views.scroll;

import com.tencent.mtt.hippy.common.HippyMap;

public interface HippyScrollView {

    void setScrollEnabled(boolean enabled);

    void showScrollIndicator(boolean showScrollIndicator);

    void setFlingEnabled(boolean flag);

    @SuppressWarnings("deprecation")
    void setContentOffset4Reuse(HippyMap offsetMap);

    void setPagingEnabled(boolean pagingEnabled);

    void setScrollEventThrottle(int scrollEventThrottle);

    void callSmoothScrollTo(int x, int y, int duration);

    void setScrollMinOffset(int scrollMinOffset);

    void setInitialContentOffset(int offset);

    void updateContentOffset();
}
