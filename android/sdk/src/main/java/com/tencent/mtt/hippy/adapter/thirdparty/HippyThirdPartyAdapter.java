package com.tencent.mtt.hippy.adapter.thirdparty;

import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.DomNodeRecord;
import java.util.ArrayList;
import org.json.JSONObject;

@SuppressWarnings({"unused"})
public abstract class HippyThirdPartyAdapter {

  public ArrayList<DomNodeRecord> domNodeRecordList = new ArrayList<>();

  public abstract void onRuntimeInit(long runtimeId);

  public abstract void onRuntimeDestroy();

  public abstract void saveInstanceState(ArrayList<DomNodeRecord> recordList);

  public abstract String getPackageName();

  public abstract String getAppVersion();

  public abstract void setPageUrl(String url);

  public abstract String getPageUrl();

  public abstract void setExtraData(JSONObject extraData);

  public abstract JSONObject getExtraData();
}
