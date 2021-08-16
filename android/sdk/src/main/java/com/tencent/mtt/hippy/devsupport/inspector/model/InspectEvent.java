package com.tencent.mtt.hippy.devsupport.inspector.model;

import com.tencent.mtt.hippy.utils.LogUtils;
import org.json.JSONObject;

public class InspectEvent {

  private final String method;
  private final JSONObject paramsObject;

  public InspectEvent(String method, JSONObject paramsObject) {
    this.method = method;
    this.paramsObject = paramsObject;
  }

  public String toJson() {
    JSONObject jsonObject = new JSONObject();
    try {
      jsonObject.put("method", method);
      jsonObject.put("params", paramsObject);
    } catch (Exception e) {
      LogUtils.e("InspectEvent", "toJson, exception:", e);
      return null;
    }
    return jsonObject.toString();
  }
}
