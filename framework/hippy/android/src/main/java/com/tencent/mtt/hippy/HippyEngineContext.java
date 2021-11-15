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

import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.TimeMonitor;

@SuppressWarnings("unused")
public interface HippyEngineContext {

  HippyGlobalConfigs getGlobalConfigs();

  HippyModuleManager getModuleManager();

  HippyBridgeManager getBridgeManager();

  DevSupportManager getDevSupportManager();

  ThreadExecutor getThreadExecutor();

  DomManager getDomManager();

  RenderManager getRenderManager();

  ViewGroup getRootView();

  void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

  void handleException(Throwable throwable);

  void createNode(int rootId, HippyArray hippyArray);

  void updateNode(int rootId, HippyArray updateArray);

  void deleteNode(int rootId, HippyArray deleteArray);

  void callUIFunction(HippyArray hippyArray, Promise promise);

  void measureInWindow(int id, Promise promise);

  void startBatch();

  void endBatch();

  int getEngineId();
}
