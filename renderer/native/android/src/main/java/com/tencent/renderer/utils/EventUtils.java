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

import android.content.Context;
import android.view.View;
import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.renderer.node.RenderNode;
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
    // On image load progress.
    public static final String EVENT_IMAGE_LOAD_PROGRESS = "progress";

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
    public static final String EVENT_RECYCLER_END_REACHED = "endReached";
    public static final String EVENT_RECYCLER_LOAD_MORE = "loadMore";
    // On recycler view first screen ready.
    public static final String EVENT_RECYCLER_LIST_READY = "initialListReady";

    // On pull footer view released.
    public static final String EVENT_PULL_FOOTER_RELEASED = "footerReleased";
    // On pull footer view pulling.
    public static final String EVENT_PULL_FOOTER_PULLING = "footerPulling";
    // On pull header view pulling.
    public static final String EVENT_PULL_HEADER_PULLING = "headerPulling";
    // On pull header view released.
    public static final String EVENT_PULL_HEADER_RELEASED = "headerReleased";

    // On modal view request close.
    public static final String EVENT_MODAL_REQUEST_CLOSE = "requestClose";
    // On modal view show.
    public static final String EVENT_MODAL_SHOW = "show";
    // On modal orientation changed.
    public static final String EVENT_ORIENTATION_CHANGED = "orientationChange";

    // On refresh wrapper view refresh.
    public static final String EVENT_REFRESH_WRAPPER_REFRESH = "refresh";
    // On refresh wrapper view scroll.
    public static final String EVENT_REFRESH_WRAPPER_SCROLL = "scroll";

    // On view page item will appear, event of exposure monitor.
    public static final String EVENT_PAGE_ITEM_WILL_APPEAR = "willAppear";
    // On view page item appear, event of exposure monitor.
    public static final String EVENT_PAGE_ITEM_DID_APPEAR = "didAppear";
    // On view page item will disappear, event of exposure monitor.
    public static final String EVENT_PAGE_ITEM_WILL_DISAPPEAR = "willDisAppear";
    // On view page item disappear, event of exposure monitor.
    public static final String EVENT_PAGE_ITEM_DID_DISAPPEAR = "didDisAppear";
    // On view page scroll.
    public static final String EVENT_PAGE_SCROLL = "pageScroll";
    // On view page scroll state changed.
    public static final String EVENT_PAGE_SCROLL_STATE_CHANGED = "pageScrollStateChanged";
    // On view page selected.
    public static final String EVENT_PAGE_SELECTED = "pageSelected";

    // On waterfall view footer appeared.
    public static final String EVENT_WATERFALL_FOOTER_APPEARED = "footerAppeared";
    // On waterfall view refresh.
    public static final String EVENT_WATERFALL_REFRESH = "refresh";
    // On waterfall view scroll report.
    public static final String EVENT_WATERFALL_SCROLL_REPORT = "scrollForReport";
    // On waterfall view exposure report.
    public static final String EVENT_WATERFALL_EXPOSURE_REPORT = "exposureReport";
    // On waterfall view end reached.
    public static final String EVENT_WATERFALL_END_REACHED = "endReached";

    // On scroll view begin drag.
    public static final String EVENT_SCROLLER_BEGIN_DRAG = "scrollBeginDrag";
    // On scroll view end drag.
    public static final String EVENT_SCROLLER_END_DRAG = "scrollEndDrag";
    // On scroll view on scroll.
    public static final String EVENT_SCROLLER_ON_SCROLL = "scroll";
    // On scroll view momentum begin.
    public static final String EVENT_SCROLLER_MOMENTUM_BEGIN = "momentumScrollBegin";
    // On scroll view momentum end.
    public static final String EVENT_SCROLLER_MOMENTUM_END = "momentumScrollEnd";

    public enum EventType {
        EVENT_TYPE_COMPONENT,
        EVENT_TYPE_GESTURE,
        EVENT_TYPE_CUSTOM,
        EVENT_TYPE_ROOT
    }

    /**
     * Dispatch UI component event, such as onLayout, onScroll, onInitialListReady.
     *
     * @param view target view
     * @param eventName target event name
     * @param params event extra params object
     */
    @MainThread
    public static void sendComponentEvent(@Nullable View view, @NonNull String eventName,
            @Nullable Object params) {
        if (view != null) {
            // UI component event default disable capture and bubble phase,
            // can not enable both in native and js.
            send(view, view.getId(), eventName, params, false, false,
                    EventType.EVENT_TYPE_COMPONENT);
        }
    }

    @MainThread
    public static void sendComponentEvent(@NonNull RenderNode node, @NonNull String eventName,
            @Nullable Object params) {
        send(node, eventName, params, false, false, EventType.EVENT_TYPE_COMPONENT);
    }

    /**
     * Dispatch gesture event, such as onClick, onLongClick, onPressIn, onPressOut, onTouchDown,
     * onTouchMove, onTouchEnd, onTouchCancel.
     *
     * @param view target view
     * @param eventName target event name
     * @param params event extra params object
     */
    @SuppressWarnings("unused")
    @MainThread
    public static void sendGestureEvent(@NonNull View view, @NonNull String eventName,
            @Nullable Object params) {
        // Gesture event default enable capture and bubble phase, can not disable in native,
        // but can stop propagation in js.
        send(view, view.getId(), eventName, params, true, true, EventType.EVENT_TYPE_GESTURE);
    }

    @MainThread
    public static void sendGestureEvent(@NonNull View view, int nodeId, @NonNull String eventName,
            @Nullable Object params) {
        send(view, nodeId, eventName, params, true, true, EventType.EVENT_TYPE_GESTURE);
    }

    /**
     * Dispatch custom event which capture and bubble state can set by user
     *
     * @param view target view
     * @param eventName target event name
     * @param params event extra params object
     * @param useCapture enable event capture
     * @param useBubble enable event bubble
     */
    @SuppressWarnings("unused")
    @MainThread
    public static void sendCustomEvent(@NonNull View view, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble) {
        send(view, view.getId(), eventName, params, useCapture, useBubble,
                EventType.EVENT_TYPE_CUSTOM);
    }

    /**
     * Dispatch root event, such as frameUpdate.
     *
     * @param rendererId renderer instance id
     * @param rootId root node id
     * @param eventName target event name
     * @param params event extra params object
     */
    @MainThread
    public static void sendRootEvent(int rendererId, int rootId, @NonNull String eventName,
            @Nullable Object params) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(rendererId);
        if (nativeRenderer != null) {
            nativeRenderer.dispatchEvent(rootId, rootId, eventName, params,
                    false, false, EventType.EVENT_TYPE_ROOT);
        }
    }

    /**
     * Check whether the specified event has been registered to target view.
     *
     * @param view target view
     * @param eventName target event name
     * @return the check result.
     */
    @MainThread
    public static boolean checkRegisteredEvent(@NonNull View view, @NonNull String eventName) {
        if (view.getContext() instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) view.getContext()).getInstanceId();
            int rootId = ((NativeRenderContext) view.getContext()).getRootId();
            NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            if (nativeRenderer == null) {
                return false;
            }
            RenderManager renderManager = nativeRenderer.getRenderManager();
            return renderManager.checkRegisteredEvent(rootId, view.getId(),
                    eventName.toLowerCase());
        }
        return false;
    }

    private static void send(@NonNull View view, int nodeId, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble, EventType eventType) {
        Context context = view.getContext();
        if (context instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) context).getInstanceId();
            int rootId = ((NativeRenderContext) context).getRootId();
            NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(instanceId);
            if (nativeRenderer != null) {
                nativeRenderer.dispatchEvent(rootId, nodeId, eventName, params,
                        useCapture, useBubble, eventType);
            }
        }
    }

    private static void send(@NonNull RenderNode node, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble, EventType eventType) {
        NativeRender nativeRenderer = node.getNativeRender();
        nativeRenderer.dispatchEvent(node.getRootId(), node.getId(), eventName, params, useCapture,
                useBubble, eventType);
    }
}
