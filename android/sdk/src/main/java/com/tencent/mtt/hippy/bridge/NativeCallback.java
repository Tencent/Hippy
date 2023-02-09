package com.tencent.mtt.hippy.bridge;

import android.os.Handler;
import androidx.annotation.NonNull;

@SuppressWarnings({"unused"})
public abstract class NativeCallback {

    private final Handler mHandler;

    public NativeCallback(@NonNull Handler handler) {
        mHandler = handler;
    }

    public final void nativeCallback(String action, int instanceId, long result, String reason) {
        mHandler.post(() -> onCall(result, instanceId, action, reason));
    }

    public final void nativeReportLoadedTime(String uri, long startMillis, long endMillis) {
        mHandler.post(() -> onReportLoadedTime(uri, startMillis, endMillis));
    }

    public abstract void onCall(long result, int instanceId, String action, String reason);

    public void onReportLoadedTime(String uri, long startMillis, long endMillis) {
    }
}
