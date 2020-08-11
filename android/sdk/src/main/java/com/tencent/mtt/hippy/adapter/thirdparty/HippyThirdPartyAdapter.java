package com.tencent.mtt.hippy.adapter.thirdparty;

import org.json.JSONObject;

public abstract class HippyThirdPartyAdapter
{
    public HippyThirdPartyAdapter() {}

    public abstract void SetHippyBridgeId(long runtimeId);
    public abstract String getPackageName();
    public abstract String getAppVersion();

    public abstract void setPageUrl(String url);
    public abstract String getPageUrl();

    public abstract void setExtraData(JSONObject extraData);
    public abstract JSONObject getExtraData();
}