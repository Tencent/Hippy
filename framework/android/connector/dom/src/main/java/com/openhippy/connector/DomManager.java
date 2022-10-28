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

package com.openhippy.connector;

@SuppressWarnings("JavaJniMissingFunction")
public class DomManager {

    private final int mInstanceId;

    public DomManager(int workerManagerId) {
        mInstanceId = createDomInstance(workerManagerId);
    }

    public void destroy(int workerManagerId) {
        destroyDomInstance(workerManagerId, mInstanceId);
    }

    public int getInstanceId() {
        return mInstanceId;
    }

    /**
     * Create native (C++) dom manager instance.
     *
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomInstance(int workerManagerId);

    /**
     * Release native (C++) dom manager instance.
     * @param workerManagerId the unique id of native (C++) worker manager
     * @param domManagerId the unique id of native (C++) dom manager
     */
    private native void destroyDomInstance(int workerManagerId, int domManagerId);

}
