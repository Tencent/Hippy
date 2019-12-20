package com.tencent.mtt.hippy.bridge;

import android.os.Handler;
import android.os.Message;
import com.tencent.mtt.hippy.utils.LogUtils;

public abstract class NativeCallback {
    public NativeCallback(Handler handler) {
        mHandler = handler;
    }
    public NativeCallback(Handler handler, Message msg, String action) {
        mHandler = handler;
        mMsg = msg;
        mAction = action;
    };
    public void Callback(long value) {

        String msg = value + "";
        LogUtils.e("Callback OK", msg);

        if (mHandler != null) {
            NativeRunnable runnable = new NativeRunnable(this, value, mMsg, mAction);
            mHandler.post(runnable);
        }
    }

    public abstract void Call(long value, Message msg, String action);

    private Handler mHandler;
    private Message mMsg = null;
    private String mAction = null;

    public static class NativeRunnable implements Runnable {
        private long mValue;
        private NativeCallback mCallback;
        private Message inMsg = null;
        private String inAction = null;

        public NativeRunnable(NativeCallback callback, long value, Message msg, String action) {
            mValue = value;
            mCallback = callback;
            inMsg = msg;
            inAction = action;
        }

        @Override
        public void run() {
            mCallback.Call(mValue, inMsg, inAction);
        }
    }
}