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

  public void Callback(long result, String reason) {
    if (mHandler != null) {
      NativeRunnable runnable = new NativeRunnable(this, result, mMsg, mAction, reason);
      mHandler.post(runnable);
    }
  }

  public abstract void Call(long result, Message message, String action, String reason);

  private final Handler mHandler;
  private Message mMsg = null;
  private String mAction = null;

  public static class NativeRunnable implements Runnable {

    private final long result;
    private final NativeCallback callback;
    private final Message message;
    private final String action;
    private final String reason;

    public NativeRunnable(NativeCallback callback, long result, Message message,
        String action, String reason) {
      this.result = result;
      this.callback = callback;
      this.message = message;
      this.action = action;
      this.reason = reason;
    }

    @Override
    public void run() {
      callback.Call(result, message, action, reason);
    }
  }
}
