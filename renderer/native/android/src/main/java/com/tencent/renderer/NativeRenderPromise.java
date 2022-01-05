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

import android.text.TextUtils;
import com.tencent.mtt.hippy.modules.Promise;

public class NativeRenderPromise implements Promise {

    private static final int PROMISE_CODE_RESOLVE = 0;
    private static final int PROMISE_CODE_REJECT = 2;
    private static final String INVALID_CALL_BACK_ID = "-1";
    private final String mFunctionName;
    private final String mCallBackId;
    private final int mInstanceId;

    public NativeRenderPromise(String functionName, String callBackId, int instanceId) {
        mFunctionName = functionName;
        mCallBackId = callBackId;
        mInstanceId = instanceId;
    }

    public String getCallId() {
        return mCallBackId;
    }

    public boolean isCallback() {
        return !TextUtils.equals(mCallBackId, INVALID_CALL_BACK_ID);
    }

    @Override
    public void setTransferType(BridgeTransferType type) {
        // Native Render only support normal transfer type, NIO is not applicable here,
        // so just override this method, no need to do anything.
    }

    @Override
    public void resolve(Object params) {
        doCallback(PROMISE_CODE_RESOLVE, params);
    }

    @Override
    public void reject(Object params) {
        doCallback(PROMISE_CODE_REJECT, params);
    }

    private void doCallback(int result, Object params) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(mInstanceId);
        if (nativeRenderer == null || TextUtils.equals(INVALID_CALL_BACK_ID, mCallBackId)) {
            return;
        }
        nativeRenderer.doPromiseCallBack(result, mFunctionName, mCallBackId, params);
    }
}
