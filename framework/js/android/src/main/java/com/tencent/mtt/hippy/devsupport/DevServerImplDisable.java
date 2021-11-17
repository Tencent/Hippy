/*
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

import android.content.Context;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.HippyRootView;
import java.io.InputStream;

@SuppressWarnings("unused")
public class DevServerImplDisable implements DevServerInterface {

  final DevServerHelper mFetchHelper;

  DevServerImplDisable(HippyGlobalConfigs configs, String serverHost) {
    mFetchHelper = new DevServerHelper(configs, serverHost);
  }

  @Override
  public void reload() {

  }

  @Override
  public String createResourceUrl(String resName) {
    return null;
  }

  @Override
  public void loadRemoteResource(String url, final DevServerCallBack serverCallBack) {
    mFetchHelper.fetchBundleFromURL(new BundleFetchCallBack() {
      @Override
      public void onSuccess(InputStream inputStream) {
        if (serverCallBack != null) {
          serverCallBack.onDevBundleLoadReady(inputStream);
        }
      }

      @Override
      public void onFail(Exception exception) {
        if (serverCallBack != null) {
          serverCallBack.onInitDevError(exception);
        }
      }
    }, url);
  }

  @Override
  public void setDevServerCallback(DevServerCallBack devServerCallback) {

  }

  @Override
  public void attachToHost(Context context) {

  }

  @Override
  public void detachFromHost(Context context) {

  }

  @Override
  public void handleException(Throwable exception) {

  }
}
