package com.tencent.mtt.hippy.bridge;

import com.tencent.mtt.hippy.utils.LogUtils;

public class HippyLogger {
  void Call(String str) {
    LogUtils.e("HippyCore", str);
  }
}
