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
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

@SuppressWarnings({"deprecation", "unused"})
@HippyNativeModule(name = UIManagerModule.CLASS_NAME, thread = HippyNativeModule.Thread.DOM)
public class UIManagerModule extends HippyNativeModuleBase {

  public static final String CLASS_NAME = "UIManagerModule";

  final String OPTION_TYPE = "optionType";
  final String OPTION_TYPE_CREATE_NODE = "createNode";
  final String OPTION_TYPE_UPDATE_NODE = "updateNode";
  final String OPTION_TYPE_DELETE_NODE = "deleteNode";
  final String OPTION_TYPE_PARAM = "param";

  public UIManagerModule(HippyEngineContext context) {
    super(context);
  }

  @HippyMethod(name = "createNode")
  public void createNode(int rootId, HippyArray hippyArray) {
    mContext.createNode(rootId, hippyArray);
  }


  @HippyMethod(name = "updateNode")
  public void updateNode(int rootId, HippyArray updateArray) {
    mContext.updateNode(rootId, updateArray);
  }

  @HippyMethod(name = "deleteNode")
  public void deleteNode(int rootId, HippyArray deleteArray) {
    mContext.deleteNode(rootId, deleteArray);
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
    mContext.callUIFunction(hippyArray, promise);
  }

  @HippyMethod(name = "measureInWindow")
  public void measureInWindow(int id, Promise promise) {
    mContext.measureInWindow(id, promise);
  }

  @HippyMethod(name = "startBatch")
  public void startBatch() {
    mContext.startBatch();
  }

  @HippyMethod(name = "endBatch")
  public void endBatch() {
    mContext.endBatch();
  }
}
