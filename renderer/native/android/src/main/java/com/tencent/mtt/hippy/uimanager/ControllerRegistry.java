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

import android.content.Context;
import android.util.SparseArray;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRenderException;

import java.util.HashMap;
import java.util.Map;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.GET_VIEW_CONTROLLER_FAILED_ERR;

public class ControllerRegistry {

    @NonNull
    private final Map<Integer, SparseArray<View>> mViews = new HashMap<>();
    @NonNull
    private final SparseArray<View> mRootViews = new SparseArray<>();
    @NonNull
    private final Map<String, ControllerHolder> mControllers =  new HashMap<>();
    @NonNull
    private final Renderer mRenderer;

    public ControllerRegistry(@NonNull Renderer renderer) {
        mRenderer = renderer;
    }

    public void addControllerHolder(String name, ControllerHolder controllerHolder) {
        mControllers.put(name, controllerHolder);
    }

    public ControllerHolder getControllerHolder(String className) {
        return mControllers.get(className);
    }

    @SuppressWarnings({"rawtypes"})
    @Nullable
    public HippyViewController getViewController(@NonNull String className) {
        ControllerHolder holder = mControllers.get(className);
        if (holder == null) {
            NativeRenderException exception = new NativeRenderException(
                    GET_VIEW_CONTROLLER_FAILED_ERR, "Unknown class name=" + className);
            mRenderer.handleRenderException(exception);
            return null;
        }
        return holder.getViewController();
    }

    @Nullable
    public View getView(int rootId, int id) {
        if (rootId == id) {
            return getRootView(rootId);
        }
        SparseArray<View> views = mViews.get(rootId);
        if (views != null) {
            return views.get(id);
        }
        return null;
    }

    public int getRootViewCount() {
        return mRootViews.size();
    }

    public int getRootIdAt(int index) {
        return mRootViews.keyAt(index);
    }

    public View getRootView(int id) {
        return mRootViews.get(id);
    }

    public void addView(@NonNull View view, int rootId, int id) {
        SparseArray<View> views = mViews.get(rootId);
        if (views == null) {
            views = new SparseArray<>();
            views.put(id, view);
            mViews.put(rootId, views);
        } else {
            views.put(id, view);
        }
    }

    public void addView(@NonNull View view) {
        Context context = view.getContext();
        if (!(context instanceof NativeRenderContext)) {
            return;
        }
        int rootId = ((NativeRenderContext) context).getRootId();
        addView(view, rootId, view.getId());
    }

    public void removeView(int rootId, int id) {
        SparseArray<View> views = mViews.get(rootId);
        if (views != null) {
            views.remove(id);
        }
    }

    public void removeView(@NonNull View view) {
        Context context = view.getContext();
        if (!(context instanceof NativeRenderContext)) {
            return;
        }
        int rootId = ((NativeRenderContext) context).getRootId();
        removeView(rootId, view.getId());
    }

    public void addRootView(@NonNull View rootView) {
        mRootViews.put(rootView.getId(), rootView);
    }

    public void removeRootView(int id) {
        mRootViews.remove(id);
    }

}
