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
import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

public class EventUtils {
    // On image loaded.
    public static final String EVENT_IMAGE_ON_LOAD = "load";
    // On image load error.
    public static final String EVENT_IMAGE_LOAD_ERROR = "error";
    // On image load end.
    public static final String EVENT_IMAGE_LOAD_END = "loadEnd";
    // On image load start.
    public static final String EVENT_IMAGE_LOAD_START = "loadStart";

    // On list view header released.
    public static final String EVENT_LIST_HEADER_RELEASED = "headerReleased";
    // On list view header pulling.
    public static final String EVENT_LIST_HEADER_PULLING = "headerPulling";
    // On list view footer released.
    public static final String EVENT_LIST_FOOTER_RELEASED = "footerReleased";
    // On list view footer pulling.
    public static final String EVENT_LIST_FOOTER_PULLING = "footerPulling";
    // On list view item will appear, event of exposure monitor.
    public static final String EVENT_LIST_ITEM_WILL_APPEAR = "willAppear";
    // On list view item appear, event of exposure monitor.
    public static final String EVENT_LIST_ITEM_APPEAR = "appear";
    // On list view item disappear, event of exposure monitor.
    public static final String EVENT_LIST_ITEM_DISAPPEAR = "disappear";
    // On list view item will disappear, event of exposure monitor.
    public static final String EVENT_LIST_ITEM_WILL_DISAPPEAR = "willDisappear";

    // On recycler view scroll to end.
    public static final String EVENT_ON_END_REACHED = "onEndReached";

    // On modal view request close.
    public static final String EVENT_MODAL_REQUEST_CLOSE = "requestClose";
    // On modal view show.
    public static final String EVENT_MODAL_SHOW = "onShow";

    @MainThread
    public static void send(@NonNull View view, @NonNull String eventName,
            @Nullable Object params) {
        if (view.getContext() instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) view.getContext()).getInstanceId();
            NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            send(view.getId(), nativeRenderer, eventName, params);
        }
    }

    @MainThread
    public static void send(int id, @Nullable NativeRender nativeRenderer,
            @NonNull String eventName, @Nullable Object params) {
        if (nativeRenderer != null) {
            nativeRenderer.dispatchUIComponentEvent(id, eventName.toLowerCase(), params);
        }
    }
}
