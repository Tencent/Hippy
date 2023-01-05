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

public abstract class RenderConnector implements Connector, RenderProxy {

    public final static String NATIVE_RENDERER = "NativeRenderer";
    public final static String TDF_RENDERER = "TDFRenderer";

    @Nullable
    protected RenderProxy mRenderProxy;

    RenderConnector() {
        mRenderProxy = initRenderProxy();
    }

    public abstract RenderProxy initRenderProxy();

    public abstract void attachToDom(@NonNull Connector domConnector);

    @Override public abstract int getInstanceId();

    @Override public void destroyRoot(int rootId) {
        if (mRenderProxy != null) {
            mRenderProxy.destroyRoot(rootId);
        }
    }

    @Override public void onRuntimeInitialized(int rootId) {
        if (mRenderProxy != null) {
            mRenderProxy.onRuntimeInitialized(rootId);
        }
    }

    @Override public void recordSnapshot(int rootId, @NonNull Callback<byte[]> callback) {
        if (mRenderProxy != null) {
            mRenderProxy.recordSnapshot(rootId, callback);
        }
    }

    @Override public View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer) {
        if (mRenderProxy != null) {
            return mRenderProxy.replaySnapshot(context, buffer);
        }
        return null;
    }

    @Override public View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap) {
        if (mRenderProxy != null) {
            return mRenderProxy.replaySnapshot(context, snapshotMap);
        }
        return null;
    }

    @Override public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        if (mRenderProxy != null) {
            mRenderProxy.setFrameworkProxy(proxy);
        }
    }

    @NonNull @Override public View createRootView(@NonNull Context context) {
        View rootView = null;
        if (mRenderProxy != null) {
            rootView = mRenderProxy.createRootView(context);
        }
        return rootView;
    }

    @Override public void onResume() {
        if (mRenderProxy != null) {
            mRenderProxy.onResume();
        }
    }

    @Override public void onPause() {
        if (mRenderProxy != null) {
            mRenderProxy.onPause();
        }
    }

    @Override public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        if (mRenderProxy != null) {
            mRenderProxy.init(controllers, rootView);
        }
    }

}
