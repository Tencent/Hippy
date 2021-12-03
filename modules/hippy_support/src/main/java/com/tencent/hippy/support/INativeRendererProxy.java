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
package com.tencent.hippy.support;

import android.content.Context;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.Promise;

import java.util.List;

public interface INativeRendererProxy extends HippyInstanceLifecycleEventListener {
  void init(int instanceId, List<Class<? extends HippyBaseController>> controllers,
      boolean isDebugMode, ViewGroup rootView);

  void setFrameworkProxy(IFrameworkProxy proxy);

  void onRuntimeInitialized(long runtimeId);

  void destroy();

  ViewGroup createRootView(Context context);

  int getRootId();

  Object getDomManagerObject();

  Object getRenderManagerObject();

  void createNode(int rootId, HippyArray hippyArray);

  void updateNode(int rootId, HippyArray updateArray);

  void deleteNode(int rootId, HippyArray deleteArray);

  void callUIFunction(HippyArray hippyArray, Promise promise);

  void measureInWindow(int id, Promise promise);

  void startBatch();

  void endBatch();
}
