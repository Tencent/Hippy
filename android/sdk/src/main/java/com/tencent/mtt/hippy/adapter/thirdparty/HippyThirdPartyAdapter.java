package com.tencent.mtt.hippy.adapter.thirdparty;

import com.tencent.mtt.hippy.bridge.HippyBridgeManager;

public interface HippyThirdPartyAdapter
{
    public void onRuntimeInit(HippyBridgeManager hippyBridgeManager, long v8Isolate, long v8Context);

    public void onRuntimeUninit();

    public String getPackageName();
    public String getAppVersion();

    public String getPageUrl();
}
