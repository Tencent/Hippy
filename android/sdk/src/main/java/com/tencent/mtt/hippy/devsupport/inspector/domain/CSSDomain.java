package com.tencent.mtt.hippy.devsupport.inspector.domain;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import com.tencent.mtt.hippy.devsupport.inspector.model.CSSModel;
import org.json.JSONArray;
import org.json.JSONObject;

public class CSSDomain extends InspectorDomain {

  private static final String TAG = "CSSDomain";

  private static final String METHOD_GET_MATCHED_STYLES_FOR_NODE = "getMatchedStylesForNode";
  private static final String METHOD_GET_COMPUTED_STYLE_FOR_NODE = "getComputedStyleForNode";
  private static final String METHOD_GET_INLINE_STYLES_FOR_NODE = "getInlineStylesForNode";
  private static final String METHOD_SET_STYLE_TEXTS = "setStyleTexts";

  private CSSModel cssModel;

  public CSSDomain(Inspector inspector) {
    super(inspector);
    cssModel = new CSSModel();
  }

  @Override
  public String getDomainName() {
    return "CSS";
  }

  @Override
  public boolean handleRequest(HippyEngineContext context, String method, int id,
    JSONObject paramsObj) {
    switch (method) {
      case METHOD_GET_MATCHED_STYLES_FOR_NODE:
        handleGetMatchedStyles(context, id, paramsObj);
        break;
      case METHOD_GET_COMPUTED_STYLE_FOR_NODE:
        handleGetComputedStyle(context, id, paramsObj);
        break;
      case METHOD_GET_INLINE_STYLES_FOR_NODE:
        handleGetInlineStyles(context, id, paramsObj);
        break;
      case METHOD_SET_STYLE_TEXTS:
        handleSetStyleTexts(context, id, paramsObj);
        break;
      default:
        return false;
    }
    return true;
  }

  private void handleGetMatchedStyles(HippyEngineContext context, int id, JSONObject paramsObj) {
    int nodeId = paramsObj.optInt("nodeId");
    JSONObject matchedStyles = cssModel.getMatchedStyles(context, nodeId);
    sendRspToFrontend(id, matchedStyles);
  }

  private void handleGetComputedStyle(HippyEngineContext context, int id, JSONObject paramsObj) {
    int nodeId = paramsObj.optInt("nodeId");
    JSONObject computedStyle = cssModel.getComputedStyle(context, nodeId);
    sendRspToFrontend(id, computedStyle);
  }

  private void handleGetInlineStyles(HippyEngineContext context, int id, JSONObject paramsObj) {
    int nodeId = paramsObj.optInt("nodeId");
    JSONObject inlineStyles = cssModel.getInlineStyles(context, nodeId);
    sendRspToFrontend(id, inlineStyles);
  }


  private void handleSetStyleTexts(HippyEngineContext context, int id, JSONObject paramsObj) {
    JSONArray editArray = paramsObj.optJSONArray("edits");
    JSONObject styleTexts = cssModel.setStyleTexts(context, editArray, this);
    sendRspToFrontend(id, styleTexts);
  }

  public void setNeedBatchUpdateDom(boolean needBatchUpdate) {
    if (mInspectorRef == null) {
      return;
    }
    mInspectorRef.get().setNeedBatchUpdateDom(needBatchUpdate);
  }


}
