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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.utils.EventUtils;

public class HippyViewEvent {

    private final String mEventName;

    public HippyViewEvent(@NonNull String eventName) {
        mEventName = eventName;
    }

    public void send(@NonNull View view, @Nullable Object params) {
        EventUtils.sendComponentEvent(view, mEventName, params);
    }
}
