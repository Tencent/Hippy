/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import android.view.ViewParent;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.tdf.embed.TDFEmbeddedViewFactoryImpl;
import com.tencent.tdf.embed.EmbeddedViewFactory;

import com.tencent.vfs.VfsManager;
import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;


@SuppressWarnings("JavaJniMissingFunction")
public class TDFRenderer extends Renderer implements RenderProxy, TDFRenderEngine.ILifecycleListener {

    private static final String TAG = "TDFRenderer";

    private int mRootViewId;
    private final int mInstanceId;
    private final long mShellId = 0;
    private static final int ROOT_VIEW_ID_INCREMENT = 10;
    private static final AtomicInteger sRootIdCounter = new AtomicInteger(0);

    private ControllerManager mControllerManager;
    private TDFHippyRootView mRootView;
    private FrameworkProxy mFrameworkProxy;
    private VfsManager mVfsManager;

    private final List<Class<?>> mControllers = new ArrayList<>();

    public TDFRenderer(int instanceId) {
        mInstanceId = instanceId;
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    @Override
    public void destroy() {}

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        mFrameworkProxy = proxy;
    }

    @NonNull @Override public View createRootView(@NonNull Context context) {
        if (mVfsManager == null) {
            mVfsManager = mFrameworkProxy.getVfsManager();
            registerUriLoader(mInstanceId, mVfsManager.getId());
        }
        mRootViewId = sRootIdCounter.addAndGet(ROOT_VIEW_ID_INCREMENT);
        if (!(context instanceof Activity)) {
            throw new RuntimeException("Unsupported Host");
        }
        TDFHippyRootView tdfHippyRootView = new TDFHippyRootView((Activity) context);
        // When TDFHippyRootView's onAttachedToWindow is called, com.tencent.tdf.TDFEngine will be created.
        // So, set the creation callback here.
        tdfHippyRootView.setEngineCallback(engine -> {
            // Notify TDF Render in Native(C++) size to bind with TDF Shell, this is the key process for TDF Render.
            // At this time point, TDF Core's Shell is created but not started.
            registerTDFEngine(mInstanceId, engine.getJNI().getnativeEngine(), mRootViewId);
            engine.registerLifecycleListener(TDFRenderer.this);
            registerControllers(mRootViewId, mControllers, tdfHippyRootView, TDFRenderer.this, engine);
        });
        tdfHippyRootView.setId(mRootViewId);
        return tdfHippyRootView;
    }

    @Override
    public void onShellCreated(long shell) {
        // When TDFView's Surface is created, TDF Shell will start running, this callback is actually onShellStart
        LogUtils.d(TAG, "onShellCreated(Start): " + shell);
    }

    @Override
    public void onWillShellDestroy() { }

    @Override
    public void onResume() { }

    @Override
    public void onPause() { }

    @Override
    public void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView) {
        mControllers.clear();
        if (controllers != null) {
            mControllers.addAll(controllers);
        }
    }

    @Override
    public void destroyRoot(int rootId) {
        // RootView must be removed otherwise TDFOutputView will intercepts touch event
        ViewParent viewParent = mRootView.getParent();
        if (viewParent instanceof ViewGroup) {
            ((ViewGroup)viewParent).removeView(mRootView);
        }
        mRootView = null;
    }

    @Override
    public void onRuntimeInitialized(int rootId) {
        LogUtils.d(TAG, "onRuntimeInitialized rootId: " + rootId);
    }

    @Override
    public void recordSnapshot(int rootId, @NonNull Callback<byte[]> callback) {

    }

    @Override
    public View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer) {
        return null;
    }

    @Override
    public View replaySnapshot(@NonNull Context context,
        @NonNull Map<String, Object> snapshotMap) {
        return null;
    }

    @Override
    public void handleRenderException(@NonNull Exception exception) {
        LogUtils.d(TAG, "handleRenderException: " + exception.getMessage());
    }

    public void registerControllers(int rootId, List<Class<?>> controllers, View rootView, Renderer renderer, TDFRenderEngine engine) {
        assert (mControllerManager == null);
        mControllerManager = new ControllerManager(renderer);
        mControllerManager.addRootView(rootView);
        mControllerManager.init(controllers);

        for (Class cls : controllers) {
            HippyController hippyNativeModule = (HippyController) cls
                    .getAnnotation(HippyController.class);
            assert hippyNativeModule != null;
            String viewType = hippyNativeModule.name();
            EmbeddedViewFactory embeddedViewFactory = new TDFEmbeddedViewFactoryImpl(rootId, mControllerManager,
                    viewType);
            engine.getEmbeddedViewFactoryRegister().registerEmbeddedViewFactory(viewType, embeddedViewFactory);
        }
    }

    @Override
    public Object getCustomViewCreator() {
        return null;
    }

    /**
     * Register tdf engine to native (C++) render manager instance
     */
    private native void registerTDFEngine(int renderId, long tdfEngineId, int rootViewId);

    /**
     * Register uri loader to native (C++) render manager instance
     */
    private native void registerUriLoader(int renderId, int vfsId);

}

