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

import android.content.Context;
import android.view.ViewGroup;
import com.tencent.hippy.support.HippyBaseController;
import com.tencent.hippy.support.IFrameworkProxy;
import com.tencent.hippy.support.IJSFrameworkProxy;
import com.tencent.hippy.support.INativeRendererProxy;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyCustomViewCreator;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

public class NativeRenderer implements INativeRenderer, INativeRendererProxy {
  final String ID = "id";
  final String PID = "pId";
  final String INDEX = "index";
  final String NAME = "name";
  final String PROPS = "props";
  final String TAG_NAME = "tagName";

  private int instanceId;
  private RenderManager renderManager;
  private DomManager domManager;
  private HippyRootView rootView;
  private Map nativeParam;
  private String bundlePath;
  private boolean isDebugMode;
  private IFrameworkProxy frameworkProxy;
  volatile CopyOnWriteArrayList<HippyInstanceLifecycleEventListener> instanceLifecycleEventListeners;

  @Override
  public void init(int instanceId, List<Class<? extends HippyBaseController>> controllers,
      Map nativeParam, String bundlePath, boolean isDebugMode) {
    renderManager = new RenderManager(this, controllers);
    domManager = new DomManager(this);
    this.instanceId = instanceId;
    this.bundlePath = bundlePath;
    this.nativeParam = nativeParam;
    this.isDebugMode = isDebugMode;
    NativeRendererManager.addNativeRendererInstance(instanceId, this);
  }

  @Override
  public Object getCustomViewCreator() {
    if (nativeParam != null) {
      return nativeParam.get(HippyCustomViewCreator.HIPPY_CUSTOM_VIEW_CREATOR);
    }
    return null;
  }

  @Override
  public String getBundlePath() {
    return bundlePath;
  }

  @Override
  public IImageLoaderAdapter getImageLoaderAdapter() {
    if (checkJSFrameworkProxy()) {
      Object adapterObj = ((IJSFrameworkProxy)frameworkProxy).getImageLoaderAdapter();
      if (adapterObj instanceof IImageLoaderAdapter) {
        return (IImageLoaderAdapter)adapterObj;
      }
    }
    return null;
  }

  @Override
  public HippyFontScaleAdapter getFontScaleAdapter() {
    if (checkJSFrameworkProxy()) {
      Object adapterObj = ((IJSFrameworkProxy)frameworkProxy).getFontScaleAdapter();
      if (adapterObj instanceof HippyFontScaleAdapter) {
        return (HippyFontScaleAdapter)adapterObj;
      }
    }
    return null;
  }

  @Override
  public boolean isDebugMode() {
    return isDebugMode;
  }

  @Override
  public void handleNativeException(Exception exception, boolean haveCaught) {
    if(frameworkProxy != null) {
      frameworkProxy.handleNativeException(exception, haveCaught);
    }
  }

  @Override
  public void setFrameworkProxy(IFrameworkProxy proxy) {
    assert proxy != null;
    frameworkProxy = proxy;
  }

  @Override
  public void destroy() {
    if (domManager != null) {
      ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
      if (threadExecutor != null) {
        threadExecutor.postOnDomThread(new Runnable() {
          @Override
          public void run() {
            domManager.destroy();
          }
        });
      }
    }
    if (renderManager != null) {
      renderManager.destroy();
    }
    if (instanceLifecycleEventListeners != null) {
      instanceLifecycleEventListeners.clear();
    }
    rootView = null;
    nativeParam = null;
    frameworkProxy = null;
    NativeRendererManager.removeNativeRendererInstance(instanceId);
  }

  @Override
  public ViewGroup createRootView(Context context) {
    assert context != null;
    rootView = new HippyRootView(context, instanceId);
    return rootView;
  }

  @Override
  public Object getDomManagerObject() {
    return getDomManager();
  }

  @Override
  public Object getRenderManagerObject() {
    return getRenderManager();
  }

  @Override
  public RenderManager getRenderManager() {
    return renderManager;
  }

  @Override
  public DomManager getDomManager() {
    return domManager;
  }

  @Override
  public ViewGroup getRootView() {
    return rootView;
  }

  @Override
  public void onFirstViewAdded(){
    if(frameworkProxy != null) {
      frameworkProxy.onFirstViewAdded();
    }
  }

  @Override
  public void onSizeChanged(int w, int h, int oldw, int oldh) {
    HippyMap hippyMap = new HippyMap();
    hippyMap.pushDouble("width", PixelUtil.px2dp(w));
    hippyMap.pushDouble("height", PixelUtil.px2dp(h));
    hippyMap.pushDouble("oldWidth", PixelUtil.px2dp(oldw));
    hippyMap.pushDouble("oldHeight", PixelUtil.px2dp(oldh));
    if(frameworkProxy != null) {
      frameworkProxy.onSizeChanged(w, h, oldw, oldh);
    }

    ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
    if (threadExecutor != null) {
      final int width = w;
      final int height = h;
      final int rootId = rootView.getId();
      threadExecutor.postOnDomThread(new Runnable() {
        @Override
        public void run() {
          getDomManager().updateNodeSize(rootId, width, height);
        }
      });
    }
  }

  @Override
  public void updateModalHostNodeSize(final int id, final int width, final int height) {
    ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
    if (threadExecutor != null) {
      threadExecutor.postOnDomThread(new Runnable() {
        @Override
        public void run() {
          getDomManager().updateNodeSize(id, width, height);
        }
      });
    }
  }

