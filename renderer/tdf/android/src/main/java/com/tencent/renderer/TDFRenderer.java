package com.tencent.renderer;

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.RenderProxy;
import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.tdf.embed.TDFEmbeddedViewFactoryImpl;
import com.tencent.tdf.embed.EmbeddedViewFactory;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;


@SuppressWarnings("unused")
public class TDFRenderer extends Renderer implements RenderProxy, TDFRenderEngine.ILifecycleListener {
    private int mRootViewId;
    private final int mInstanceId;
    private final long mShellId = 0;
    private static ControllerManager mControllerManager;

    private final List<Class<?>> mControllers = new ArrayList<>();


    public static final String TAG = "TDFRenderer";

    public TDFRenderer() {
        // Create TDF Render in Native(C++) Side
        mInstanceId = OnCreateTDFRender(PixelUtil.getDensity());
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    @Override
    public void destroy() {
        // TODO: destroy relate tdf render & tdf engine
    }

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy proxy) {
        // TDF Render will implement the log of FrameworkProxy in Native(C++) Size
    }

    @NonNull
    @Override
    public View createRootView(@NonNull Context context, int rootId) {
        mRootViewId = rootId;
        // TODO: Due to design of TDFHippyRootView, context must be subclass of Activity. This should be optimized.
        if (!(context instanceof Activity)) {
            throw new RuntimeException("Unsupported Host");
        }

        TDFHippyRootView tdfHippyRootView = new TDFHippyRootView((Activity) context);
        // When TDFHippyRootView's onAttachedToWindow is called, com.tencent.tdf.TDFEngine will be created.
        // So, set the creation callback here.
        tdfHippyRootView.setEngineCallback(engine -> {
            // Notify TDF Render in Native(C++) size to bind with TDF Shell, this is the key process for TDF Render.
            // At this time point, TDF Core's Shell is created but not started.
            RegisterTDFEngine(mInstanceId, engine.getJNI().getnativeEngine(), mRootViewId);
            LogUtils.d(TAG, "onTDFEngineCreate: " + engine.getJNI().getnativeEngine());
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
    public void handleRenderException(@NonNull Exception exception) {
        LogUtils.d(TAG, "handleRenderException: " + exception.getMessage());
    }

    public static void registerControllers(int rootId, List<Class<?>> controllers, View rootView, Renderer renderer, TDFRenderEngine engine) {
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

    private native int OnCreateTDFRender(float j_density);

    private native void RegisterTDFEngine(int renderId, long tdfEngineId, int rootViewId);
}

