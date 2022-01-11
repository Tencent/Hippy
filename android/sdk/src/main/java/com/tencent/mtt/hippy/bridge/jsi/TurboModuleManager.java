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
package com.tencent.mtt.hippy.bridge.jsi;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.modules.HippyModuleManagerImpl;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.HashMap;
import java.util.Map;

public class TurboModuleManager {
  public static final String TAG = "TurboModuleManager";

  private final Map<String, HippyNativeModuleBase> mModuleMap = new HashMap<>();
  private final HippyEngineContext mHippyEngineContext;

  public TurboModuleManager(HippyEngineContext context) {
    mHippyEngineContext = context;
  }

  public HippyNativeModuleBase get(String name) {
    LogUtils.d("TurboModuleManager", "get " + name);
    HippyNativeModuleBase module = mModuleMap.get(name);
    if (module != null) {
      return module;
    }

    HippyModuleManagerImpl hippyModuleManager = (HippyModuleManagerImpl) mHippyEngineContext.getModuleManager();
    HippyNativeModuleInfo moduleInfo = hippyModuleManager.getNativeModuleInfo().get(name);
    if (moduleInfo == null) {
      return null;
    }

    try {
      moduleInfo.initialize();
    } catch (Throwable throwable) {
      LogUtils.e(TAG, throwable.getMessage());
      return null;
    }

    module = moduleInfo.getInstance();
    mModuleMap.put(name, module);
    return module;
  }

  public native int install(long v8RuntimeId);

  public native void uninstall(long v8RuntimeId);
}
