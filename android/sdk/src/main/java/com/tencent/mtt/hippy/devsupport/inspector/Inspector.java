/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018-2022 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tencent.mtt.hippy.devsupport.inspector;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.text.TextUtils;
import com.tencent.mtt.hippy.BuildConfig;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.inspector.domain.CSSDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.DomDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.InputDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.InspectorDomain;
import com.tencent.mtt.hippy.devsupport.inspector.domain.PageDomain;
import com.tencent.mtt.hippy.devsupport.inspector.model.InspectEvent;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.dom.DomManager.BatchListener;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.lang.ref.WeakReference;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

public class Inspector implements BatchListener {

  private static final String TAG = "Inspector";
  private static final String RENDERER_TYPE = "Native";
  private static final String CHROME_SOCKET_CLOSED = "chrome_socket_closed";

  public static int CLOSE_DESTROY = 4003;
  public static int CLOSE_RELOAD = 4004;

  private Map<String, InspectorDomain> mDomainMap = new HashMap<>();
  private DebugWebSocketClient mDebugWebSocketClient;
  private WeakReference<HippyEngineContext> mContextRef;
  private boolean needBatchUpdateDom = true;

  public Inspector() {
    DomDomain domDomain = new DomDomain(this);
    CSSDomain cssDomain = new CSSDomain(this);
    PageDomain pageDomain = new PageDomain(this);
    InputDomain inputDomain = new InputDomain(this);
    mDomainMap.put(domDomain.getDomainName(), domDomain);
    mDomainMap.put(cssDomain.getDomainName(), cssDomain);
    mDomainMap.put(pageDomain.getDomainName(), pageDomain);
    mDomainMap.put(inputDomain.getDomainName(), inputDomain);
  }

  public Inspector setEngineContext(HippyEngineContext context, DebugWebSocketClient client) {
    mContextRef = new WeakReference<>(context);
    mDebugWebSocketClient = client;
    DomManager domManager = context.getDomManager();
    if (domManager != null) {
      domManager.setOnBatchListener(this);
    }
    return this;
  }

  public void onDestroy() {
    if (getContext() == null) {
      return;
    }
    DomManager domManager = getContext().getDomManager();
    if (domManager != null) {
      domManager.setOnBatchListener(null);
    }
    for (InspectorDomain domain: mDomainMap.values()) {
      domain.onDestroy();
    }
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
              return inspectorDomain.handleRequestFromBackend(context, method, id, paramsObj);
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

  public void updateContextName(String name) {
    if (getContext() == null) {
      return;
    }
    try {
      JSONObject contextObj = new JSONObject();
      contextObj.put("contextName", name);

      Context context = getContext().getGlobalConfigs().getContext();
      int moduleCount = getContext().getModuleManager().getNativeModuleCount();
      int viewCount = getContext().getRenderManager().getControllerManager().getControllerCount();

      String packageName = "";
      String versionName = "";
      if (context != null) {
        PackageManager packageManager = context.getPackageManager();
        PackageInfo packageInfo = packageManager.getPackageInfo(context.getPackageName(), 0);
        packageName = packageInfo.packageName;
        versionName = packageInfo.versionName;
      }
      contextObj.put("bundleId", packageName);
      contextObj.put("hostVersion", versionName);
      contextObj.put("sdkVersion", BuildConfig.LIBRARY_VERSION);
      contextObj.put("rendererType", RENDERER_TYPE);
      contextObj.put("viewCount", viewCount);
      contextObj.put("moduleCount", moduleCount);
      sendEventToFrontend(new InspectEvent("TDFRuntime.updateContextInfo", contextObj));
    } catch (Exception e) {
      LogUtils.e(TAG, "updateContextName, exception:", e);
    }
  }


  @Override
  public void onBatch(boolean isAnimation) {
    if (needBatchUpdateDom && !isAnimation) {
      DomDomain domDomain = (DomDomain) mDomainMap.get(DomDomain.DOM_DOMAIN_NAME);
      domDomain.sendUpdateEvent();
    }
  }

}
