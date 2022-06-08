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
package com.tencent.mtt.hippy.devsupport;

import android.app.ProgressDialog;

/**
 * Copyright (C) 2005-2020 TENCENT Inc.All Rights Reserved. FileName: DevRemoteDebugManager
 * Description： History：
 */
@SuppressWarnings("unused")
public class DevRemoteDebugManager implements DevRemoteDebugProxy {

  ProgressDialog mProgressDialog;

  final RemoteDebugExceptionHandler mRemoteDebugExceptionHandler;

  public DevRemoteDebugManager(RemoteDebugExceptionHandler handler) {
    this.mRemoteDebugExceptionHandler = handler;
  }

  @Override
  public void destroy() {
    if (mProgressDialog != null) {
      mProgressDialog.dismiss();
    }
  }

  public void handleException(Throwable t) {
    if (mRemoteDebugExceptionHandler != null) {
      mRemoteDebugExceptionHandler.onHandleRemoteDebugException(t);
    }
  }

  public interface RemoteDebugExceptionHandler {

    void onHandleRemoteDebugException(Throwable t);
  }
}
