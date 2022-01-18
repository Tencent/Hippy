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

import android.view.ViewGroup;
import androidx.annotation.Nullable;
import com.tencent.link_supplier.proxy.framework.FontAdapter;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;
import java.util.HashMap;

public interface NativeRender extends NativeRenderExceptionHandler {

    RenderManager getRenderManager();

    DomManager getDomManager();

    ViewGroup getRootView();

    Object getCustomViewCreator();

    String getBundlePath();

    IImageLoaderAdapter getImageLoaderAdapter();

    @Nullable
    FontAdapter getFontAdapter();

    void onFirstViewAdded();

    void onSizeChanged(int w, int h, int oldw, int oldh);

    void updateModalHostNodeSize(int id, int width, int height);

    void updateDimension(boolean shouldRevise, HashMap<String, Object> dimension,
            boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged);

    void dispatchUIComponentEvent(int id, String eventName, @Nullable Object param);

    void dispatchNativeGestureEvent(int id, String eventName, Object params);

    void dispatchCustomEvent(int id, String eventName, Object params, boolean useCapture,
            boolean useBubble);

    void doPromiseCallBack(int result, long callbackId, String functionName, int nodeId,
            Object params);

    void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

    void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);
}
