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

package com.tencent.renderer.utils;

import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

public class EventUtils {
    public static final String EVENT_IMAGE_ON_LOAD = "load";
    public static final String EVENT_IMAGE_LOAD_ERROR = "error";
    public static final String EVENT_IMAGE_LOAD_END = "loadend";
    public static final String EVENT_IMAGE_LOAD_START = "loadstart";

    public static void send(@NonNull View view, @NonNull String eventName,
            @Nullable Object params) {
        if (view.getContext() instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) view.getContext()).getInstanceId();
            NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            send(view.getId(), nativeRenderer, eventName, params);
        }
    }

    public static void send(int id, @Nullable NativeRender nativeRenderer,
            @NonNull String eventName, @Nullable Object params) {
        if (nativeRenderer != null) {
            nativeRenderer.dispatchUIComponentEvent(id, eventName, params);
        }
    }
}
