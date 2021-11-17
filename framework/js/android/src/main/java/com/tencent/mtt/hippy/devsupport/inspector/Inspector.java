package com.tencent.mtt.hippy.devsupport.inspector;

import android.text.TextUtils;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.inspector.domain.CSSDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.DomDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.InspectorDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.PageDomain;
import com.tencent.mtt.hippy.devsupport.inspector.model.InspectEvent;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.dom.DomManager.BatchListener;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;

public class Inspector implements BatchListener {

  private static final String TAG = "Inspector";

  private static final String CHROME_SOCKET_CLOSED = "chrome_socket_closed";

  private static Inspector sInspector;

  private Map<String, InspectorDomain> mDomainMap = new HashMap<>();
  private DebugWebSocketClient mDebugWebSocketClient;
  private WeakReference<HippyEngineContext> mContextRef;
  private boolean needBatchUpdateDom = true;

  public static synchronized Inspector getInstance(HippyEngineContext context) {
    if (sInspector == null) {
      sInspector = new Inspector(context);
    }
    return sInspector;
  }

  private Inspector(HippyEngineContext context) {
    DomDomain domDomain = new DomDomain(this);
    CSSDomain cssDomain = new CSSDomain(this);
    PageDomain pageDomain = new PageDomain(this);
    mDomainMap.put(domDomain.getDomainName(), domDomain);
    mDomainMap.put(cssDomain.getDomainName(), cssDomain);
    mDomainMap.put(pageDomain.getDomainName(), pageDomain);
    DomManager domManager = context.getDomManager();
    if (domManager != null) {
      domManager.setOnBatchListener(this);
    }
  }

  public Inspector setWebSocketClient(DebugWebSocketClient client) {
    mDebugWebSocketClient = client;
    return this;
  }

  public boolean dispatchReqFromFrontend(HippyEngineContext context, String msg) {
    if (TextUtils.isEmpty(msg)) {
      LogUtils.e(TAG, "dispatchReqFromFrontend, msg null");
      return false;
    }

    LogUtils.d(TAG, "dispatchReqFromFrontend, msg=" + msg);

    if (CHROME_SOCKET_CLOSED.equals(msg)) {
      onFrontendClosed(context);
      return false;
    }

    try {
      JSONObject msgObj = new JSONObject(msg);
      String methodParam = msgObj.optString("method");
      if (!TextUtils.isEmpty(methodParam)) {
        String[] methodParamArray = methodParam.split("\\.");
        if (methodParamArray.length > 1) {
          String domain = methodParamArray[0];
          if (!TextUtils.isEmpty(domain) && mDomainMap.containsKey(domain)) {
            InspectorDomain inspectorDomain = mDomainMap.get(domain);
            if (inspectorDomain != null) {
              String method = methodParamArray[1];
              int id = msgObj.optInt("id");
              JSONObject paramsObj = msgObj.optJSONObject("params");
              boolean shouldHandle = inspectorDomain.handleRequestFromBackend(context, method, id, paramsObj);
              if (shouldHandle) {
                mContextRef = new WeakReference<>(context);
              }
              return shouldHandle;
            }
          }
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "dispatchReqFromFrontend, exception:", e);
    }
    return false;
  }

  private void onFrontendClosed(HippyEngineContext context) {
    for (Map.Entry<String, InspectorDomain> entry : mDomainMap.entrySet()) {
      entry.getValue().onFrontendClosed(context);
    }
  }

  public HippyEngineContext getContext() {
    if (mContextRef == null) {
      return null;
    }
    return mContextRef.get();
  }

  public void rspToFrontend(int id, JSONObject result) {
    if (mDebugWebSocketClient == null) {
      return;
    }
    try {
      JSONObject resultObj = new JSONObject();
      resultObj.put("id", id);
      resultObj.put("result", result != null ? result : new JSONObject());
      LogUtils.d(TAG, "rspToFrontend, msg=" + resultObj.toString());
      mDebugWebSocketClient.sendMessage(resultObj.toString());
    } catch (Exception e) {
      LogUtils.e(TAG, "rspToFrontEnd, exception:", e);
    }
  }

  public void sendEventToFrontend(InspectEvent event) {
    String eventJson = event.toJson();
    if (mDebugWebSocketClient == null || eventJson == null) {
      return;
    }

    LogUtils.d(TAG, "sendEventToFrontend, eventJson=" + eventJson);
    mDebugWebSocketClient.sendMessage(eventJson);
  }

  public void setNeedBatchUpdateDom(boolean needBatchUpdate) {
    needBatchUpdateDom = needBatchUpdate;
  }

  @Override
  public void onBatch(boolean isAnimation) {
    if (needBatchUpdateDom && !isAnimation) {
      DomDomain domDomain = (DomDomain) mDomainMap.get(DomDomain.DOM_DOMAIN_NAME);
      domDomain.sendUpdateEvent();
    }
  }

}
