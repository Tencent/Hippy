package com.tencent.renderer;

import android.content.Context;
import android.util.Log;

import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;

import java.util.ArrayList;

import androidx.annotation.NonNull;

public class TDFRenderEngine extends TDFEngine {
    private final ArrayList<ILifecycleListener> mLifecycleListener = new ArrayList<>();

    public TDFRenderEngine(@NonNull Context context, TDFEngineConfig configuration) {
        super(context, configuration);
    }

    @Override
    public void onShellCreated(long shell) {
        super.onShellCreated(shell);
        for (ILifecycleListener listener : mLifecycleListener) {
            listener.onShellCreated(shell);
        }
    }

    @Override
    public void onWillShellDestroy() {
        super.onWillShellDestroy();
        for (ILifecycleListener listener : mLifecycleListener) {
            listener.onWillShellDestroy();
        }
    }

    public void registerLifecycleListener(ILifecycleListener listener) {
        mLifecycleListener.add(listener);
    }

    public void unregisterLifecycleListener(ILifecycleListener listener) {
        mLifecycleListener.remove(listener);
    }

    public interface ILifecycleListener {
        void onShellCreated(long shell);
        void onWillShellDestroy();
    }

}
