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
package com.tencent.mtt.hippy.modules.javascriptmodules;

import static com.tencent.mtt.hippy.HippyEngine.BridgeTransferType.BRIDGE_TRANSFER_TYPE_NORMAL;

import com.tencent.mtt.hippy.HippyEngine.BridgeTransferType;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.utils.ArgumentUtils;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class HippyJavaScriptModuleInvocationHandler implements InvocationHandler {

  private final HippyEngineContext mHippyContext;
  private final String mName;

  public HippyJavaScriptModuleInvocationHandler(HippyEngineContext context, String name) {
    mHippyContext = context;
    this.mName = name;
  }

  @Override
  public Object invoke(Object proxy, Method method, Object[] args) {
    if (proxy instanceof HippyJavaScriptModule) {
      BridgeTransferType transferType = BRIDGE_TRANSFER_TYPE_NORMAL;
      Object params;

      if (args == null || args.length <= 0) {
        params = new HippyArray();
      } else {
        if (args.length == 1) {
          params = args[0];
        } else {
          Object[] newArgs = args;
          Object lastObject = args[args.length - 1];
          if (lastObject instanceof BridgeTransferType) {
            transferType = (BridgeTransferType) lastObject;
            newArgs = new Object[args.length - 1];
            System.arraycopy(args, 0, newArgs, 0, args.length - 1);
          }

          params = ArgumentUtils.fromJavaArgs(newArgs);
        }
      }

      if (mHippyContext != null && mHippyContext.getBridgeManager() != null) {
        mHippyContext.getBridgeManager()
            .callJavaScriptModule(mName, method.getName(), params, transferType);
      }
    }
    return null;
  }

}
