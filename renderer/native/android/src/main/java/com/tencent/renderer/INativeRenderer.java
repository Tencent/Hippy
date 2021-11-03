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
package com.tencent.renderer;

import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

public interface INativeRenderer {
  RenderManager getRenderManager();

  DomManager getDomManager();

  ViewGroup getRootView();

  Object getCustomViewCreator();

  String getBundlePath();

  IImageLoaderAdapter getImageLoaderAdapter();

  HippyFontScaleAdapter getFontScaleAdapter();

  boolean isDebugMode();

  void onFirstViewAdded();

  void onSizeChanged(int w, int h, int oldw, int oldh);

  void updateModalHostNodeSize(int id, int width, int height);

  void updateDimension(boolean shouldRevise, HippyMap dimension,
      boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged);

  void dispatchUIComponentEvent(int id, String eventName, Object param);

  void dispatchNativeGestureEvent(HippyMap params);

  void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

  void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener);

  void handleNativeException(Exception exception, boolean haveCaught);

}
