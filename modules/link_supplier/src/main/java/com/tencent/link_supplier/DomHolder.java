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
package com.tencent.link_supplier;

import com.tencent.link_supplier.proxy.dom.DomProxy;

public class DomHolder implements DomProxy {
    private final int mInstanceId;

    public DomHolder() {
        mInstanceId = createDomInstance();
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    @Override
    public void destroy() {
        destroyDomInstance(mInstanceId);
    }

    /**
     * Create native (C++) dom manager instance.
     *
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomInstance();

    /**
     * Release native (C++) dom manager instance.
     *
     * @param instanceId the unique id of native (C++) dom manager
     */
    private native void destroyDomInstance(int instanceId);
}
