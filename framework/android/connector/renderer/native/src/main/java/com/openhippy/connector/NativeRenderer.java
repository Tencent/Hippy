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

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.renderer.FrameworkProxy;
import com.tencent.renderer.NativeRenderProxy;
import java.util.List;
import java.util.Map;

@SuppressWarnings("JavaJniMissingFunction")
public class NativeRenderer implements Connector {

    private final int mInstanceId;
    @Nullable
    private NativeRenderProxy mRenderer;

    public NativeRenderer() {
        mInstanceId = createNativeRenderManager();
        Object obj = getNativeRendererInstance(mInstanceId);
        if (obj instanceof NativeRenderProxy) {
            mRenderer = (NativeRenderProxy) obj;
        }
    }

    public void onRootDestroy(int rootId) {
        if (mRenderer != null) {
            mRenderer.onRootDestroy(rootId);
        }
    }

    public void onRuntimeInitialized(int rootId) {
        if (mRenderer != null) {
            mRenderer.onRuntimeInitialized(rootId);
        }
    }

    public void recordSnapshot(int rootId, @NonNull final Callback<byte[]> callback) {
        if (mRenderer != null) {
            mRenderer.recordSnapshot(rootId, callback);
        }
    }

    @Nullable
    public View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer) {
        if (mRenderer != null) {
            return mRenderer.replaySnapshot(context, buffer);
        }
        return null;
    }

    @Nullable
    public View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap) {
        if (mRenderer != null) {
            return mRenderer.replaySnapshot(context, snapshotMap);
        }
        return null;
    }

    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        if (mRenderer != null) {
            mRenderer.setFrameworkProxy(proxy);
        }
    }

    @Nullable
    public View createRootView(@NonNull Context context) {
        if (mRenderer != null) {
            return mRenderer.createRootView(context);
        }
        return null;
    }

    public void onResume() {
        if (mRenderer != null) {
            mRenderer.onResume();
        }
    }

    public void onPause() {
        if (mRenderer != null) {
            mRenderer.onPause();
        }
    }

    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        if (mRenderer != null) {
            mRenderer.init(controllers, rootView);
        }
    }

    public void attachToDom(@NonNull Connector rendererConnector) {
        attachToDom(mInstanceId, rendererConnector.getInstanceId());
    }

    @Override
    public void destroy() {
        destroyNativeRenderManager(mInstanceId);
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

    public native void attachToDom(int mInstanceId, int domId);
    public native void createRoot(int rootId);
    public native void destroyRoot(int rootId);


}
