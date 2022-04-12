/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.devsupport;

import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import java.util.UUID;

@SuppressWarnings({"unused"})
public class DevSupportManager {

  final DevServerInterface mDevImp;
  final boolean mSupportDev;
  private final Inspector mInspector;
  private String mDebugComponentName;
  // to differ hippy page
  private final UUID mInstanceUUID = UUID.randomUUID();

  public DevSupportManager(HippyGlobalConfigs configs, boolean enableDev, String serverHost,
      String bundleName, String remoteServerUrl) {
    this.mDevImp = DevFactory.create(configs, enableDev, serverHost, bundleName, remoteServerUrl);
    mSupportDev = enableDev;
    mInspector = new Inspector();
  }

  public DevServerInterface getDevImp() {
    return this.mDevImp;
  }

  public void setDevCallback(DevServerCallBack devCallback) {
    mDevImp.setDevServerCallback(devCallback);
  }

  public void attachToHost(HippyRootView view) {
    mDevImp.attachToHost(view);
  }

  public void detachFromHost(HippyRootView view) {
    mDevImp.detachFromHost(view);
  }

  public String createResourceUrl(String resName) {
    return mDevImp.createResourceUrl(resName);
  }

  public String createDebugUrl(String host) {
    return mDevImp.createDebugUrl(host, mInstanceUUID.toString(), mDebugComponentName);
  }

  public void handleException(Throwable throwable) {
    mDevImp.handleException(throwable);
  }

  public void loadRemoteResource(String url, DevServerCallBack serverCallBack) {
    mDevImp.loadRemoteResource(url, serverCallBack);
  }

  public boolean isSupportDev() {
	  return mSupportDev;
  }

  public void setDebugComponentName(String debugComponentName) {
    mDebugComponentName = debugComponentName;
  }

  public String getDebugInstanceId() {
    return mInstanceUUID.toString();
  }

  public Inspector getInspector() {
    return mInspector;
  }
}
