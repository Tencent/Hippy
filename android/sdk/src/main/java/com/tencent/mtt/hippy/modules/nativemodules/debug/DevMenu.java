package com.tencent.mtt.hippy.modules.nativemodules.debug;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@HippyNativeModule(name = "DevMenu")
public class DevMenu extends HippyNativeModuleBase {

  public DevMenu(HippyEngineContext context) {
    super(context);
  }

  @HippyMethod(name = "reload")
  public void reload() {
    try {
      mContext.getDevSupportManager().getDevImp().reload();
    } catch (Throwable e) {
      LogUtils.d("HippyDevMemo", "reload error: " + e.getMessage());
    }
  }
}
