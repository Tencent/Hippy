package com.tencent.mtt.hippy.adapter.thirdparty;

import com.tencent.mtt.hippy.bridge.HippyBridgeManager;

public abstract class HippyThirdPartyAdapter
{
    protected Object mExternalData;

    public HippyThirdPartyAdapter() { mExternalData = null; }
    public HippyThirdPartyAdapter(Object externalData) { mExternalData = externalData; }

    public abstract void onRuntimeInit(HippyBridgeManager hippyBridgeManager, long runtimeId, long v8Isolate, long v8Context);
    public abstract void onRuntimeUninit();

    public abstract String getPackageName();
    public abstract String getAppVersion();

    public abstract void setPageUrl(String url);
    public abstract String getPageUrl();
}
