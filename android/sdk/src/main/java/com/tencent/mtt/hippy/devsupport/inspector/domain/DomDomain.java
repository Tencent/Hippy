package com.tencent.mtt.hippy.devsupport.inspector.domain;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import com.tencent.mtt.hippy.devsupport.inspector.model.DomModel;
import com.tencent.mtt.hippy.devsupport.inspector.model.InspectEvent;
import org.json.JSONObject;

public class DomDomain extends InspectorDomain {

  private static final String TAG = "DomDomain";
  public static final String DOM_DOMAIN_NAME = "DOM";

  private static final String METHOD_GET_DOCUMENT = "getDocument";
  private static final String METHOD_GET_BOX_MODEL = "getBoxModel";
  private static final String METHOD_GET_NODE_FOR_LOCATION = "getNodeForLocation";
  private static final String METHOD_REMOVE_NODE = "removeNode";
  private static final String METHOD_SET_INSPECT_NODE = "setInspectedNode";

  private DomModel domModel;

  public DomDomain(Inspector inspector) {
    super(inspector);
    domModel = new DomModel();
  }

  @Override
  public String getDomainName() {
    return DOM_DOMAIN_NAME;
  }

  @Override
  public boolean handleRequest(HippyEngineContext context, String method, int id,
    JSONObject paramsObj) {
    switch (method) {
      case METHOD_GET_DOCUMENT:
        handleGetDocument(context, id);
        break;
      case METHOD_GET_BOX_MODEL:
        handleGetBoxModel(context, id, paramsObj);
        break;
      case METHOD_GET_NODE_FOR_LOCATION:
        handleGetNodeForLocation(context, id, paramsObj);
        break;
      case METHOD_SET_INSPECT_NODE:
        handleSetInspectMode(context, id, paramsObj);
        break;
      default:
        return false;
    }
    return true;
  }

  private void handleGetDocument(HippyEngineContext context, int id) {
    JSONObject result = domModel.getDocument(context);
    sendRspToFrontend(id, result);
  }

  private void handleGetBoxModel(HippyEngineContext context, int id, JSONObject paramsObj) {
    JSONObject result = domModel.getBoxModel(context, paramsObj);
    sendRspToFrontend(id, result);
  }

  private void handleGetNodeForLocation(HippyEngineContext context, int id, JSONObject paramsObj) {
    JSONObject result = domModel.getNodeForLocation(context, paramsObj);
    sendRspToFrontend(id, result);
  }

  private void handleSetInspectMode(HippyEngineContext context, int id, JSONObject paramsObj) {
    JSONObject result = domModel.setInspectMode(context, paramsObj);
    sendRspToFrontend(id, result);
  }

  public void sendUpdateEvent() {
    InspectEvent updateEvent = new InspectEvent("DOM.documentUpdated", new JSONObject());
    sendEventToFrontend(updateEvent);
  }
}
