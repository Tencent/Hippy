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

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.RenderProcessInterceptor;
import com.tencent.mtt.hippy.uimanager.RenderManager;

public interface HippyEngineContext {

  String getComponentName();

  HippyGlobalConfigs getGlobalConfigs();

  HippyModuleManager getModuleManager();

  HippyBridgeManager getBridgeManager();

  DevSupportManager getDevSupportManager();

  ThreadExecutor getThreadExecutor();

  DomManager getDomManager();

  RenderManager getRenderManager();

  ViewGroup getRootView();

  /**
   * Add render process interceptor such as AnimationModule.
   */
  void addRenderProcessInterceptor(@NonNull RenderProcessInterceptor interceptor);

  /**
   * Remove render process interceptor from js engine context.
   */
  void removeRenderProcessInterceptor(@NonNull RenderProcessInterceptor interceptor);

  void updateAnimationNode(byte[] buffer, int offset, int length);

  void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void handleException(Throwable throwable);

  int getEngineId();

  void onJSBridgeInitialized(long runtimeId);
}
