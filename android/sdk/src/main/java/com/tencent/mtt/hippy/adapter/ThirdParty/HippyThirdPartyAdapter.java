package com.tencent.mtt.hippy.adapter.thirdparty;

public abstract class HippyThirdPartyAdapter
{
    public HippyThirdPartyAdapter() { mExternalData = null; }
    public HippyThirdPartyAdapter(Object externalData) { mExternalData = externalData; }

    public abstract void SetHippyBridgeId(long runtimeId);

    protected Object mExternalData = null;
}
