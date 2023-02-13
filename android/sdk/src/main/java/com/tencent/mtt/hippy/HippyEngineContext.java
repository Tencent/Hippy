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

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.TimeMonitor;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
public interface HippyEngineContext {

  String getComponentName();

  boolean isRunningOnTVPlatform();

  @Nullable
  Map<String, Object> getNativeParams();

  HippyGlobalConfigs getGlobalConfigs();

  HippyModuleManager getModuleManager();

  HippyBridgeManager getBridgeManager();

  DevSupportManager getDevSupportManager();

  ThreadExecutor getThreadExecutor();

  DomManager getDomManager();

  RenderManager getRenderManager();

  @Deprecated
  HippyRootView getInstance(int id);

  HippyRootView getInstance();

  void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

  void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

  void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void handleException(Throwable throwable);

  TimeMonitor getStartTimeMonitor();

  int getEngineId();

  /**
   * Add API providers after initializing hippy engine.<rb/>
   *
   * @apiNote This method should be used before
   * {@link HippyEngine#loadModule(HippyEngine.ModuleLoadParams)}, otherwise APIs or views
   * defined in this providers maybe registered after use.
   *
   * @param apiProviders The Api providers need to be registered.
   */
  void addApiProviders(List<HippyAPIProvider> apiProviders);
}