  @Override
  public void updateDimension(boolean shouldRevise, HippyMap dimension,
      boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
    if (checkJSFrameworkProxy()) {
      ((IJSFrameworkProxy)frameworkProxy).updateDimension(shouldRevise, dimension,
          shouldUseScreenDisplay, systemUiVisibilityChanged);
    }
  }

  @Override
  public void dispatchUIComponentEvent(int id, String eventName, Object params) {
    if (checkJSFrameworkProxy()) {
      ((IJSFrameworkProxy)frameworkProxy).dispatchUIComponentEvent(id, eventName, params);
    }
  }

  @Override
  public void dispatchNativeGestureEvent(HippyMap params) {
    if (checkJSFrameworkProxy()) {
      ((IJSFrameworkProxy)frameworkProxy).dispatchNativeGestureEvent(params);
    }
  }

  @Override
  public void onInstanceLoad() {
    assert rootView != null;
    ThreadExecutor threadExecutor = getJSEngineThreadExecutor();
    if (threadExecutor != null && rootView != null) {
      final int rootId = rootView.getId();
      final int width = rootView.getWidth();
      final int height = rootView.getHeight();
      threadExecutor.postOnDomThread(new Runnable() {
        @Override
        public void run() {
          getDomManager().createRootNode(rootId, width, height);
        }
      });
    }

    renderManager.addRootView(rootView);
  }

  @Override
  public void onInstanceResume() {
    if (instanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
        listener.onInstanceResume();
      }
    }
  }

  @Override
  public void onInstancePause() {
    if (instanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
        listener.onInstancePause();
      }
    }
  }

  @Override
  public void onInstanceDestroy() {
    if (instanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener listener : instanceLifecycleEventListeners) {
        listener.onInstanceDestroy();
      }
    }
  }

  @Override
  public void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
    if (instanceLifecycleEventListeners == null) {
      instanceLifecycleEventListeners = new CopyOnWriteArrayList<>();
    }
    instanceLifecycleEventListeners.add(listener);
  }

  @Override
  public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
    if (instanceLifecycleEventListeners != null) {
      instanceLifecycleEventListeners.remove(listener);
    }
  }

  @Override
  public void createNode(int rootID, HippyArray hippyArray) {
    if (hippyArray != null && rootView != null && domManager != null) {
      int len = hippyArray.size();
      for (int i = 0; i < len; i++) {
        HippyMap nodeArray = hippyArray.getMap(i);
        int tag = ((Number)nodeArray.get(ID)).intValue();
        int pTag = ((Number)nodeArray.get(PID)).intValue();
        int index = ((Number)nodeArray.get(INDEX)).intValue();
        if (tag < 0 || pTag < 0 || index < 0) {
          throw new IllegalArgumentException(
                  "createNode invalid value: " + "id=" + tag + ", pId=" + pTag + ", index=" + index);
        }

        String className = (String) nodeArray.get(NAME);
        String tagName = (String) nodeArray.get(TAG_NAME);
        HippyMap props = (HippyMap) nodeArray.get(PROPS);
        domManager.createNode(rootView, rootID, tag, pTag, index, className, tagName, props);
      }
    }
  }

  @Override
  public void updateNode(int rootID, HippyArray updateArray) {
    if (updateArray != null && updateArray.size() > 0 && rootView != null
            && domManager != null) {
      int len = updateArray.size();
      for (int i = 0; i < len; i++) {
        HippyMap nodemap = updateArray.getMap(i);
        int id = ((Number)nodemap.get(ID)).intValue();
        if (id < 0) {
          throw new IllegalArgumentException("updateNode invalid value: " + "id=" + id);
        }
        HippyMap props = (HippyMap) nodemap.get(PROPS);
        domManager.updateNode(id, props, rootView);
      }
    }
  }

  @Override
  public void deleteNode(int rootId, HippyArray delete) {
    if (delete != null && delete.size() > 0 && domManager != null) {
      int len = delete.size();
      for (int i = 0; i < len; i++) {
        HippyMap nodemap = delete.getMap(i);
        int id = ((Number)nodemap.get(ID)).intValue();
        if (id < 0) {
          throw new IllegalArgumentException("deleteNode invalid value: " + "id=" + id);
        }
        domManager.deleteNode(id);
      }
    }
  }

  @Override
  public void callUIFunction(HippyArray hippyArray, Promise promise) {
    if (hippyArray != null && hippyArray.size() > 0 && domManager != null) {
      int id = hippyArray.getInt(0);
      String functionName = hippyArray.getString(1);
      HippyArray array = hippyArray.getArray(2);
      domManager.dispatchUIFunction(id, functionName, array, promise);
    }
  }

  @Override
  public void measureInWindow(int id, Promise promise) {
    if (domManager != null) {
      domManager.measureInWindow(id, promise);
    }
  }

  @Override
  public void startBatch() {
    if (domManager != null) {
      domManager.renderBatchStart();
    }
  }

  @Override
  public void endBatch() {
    if (domManager != null) {
      domManager.renderBatchEnd();
    }
  }

  public ThreadExecutor getJSEngineThreadExecutor() {
    if (!checkJSFrameworkProxy()) {
      return null;
    }
    return ((IJSFrameworkProxy)frameworkProxy).getJSEngineThreadExecutor();
  }

  private boolean checkJSFrameworkProxy() {
    if (frameworkProxy == null || !(frameworkProxy instanceof IJSFrameworkProxy)) {
      return false;
    }
    return true;
  }
}
