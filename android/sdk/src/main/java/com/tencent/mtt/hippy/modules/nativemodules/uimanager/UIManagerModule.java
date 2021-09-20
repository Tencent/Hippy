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
package com.tencent.mtt.hippy.modules.nativemodules.uimanager;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings({"deprecation", "unused"})
@HippyNativeModule(name = UIManagerModule.CLASS_NAME, thread = HippyNativeModule.Thread.DOM)
public class UIManagerModule extends HippyNativeModuleBase {

  public static final String CLASS_NAME = "UIManagerModule";

  final String OPTION_TYPE = "optionType";
  final String OPTION_TYPE_CREATE_NODE = "createNode";
  final String OPTION_TYPE_UPDATE_NODE = "updateNode";
  final String OPTION_TYPE_DELETE_NODE = "deleteNode";
  final String OPTION_TYPE_PARAM = "param";
  final String ID = "id";
  final String PID = "pId";
  final String INDEX = "index";
  final String NAME = "name";
  final String PROPS = "props";
  final String TAG_NAME = "tagName";

  public UIManagerModule(HippyEngineContext context) {
    super(context);
  }

  @HippyMethod(name = "createNode")
  public void createNode(int rootID, HippyArray hippyArray) {
    HippyRootView hippyRootView = mContext.getInstance(rootID);
    DomManager domManager = this.mContext.getDomManager();
    if (hippyArray != null && hippyRootView != null && domManager != null) {
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
        domManager.createNode(hippyRootView, rootID, tag, pTag, index, className, tagName, props);
      }
    }
  }


  @HippyMethod(name = "updateNode")
  public void updateNode(int rootID, HippyArray updateArray) {
    HippyRootView hippyRootView = mContext.getInstance(rootID);
    DomManager domManager = this.mContext.getDomManager();
    if (updateArray != null && updateArray.size() > 0 && hippyRootView != null
        && domManager != null) {
      int len = updateArray.size();
      for (int i = 0; i < len; i++) {
        HippyMap nodemap = updateArray.getMap(i);
        int id = ((Number)nodemap.get(ID)).intValue();
        if (id < 0) {
          throw new IllegalArgumentException("updateNode invalid value: " + "id=" + id);
        }
        HippyMap props = (HippyMap) nodemap.get(PROPS);
        domManager.updateNode(id, props, hippyRootView);
      }
    }
  }

  @HippyMethod(name = "deleteNode")
  public void deleteNode(int rootId, HippyArray delete) {
    DomManager domManager = this.mContext.getDomManager();
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

  @HippyMethod(name = "flushBatch")
  public void flushBatch(int rootId, HippyArray hippyArray) {
    if (hippyArray != null && hippyArray.size() > 0) {
      int len = hippyArray.size();
      for (int i = 0; i < len; i++) {
        HippyMap hippyMap = hippyArray.getMap(i);
        String optionType = (String) hippyMap.get(OPTION_TYPE);
        switch (optionType) {
          case OPTION_TYPE_CREATE_NODE:
            createNode(rootId, (HippyArray) hippyMap.get(OPTION_TYPE_PARAM));
            break;
          case OPTION_TYPE_UPDATE_NODE:
            updateNode(rootId, (HippyArray) hippyMap.get(OPTION_TYPE_PARAM));
            break;
          case OPTION_TYPE_DELETE_NODE:
            deleteNode(rootId, (HippyArray) hippyMap.get(OPTION_TYPE_PARAM));
            break;
        }
      }
    }
  }

  @HippyMethod(name = "callUIFunction")
  public void callUIFunction(HippyArray hippyArray, Promise promise) {
    DomManager domManager = this.mContext.getDomManager();
    if (hippyArray != null && hippyArray.size() > 0 && domManager != null) {
      int id = hippyArray.getInt(0);
      String functionName = hippyArray.getString(1);
      HippyArray array = hippyArray.getArray(2);
      domManager.dispatchUIFunction(id, functionName, array, promise);
    }
  }

  @HippyMethod(name = "measureInWindow")
  public void measureInWindow(int id, Promise promise) {
    DomManager domManager = this.mContext.getDomManager();
    if (domManager != null) {
      domManager.measureInWindow(id, promise);
    }
    LogUtils.d("UIManagerModule", id + "" + promise);
  }

  @HippyMethod(name = "startBatch")
  public void startBatch(String renderID) {
    DomManager domManager = this.mContext.getDomManager();
    if (domManager != null) {
      domManager.renderBatchStart(renderID);
    }
  }

  @HippyMethod(name = "endBatch")
  public void endBatch(String renderID) {
    DomManager domManager = this.mContext.getDomManager();
    if (domManager != null) {
      domManager.renderBatchEnd(renderID);
    }
  }

}
