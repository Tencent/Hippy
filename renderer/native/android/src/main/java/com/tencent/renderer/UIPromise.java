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

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.modules.Promise;

public class UIPromise implements Promise {

    private final int mRootId;
    private final int mNodeId;
    private final int mInstanceId;
    private final long mCallbackId;
    @Nullable
    private final String mFunctionName;

    public UIPromise(long callbackId, @Nullable String functionName, int rootId, int nodeId,
            int instanceId) {
        mCallbackId = callbackId;
        mFunctionName = functionName;
        mRootId = rootId;
        mNodeId = nodeId;
        mInstanceId = instanceId;
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
        nativeRenderer.doPromiseCallBack(result, mCallbackId, mFunctionName, mRootId, mNodeId,
                params);
    }
}
