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
package com.tencent.mtt.hippy.views.navigator;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;

@SuppressWarnings({"deprecation", "unused"})
@HippyController(name = NavigatorController.CLASS)
public class NavigatorController extends HippyGroupController<Navigator> {

  public static final String CLASS = "Navigator";

  private final static String PUSH = "push";
  private final static String POP = "pop";

  @Override
  protected View createViewImpl(Context context) {
    return new Navigator(context);
  }

  @Override
  protected void addView(ViewGroup parentView, View view, int index) {
    //		super.addView(parentView, view, index);
    Log.d(CLASS, "addView");
  }

  @Override
  public void dispatchFunction(Navigator view, String functionName, HippyArray var) {
    super.dispatchFunction(view, functionName, var);

    switch (functionName) {
      case POP:
        boolean animated = false;
        String toDirection = null;
        if (var != null) {
          HippyMap hippyMap = var.getMap(0);
          if (hippyMap != null) {
            animated = hippyMap.getBoolean("animated");
            toDirection = hippyMap.getString("toDirection");
          }
        }
        view.pop(animated, toDirection);
        break;
      case PUSH:
        if (var != null) {
          HippyMap hippyMap = var.getMap(0);
          if (hippyMap != null) {
            String component = hippyMap.getString("routeName");
            HippyMap initProps = hippyMap.getMap("initProps");
            animated = hippyMap.getBoolean("animated");
            String fromDirection = hippyMap.getString("fromDirection");
            HippyRootView hippyRootView = loadNavPage(view, component, initProps);
            view.push(hippyRootView, animated, fromDirection);
          }
        }
        break;
    }
  }

  private HippyRootView loadNavPage(Navigator view, String component, HippyMap initProps) {
    HippyInstanceContext hippyInstanceContext = (HippyInstanceContext) view.getContext();
    HippyEngine.ModuleLoadParams moduleParams = new HippyEngine.ModuleLoadParams(
        hippyInstanceContext.getModuleParams());
    moduleParams.componentName = component;
    moduleParams.jsParams = initProps;
    return hippyInstanceContext.getEngineManager().loadModule(moduleParams);
  }

  @HippyControllerProps(name = "initialRoute", defaultType = HippyControllerProps.MAP)
  public void initPage(Navigator navigator, HippyMap hippyMap) {
    String component = hippyMap.getString("routeName");
    HippyMap initProps = hippyMap.getMap("initProps");

    HippyRootView hippyRootView = loadNavPage(navigator, component, initProps);

    navigator.init(hippyRootView);
  }

  public static void destroyInstance(View view) {
    if (view instanceof HippyRootView) {
      HippyInstanceContext hippyInstanceContext = (HippyInstanceContext) view.getContext();
      HippyRootView hippyRootView = (HippyRootView) view;
      hippyInstanceContext.getEngineManager().destroyModule(hippyRootView);
    }
  }

  @Override
  protected void deleteChild(ViewGroup parentView, View childView) {
    //		super.deleteChild(parentView, childView);

    destroyInstance(childView);

    Log.d(CLASS, "deleteChild");
  }
}
