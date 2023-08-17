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

package com.openhippy.connector;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.renderer.FrameworkProxy;
import com.tencent.renderer.RenderProxy;
import java.util.List;
import java.util.Map;

@SuppressWarnings("JavaJniMissingFunction")
public class NativeRenderer implements NativeRenderConnector {

    private int mInstanceId;
    @Nullable
    private RenderProxy mRenderer;

    public NativeRenderer() {
        mInstanceId = createNativeRenderManager();
        Object obj = getNativeRendererInstance(mInstanceId);
        if (obj instanceof RenderProxy) {
            mRenderer = (RenderProxy) obj;
        }
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
        return (mRenderer != null) ? mRenderer.replaySnapshot(context, buffer) : null;
    }

    @Override
    public View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap) {
        return (mRenderer != null) ? mRenderer.replaySnapshot(context, snapshotMap) : null;
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
        return (mRenderer != null) ? mRenderer.createRootView(context) : null;
    }

    @Override
    @Nullable
    public View getRootView(int rootId) {
        return (mRenderer != null) ? mRenderer.getRootView(rootId) : null;
    }

    @Override
    @Nullable
    public View findViewById(int rootId, int nodeId) {
        return (mRenderer != null) ? mRenderer.findViewById(rootId, nodeId) : null;
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
    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        if (mRenderer != null) {
            mRenderer.init(controllers, rootView);
        }
    }

    @Override
    public void addControllers(@NonNull List<Class<?>> controllers) {
        if (mRenderer != null) {
            mRenderer.addControllers(controllers);
        }
    }

    @Override
    public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    @Override
    public void destroy() {
        destroyNativeRenderManager(mInstanceId);
        mRenderer = null;
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
    private native int createNativeRenderManager();

    /**
     * Destroy native (C++) render manager instance.
     */
    private native void destroyNativeRenderManager(int instanceId);

    /**
     * Get renderer instance that create by native (C++) render manager.
     *
     * @return instance of {@link com.tencent.renderer.NativeRender}
     */
    private native Object getNativeRendererInstance(int instanceId);

    private native void attachToDom(int mInstanceId, int domId);
}
