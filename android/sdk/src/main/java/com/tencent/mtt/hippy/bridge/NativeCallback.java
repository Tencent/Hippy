package com.tencent.mtt.hippy.bridge;

import android.os.Handler;
import android.os.Message;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings({"unused"})
public abstract class NativeCallback {

  public NativeCallback(Handler handler) {
    mHandler = handler;
  }

  public NativeCallback(Handler handler, Message msg, String action) {
    mHandler = handler;
    mMsg = msg;
    mAction = action;
  }

  public void Callback(long value, String msg) {

    LogUtils.e("Callback OK", value + msg);

    if (mHandler != null) {
      NativeRunnable runnable = new NativeRunnable(this, value, mMsg, mAction);
      mHandler.post(runnable);
    }
  }

  public abstract void Call(long value, Message msg, String action);

  private final Handler mHandler;
  private Message mMsg = null;
  private String mAction = null;

  public static class NativeRunnable implements Runnable {

    private final long mValue;
    private final NativeCallback mCallback;
    private final Message inMsg;
    private final String inAction;

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
