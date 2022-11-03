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

import androidx.annotation.NonNull;

@SuppressWarnings("JavaJniMissingFunction")
public class DomManager implements Connector {

    private final int mInstanceId;

    public DomManager() {
        mInstanceId = createDomInstance();
    }

    public DomManager(int instanceId, int rootId) {
        mInstanceId = instanceId;
        attachToRoot(rootId);
    }

    @Override
    public void destroy() {
        destroyDomInstance(mInstanceId);
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    public void attachToRenderer(@NonNull Connector rendererConnector) {
        onAttachToRenderer(rendererConnector.getInstanceId());
    }

    public void attachToRoot(int rootId) {
        onAttachToRoot(mInstanceId, rootId);
    }

    public void detachFromRoot(int rootId) {
        onDetachFromRoot(mInstanceId, rootId);
    }

    /**
     * Attach to renderer with specified id.
     *
     * @param rendererId the unique id of renderer
     */
    private native void onAttachToRenderer(int rendererId);

    /**
     * Attach the specified root id to native (C++) dom manager.
     *
     * @param domId the unique id of native (C++) dom manager
     * @param rootId the root node id
     */
    private native void onAttachToRoot(int domId, int rootId);

    /**
     * Detach the specified root id from native (C++) dom manager.
     *
     * @param domId the unique id of native (C++) dom manager
     * @param rootId the root node id
     */
    private native void onDetachFromRoot(int domId, int rootId);

    /**
     * Create native (C++) dom manager instance.
     *
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomInstance();

    /**
     * Release native (C++) dom manager instance.
     *
     * @param domManagerId the unique id of native (C++) dom manager
     */
    private native void destroyDomInstance(int domManagerId);

}
