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

package com.tencent.mtt.hippy.bridge;

import com.tencent.mtt.supportui.utils.struct.Pools;

public class HippyCallNativeParams {

    private static final int POOL_SIZE = 20;
    private static final Pools.SynchronizedPool<HippyCallNativeParams> INSTANCE_POOL = new Pools.SynchronizedPool<>(
            POOL_SIZE);

    public String moduleName;
    public String moduleFunc;
    public String callId;
    public Object params;

    public static HippyCallNativeParams obtain(String moduleName, String moduleFunc, String callId,
            Object params) {
        HippyCallNativeParams instance = INSTANCE_POOL.acquire();
        if (instance == null) {
            instance = new HippyCallNativeParams();
        }
        instance.init(moduleName, moduleFunc, callId, params);
        return instance;
    }

    private void init(String moduleName, String moduleFunc, String callId, Object params) {
        this.moduleName = moduleName;
        this.moduleFunc = moduleFunc;
        this.callId = callId;
        this.params = params;
    }

    public void onDispose() {
        params = null;
        INSTANCE_POOL.release(this);
    }
}
