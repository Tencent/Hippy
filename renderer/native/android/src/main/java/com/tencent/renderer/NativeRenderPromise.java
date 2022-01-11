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

import com.tencent.mtt.hippy.modules.Promise;

public class NativeRenderPromise implements Promise {

    private static final int PROMISE_CODE_RESOLVE = 0;
    private static final int PROMISE_CODE_REJECT = 2;
    private final int mNodeId;
    private final int mInstanceId;
    private final String mFunctionName;

    public NativeRenderPromise(String functionName, int nodeId, int instanceId) {
        mFunctionName = functionName;
        mNodeId = nodeId;
        mInstanceId = instanceId;
    }

    public String getCallId() {
        return CALL_ID_NO_CALLBACK;
    }

    public boolean isCallback() {
        return true;
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
        if (nativeRenderer == null || mNodeId < 0) {
            return;
        }
        nativeRenderer.doPromiseCallBack(result, mFunctionName, mNodeId, params);
    }
}
