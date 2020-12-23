package com.tencent.mtt.hippy.adapter.thirdparty;

public abstract class HippyThirdPartyAdapter
{
    protected Object mExternalData;

    public HippyThirdPartyAdapter() { mExternalData = null; }
    public HippyThirdPartyAdapter(Object externalData) { mExternalData = externalData; }

    public abstract void SetHippyBridgeId(long runtimeId);
    public abstract String getPackageName();
    public abstract String getAppVersion();

    public abstract void setPageUrl(String url);
    public abstract String getPageUrl();
}
