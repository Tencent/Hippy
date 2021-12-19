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
package com.tencent.mtt.hippy.uimanager;

import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.renderer.INativeRender;
import java.util.HashMap;
import java.util.Map;

public class ControllerRegistry {

  private final SparseArray<View> mViews;    // store all views here
  private final SparseArray<View> mRoots;    // store all root views here
  private final Map<String, ControllerHolder> mControllers;  // store all viewManager instance here
  final INativeRender nativeRenderer;

  public ControllerRegistry(INativeRender nativeRenderer) {
    mViews = new SparseArray<>();
    mRoots = new SparseArray<>();
    mControllers = new HashMap<>();
    this.nativeRenderer = nativeRenderer;
  }

  public void addControllerHolder(String name, ControllerHolder controllerHolder) {
    mControllers.put(name, controllerHolder);
  }

  public ControllerHolder getControllerHolder(String className) {
    return mControllers.get(className);
  }

  @SuppressWarnings({"rawtypes"})
  public HippyViewController getViewController(String className) {
    try {
      return mControllers.get(className).hippyViewController;
    } catch (Throwable e) {
      if (nativeRenderer != null) {
        String message = "getViewController: error className=" + className;
        Exception exception = new RuntimeException(message);
        nativeRenderer.handleRenderException(exception);
      }
    }
    return null;
  }

  public View getView(int id) {
    View view = mViews.get(id);
    if (view == null) {
      view = mRoots.get(id);
    }
    return view;
  }

  public int getRootViewCount() {
    return mRoots.size();
  }

  public int getRootIDAt(int index) {
    return mRoots.keyAt(index);
  }

  public View getRootView(int id) {
    return mRoots.get(id);
  }


  public void addView(View view) {
    mViews.put(view.getId(), view);
  }

  public void addRootView(ViewGroup rootView) {
    mRoots.put(rootView.getId(), rootView);
  }


  public void removeView(int id) {
    mViews.remove(id);
  }

  public void removeRootView(int id) {
    mRoots.remove(id);
  }

}
