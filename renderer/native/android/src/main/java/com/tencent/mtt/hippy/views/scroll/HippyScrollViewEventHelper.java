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

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.EventUtils;
import java.util.HashMap;
import java.util.Map;

public class HippyScrollViewEventHelper {

    public static final long MOMENTUM_DELAY = 20;

    protected static void emitScrollEvent(@NonNull ViewGroup view, @NonNull String eventName) {
        if (!EventUtils.checkRegisteredEvent(view, eventName)) {
            return;
        }
        Map<String, Object> contentInset = new HashMap<>();
        contentInset.put("top", 0);
        contentInset.put("bottom", 0);
        contentInset.put("left", 0);
        contentInset.put("right", 0);
        Map<String, Object> contentOffset = new HashMap<>();
        contentOffset.put("x", PixelUtil.px2dp(view.getScrollX()));
        contentOffset.put("y", PixelUtil.px2dp(view.getScrollY()));
        Map<String, Object> contentSize = new HashMap<>();
        contentSize.put("width", PixelUtil
                .px2dp(view.getChildCount() > 0 ? view.getChildAt(0).getWidth() : view.getWidth()));
        contentSize.put("height", PixelUtil
                .px2dp(view.getChildCount() > 0 ? view.getChildAt(0).getHeight()
                        : view.getHeight()));
        Map<String, Object> layoutMeasurement = new HashMap<>();
        layoutMeasurement.put("width", PixelUtil.px2dp(view.getWidth()));
        layoutMeasurement.put("height", PixelUtil.px2dp(view.getHeight()));
        Map<String, Object> params = new HashMap<>();
        params.put("contentInset", contentInset);
        params.put("contentOffset", contentOffset);
        params.put("contentSize", contentSize);
        params.put("layoutMeasurement", layoutMeasurement);
        EventUtils.send(view, eventName, params);
    }
}
