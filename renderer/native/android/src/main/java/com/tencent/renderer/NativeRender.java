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

package com.tencent.renderer;

import android.view.View;

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.common.BaseEngineContext;
import com.tencent.mtt.hippy.uimanager.RenderManager;

import com.tencent.renderer.component.image.ImageDecoderAdapter;
import com.tencent.renderer.component.image.ImageLoaderAdapter;
import com.tencent.renderer.component.text.FontAdapter;
import com.tencent.renderer.node.VirtualNode;

import com.tencent.renderer.utils.EventUtils.EventType;
import com.tencent.vfs.VfsManager;
import java.util.Map;
import java.util.concurrent.Executor;

public interface NativeRender extends RenderExceptionHandler, RenderLogHandler {

    @NonNull
    RenderManager getRenderManager();

    @Nullable
    View getRootView(int rootId);

    @Nullable
    View getRootView(@NonNull View view);

    String getBundlePath();

    @Nullable
    ImageLoaderAdapter getImageLoader();

    @Nullable
    VfsManager getVfsManager();

    @Nullable
    FontAdapter getFontAdapter();

    @Nullable
    ImageDecoderAdapter getImageDecoderAdapter();

    @Nullable
    Executor getBackgroundExecutor();

    @Nullable
    BaseEngineContext getEngineContext();

    int getEngineId();

    /**
     * Post invalidate to target view delayed by milliseconds, this method should only be called on
     * the main thread.
     *
     * @param id view id
     * @param delayMilliseconds delayed by milliseconds
     * @see com.tencent.renderer.component.text.TextImageSpan#postInvalidateDelayed(long)
     */
    @MainThread
    void postInvalidateDelayed(int rootId, int id, long delayMilliseconds);

    /**
     * Get customize virtual node from host. For be able to customize some behavior of virtual node,
     * host can define his own virtual node through inherit from base virtual node.
     *
     * @param rootId root node id
     * @param id node id
     * @param pid node parent id
     * @param index sequence number of child node in parent node
     * @param className class name of node
     * @param props node props
     */
    @Nullable
    VirtualNode createVirtualNode(int rootId, int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props);

    void onFirstPaint();

    void onFirstContentfulPaint();

    void onSizeChanged(int rootId, int width, int height, int oldWidth, int oldHeight);

    void onSizeChanged(int rootId, int nodeId, int width, int height, boolean isSync);

    void updateDimension(int width, int height, boolean shouldUseScreenDisplay,
            boolean systemUiVisibilityChanged);

    void dispatchEvent(int rootId, int nodeId, @NonNull String eventName,
            @Nullable Object params, boolean useCapture, boolean useBubble, EventType eventType);

    void doPromiseCallBack(int result, long callbackId, String functionName, int rootId, int nodeId,
            Object params);

    void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

    void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);
}
