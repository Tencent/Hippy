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
import com.tencent.renderer.RenderProxy;

@SuppressWarnings("JavaJniMissingFunction")
public class NativeRenderer extends RenderConnector {

    private int mInstanceId;

    @Override public RenderProxy initRenderProxy() {
        mInstanceId = createNativeRenderManager();
        Object obj = getNativeRendererInstance(mInstanceId);
        return (RenderProxy) obj;
    }

    public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    @Override
    public void destroy() {
        destroyNativeRenderManager(mInstanceId);
    }

    @Override
    public int getInstanceId() {
        return mInstanceId;
    }

    /**
     * Create native (C++) render manager instance.
     *
     * @return the unique id of native (C++) render manager
     */
    private native int createNativeRenderManager();

    /**
     * Destroy native (C++) render manager instance.
     */
    private native void destroyNativeRenderManager(int instanceId);

    /**
     * Get renderer instance that create by native (C++) render manager.
     *
     * @return instance of {@link com.tencent.renderer.NativeRender}
     */
    private native Object getNativeRendererInstance(int instanceId);

    private native void attachToDom(int mInstanceId, int domId);
}
