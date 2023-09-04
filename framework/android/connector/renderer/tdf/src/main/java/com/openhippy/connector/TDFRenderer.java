/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2023 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.openhippy.connector;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.FrameworkProxy;
import com.tencent.renderer.RenderProxy;
import java.util.List;
import java.util.Map;

@SuppressWarnings("JavaJniMissingFunction")
public class TDFRenderer implements RenderConnector {

    private int mInstanceId;
    @Nullable
    private RenderProxy mRenderer;

    public TDFRenderer() {
        mInstanceId = createTDFRenderManager(PixelUtil.getDensity());
        mRenderer = new com.tencent.renderer.TDFRenderer(mInstanceId);
    }

    @Override
    public void destroyRoot(int rootId) {
        if (mRenderer != null) {
            mRenderer.destroyRoot(rootId);
        }
    }

    @Override
    public void onRuntimeInitialized(int rootId) {
        if (mRenderer != null) {
            mRenderer.onRuntimeInitialized(rootId);
        }
    }

    @Override
    public void recordSnapshot(int rootId, @NonNull Object callback) {
        if (mRenderer != null && callback instanceof Callback) {
            mRenderer.recordSnapshot(rootId, (Callback<byte[]>) callback);
        }
    }

    @Override
    public View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer) {
        if (mRenderer != null) {
            return mRenderer.replaySnapshot(context, buffer);
        }
        return null;
    }

    @Override
    public View replaySnapshot(@NonNull Context context,
        @NonNull Map<String, Object> snapshotMap) {
        if (mRenderer != null) {
            return mRenderer.replaySnapshot(context, snapshotMap);
        }
        return null;
    }

    @Override
    public void removeSnapshotView() {
        if (mRenderer != null) {
            mRenderer.removeSnapshotView();
        }
    }

    @Override
    public void setFrameworkProxy(@NonNull Object proxy) {
        if (mRenderer != null && proxy instanceof FrameworkProxy) {
            mRenderer.setFrameworkProxy((FrameworkProxy) proxy);
        }
    }

    @Override
    public View createRootView(@NonNull Context context) {
        View rootView = null;
        if (mRenderer != null) {
            rootView = mRenderer.createRootView(context);
        }
        return rootView;
    }

    @Override
    public void onResume() {
        if (mRenderer != null) {
            mRenderer.onResume();
        }
    }

    @Override
    public void onPause() {
        if (mRenderer != null) {
            mRenderer.onPause();
        }
    }

    @Override
    public void init(@Nullable List<Class<?>> controllers,
        @Nullable ViewGroup rootView) {
        if (mRenderer != null) {
            mRenderer.init(controllers, rootView);
        }
    }

    @Override
    public void addControllers(@NonNull List<Class<?>> controllers) {
        // TODO: unsupport now
    }

    @Override
    public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    @Override
    public void destroy() {
        destroyTDFRenderManager(mInstanceId);
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    /**
     * Create native (C++) render manager instance.
     *
     * @return the unique id of native (C++) render manager
     */
    private native int createTDFRenderManager(float j_density);

    /**
     * Destroy native (C++) render manager instance.
     */
    private native void destroyTDFRenderManager(int instanceId);

    /**
     * Attach DomManager to native (C++) render manager instance
     */
    private native void attachToDom(int instanceId, int domId);

}
