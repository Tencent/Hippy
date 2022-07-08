package com.tencent.renderer;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;
import com.tencent.tdf.filepicker.FilePickerDelegate;
import com.tencent.tdf.view.TDFViewWrapper;

@SuppressLint("ViewConstructor")
public class TDFHippyRootView extends TDFViewWrapper {
    IEngineCallback mEngineCallback;

    public TDFHippyRootView(Activity attachActivity) {
        super(attachActivity);
    }

    public void setEngineCallback(IEngineCallback engineCallback) {
        mEngineCallback = engineCallback;
    }

    @Override
    public TDFEngine createEngine() {
        TDFEngineConfig tdfEngineConfig = new TDFEngineConfig();
        tdfEngineConfig.setViewMode(TDFEngineConfig.TDFViewMode.TextureView);
        TDFRenderEngine engine = new TDFRenderEngine(getActivity(), tdfEngineConfig);
        if (mEngineCallback != null) {
            mEngineCallback.onCreated(engine);
        }
        return engine;
    }

    /**
     * Notify TDF Render
     */
    public interface IEngineCallback {
        void onCreated(TDFRenderEngine engine);
    }
}
