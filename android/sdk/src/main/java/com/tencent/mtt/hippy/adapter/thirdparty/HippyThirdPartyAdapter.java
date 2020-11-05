package com.tencent.mtt.hippy.adapter.thirdparty;

public abstract class HippyThirdPartyAdapter
{
    protected Object mExternalData;

    public HippyThirdPartyAdapter() { mExternalData = null; }
    public HippyThirdPartyAdapter(Object externalData) { mExternalData = externalData; }

    public abstract void onRuntimeInit(long runtimeId);
    public abstract void onRuntimeDestroy();

    public abstract String getPackageName();
    public abstract String getAppVersion();

    public abstract void setPageUrl(String url);
    public abstract String getPageUrl();
}
