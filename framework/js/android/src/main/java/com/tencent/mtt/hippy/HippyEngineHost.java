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
package com.tencent.mtt.hippy;

import android.app.Application;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.utils.ContextHolder;

import java.util.List;

@SuppressWarnings({"deprecation", "unused"})
@Deprecated
public abstract class HippyEngineHost {

  /**
   * Application
   */
  private final Application mApplication;


  public HippyEngineHost(Application application) {
    mApplication = application;
    ContextHolder.setContext(mApplication);
  }

  public HippyEngineManager createDebugHippyEngineManager(String debugJs) {
    HippyEngineManager.Builder builder = new HippyEngineManager.Builder();
    builder.setHippyGlobalConfigs(getHippyGlobalConfigs()).setCoreBundleLoader(null)
        .setPackages(getPackages()).setSupportDev(true)
        .setDebugJs(debugJs).setGroupId(getGroupId());

    return builder.build();
  }

  public HippyGlobalConfigs getHippyGlobalConfigs() {
    return new HippyGlobalConfigs.Builder().setContext(mApplication).build();
  }

  protected abstract List<HippyAPIProvider> getPackages();

  protected HippyBundleLoader getCoreBundleLoader() {
    return null;
  }

  protected boolean enableHippyBufferBridge() {
    return false;
  }

  protected int getGroupId() {
    return -1;
  }

}
