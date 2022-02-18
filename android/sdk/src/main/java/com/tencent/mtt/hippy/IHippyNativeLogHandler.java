package com.tencent.mtt.hippy;

@SuppressWarnings({"unused"})
public interface IHippyNativeLogHandler {

  void onReceiveNativeLogMessage(int level, String msg);
}
