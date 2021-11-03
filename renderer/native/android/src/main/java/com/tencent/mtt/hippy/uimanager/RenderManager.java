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

import android.text.TextUtils;
import android.util.SparseArray;

import android.view.ViewGroup;
import com.tencent.hippy.support.HippyBaseController;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;

import com.tencent.renderer.INativeRenderer;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"deprecation", "unused"})
public class RenderManager {

  private static final String TAG = "RenderManager";
  final SparseArray<RenderNode> mNodes = new SparseArray<>();

  final SparseArray<Boolean> mPreIsLazy = new SparseArray<>();

  final ArrayList<RenderNode> mUIUpdateNodes = new ArrayList<>();
  final ArrayList<RenderNode> mNullUIUpdateNodes = new ArrayList<>();

  final ControllerManager mControllerManager;

  public RenderManager(INativeRenderer nativeRenderer, List<Class<? extends HippyBaseController>> controllers) {
    mControllerManager = new ControllerManager(nativeRenderer, controllers);
  }

  public ControllerManager getControllerManager() {
    return mControllerManager;
  }

  public void addRootView(ViewGroup rootView) {
    mControllerManager.addRootView(rootView);
  }

  public void createRootNode(int id) {
    RenderNode uiNode = new RenderNode(id, NodeProps.ROOT_NODE, mControllerManager);
    mNodes.put(id, uiNode);
  }

  public void destroy() {
    getControllerManager().destroy();
  }

  public void createNode(ViewGroup hippyRootView, int id, int pId, int childIndex,
      String className, HippyMap props) {
    LogUtils.d("RenderManager",
        "createNode ID " + id + " mParentId " + pId + " index " + childIndex + "className"
            + className);

    RenderNode parentNode = mNodes.get(pId);

    boolean isLazy = mControllerManager.isControllerLazy(className);
    RenderNode uiNode = mControllerManager
        .createRenderNode(id, props, className, hippyRootView, isLazy || parentNode.mIsLazyLoad);

    mNodes.put(id, uiNode);

    mPreIsLazy.remove(id);

    parentNode.addChild(uiNode, childIndex);

    addUpdateNodeIfNeeded(parentNode);

    addUpdateNodeIfNeeded(uiNode);
  }

  public void addUpdateNodeIfNeeded(RenderNode renderNode) {
    if (!mUIUpdateNodes.contains(renderNode)) {
      if (null != renderNode) {
        mUIUpdateNodes.add(renderNode);
      }
    }
  }

  void addNullUINodeIfNeeded(RenderNode renderNode) {
    if (!mNullUIUpdateNodes.contains(renderNode)) {
      mNullUIUpdateNodes.add(renderNode);
    }
  }

  public void updateLayout(int id, int x, int y, int w, int h) {
    LogUtils.d("RenderManager", "updateLayout ID " + id);
    RenderNode uiNode = mNodes.get(id);
    uiNode.updateLayout(x, y, w, h);

    addUpdateNodeIfNeeded(uiNode);
  }

  public void updateNode(int id, HippyMap map) {
    LogUtils.d("RenderManager", "updateNode ID " + id);
    RenderNode uiNode = mNodes.get(id);
    uiNode.updateNode(map);
    addUpdateNodeIfNeeded(uiNode);
  }

  public void moveNode(ArrayList<Integer> moveIds, int pId, int id) {

    RenderNode parentNode = mNodes.get(pId);
    RenderNode newParent = mNodes.get(id);
    List<RenderNode> arrayList = new ArrayList<>();

    for (int i = 0; i < moveIds.size(); i++) {
      RenderNode renderNode = mNodes.get(moveIds.get(i));
      arrayList.add(renderNode);
      parentNode.removeChild(renderNode);
      newParent.addChild(renderNode, i);
    }
    parentNode.move(arrayList, id);
    addUpdateNodeIfNeeded(newParent);
  }

  public void updateExtra(int id, Object object) {
    LogUtils.d("RenderManager", "updateExtra ID " + id);
    RenderNode uiNode = mNodes.get(id);
    uiNode.updateExtra(object);

    addUpdateNodeIfNeeded(uiNode);
  }

  public void deleteNode(int id) {
    RenderNode uiNode = mNodes.get(id);
    uiNode.setDelete(true);

    if (uiNode.mParent != null && mControllerManager.hasView(id)) {
      uiNode.mParent.addDeleteId(id, uiNode);
      addUpdateNodeIfNeeded(uiNode.mParent);
    } else if (TextUtils.equals(NodeProps.ROOT_NODE, uiNode.getClassName())) {
      addUpdateNodeIfNeeded(uiNode);
    }
    deleteSelfFromParent(uiNode);

  }

  public void dispatchUIFunction(int id, String functionName, HippyArray var, Promise promise) {
    RenderNode renderNode = mNodes.get(id);
    if (renderNode != null) {
      renderNode.dispatchUIFunction(functionName, var, promise);
      addNullUINodeIfNeeded(renderNode);
    } else {
      LogUtils.d("RenderManager", "dispatchUIFunction Node Null");
    }

  }

  public void nonUIBatchEnd() {
    LogUtils.d("RenderManager", "do nonUIBatchEnd size " + mUIUpdateNodes.size());
    for (int i = 0; i < mUIUpdateNodes.size(); i++) {
      mUIUpdateNodes.get(i).createView();
    }
    for (int i = 0; i < mUIUpdateNodes.size(); i++) {
      RenderNode uiNode = mUIUpdateNodes.get(i);
      uiNode.update();
    }

    mUIUpdateNodes.clear();
  }

  public void batch() {
    LogUtils.d("RenderManager", "do batch size " + mUIUpdateNodes.size());
    for (int i = 0; i < mUIUpdateNodes.size(); i++) {
      mUIUpdateNodes.get(i).createView();
    }

    for (int i = 0; i < mUIUpdateNodes.size(); i++) {
      RenderNode uiNode = mUIUpdateNodes.get(i);
      uiNode.update();
    }

    for (int i = 0; i < mUIUpdateNodes.size(); i++) {
      RenderNode uiNode = mUIUpdateNodes.get(i);
      uiNode.batchComplete();
    }

    mUIUpdateNodes.clear();
    // measureInWindow and dispatch ui function
    for (int i = 0; i < mNullUIUpdateNodes.size(); i++) {
      mNullUIUpdateNodes.get(i).createView();
    }
    for (int i = 0; i < mNullUIUpdateNodes.size(); i++) {
      mNullUIUpdateNodes.get(i).update();
    }

    mNullUIUpdateNodes.clear();
  }

  private void deleteSelfFromParent(RenderNode uiNode) {

    LogUtils.d("RenderManager", "delete RenderNode " + uiNode.mId + " class " + uiNode.mClassName);
    if (uiNode.mParent != null) {
      uiNode.mParent.removeChild(uiNode);
    }

    mNodes.remove(uiNode.mId);

    int childCount = uiNode.getChildCount();
    for (int i = 0; i < childCount; i++) {
      deleteSelfFromParent(uiNode.getChildAt(0));
    }
  }

  public DomNode createStyleNode(String className, boolean isVirtual, int id, int rootId) {
    DomNode domNode = mControllerManager.createStyleNode(className, isVirtual, rootId);
    domNode.setViewClassName(className);
    domNode.setId(id);
    return domNode;
  }

  public RenderNode getRenderNode(int id) {
    try {
      return mNodes.get(id);
    } catch (Exception e) {
      return null;
    }
  }

  public void replaceID(int oldId, int newId) {
    mControllerManager.replaceID(oldId, newId);
  }


  public void measureInWindow(int id, Promise promise) {
    RenderNode renderNode = mNodes.get(id);
    if (renderNode == null) {
      promise.reject("this view is null");
    } else {
      renderNode.measureInWindow(promise);

      addNullUINodeIfNeeded(renderNode);
    }

  }

  public void createPreView(ViewGroup hippyRootView, int id, int pid, int mIndex,
      String className, HippyMap newProps) {

    boolean isLazy = mControllerManager.isControllerLazy(className);

    RenderNode parentNode = mNodes.get(pid);
    if (parentNode != null) {
      isLazy = isLazy || parentNode.mIsLazyLoad;
    } else {
      isLazy = isLazy || mPreIsLazy.get(pid);
    }
    mPreIsLazy.put(id, isLazy);

    if (!isLazy) {
      mControllerManager.createPreView(hippyRootView, id, className, newProps);
    }
  }
}
