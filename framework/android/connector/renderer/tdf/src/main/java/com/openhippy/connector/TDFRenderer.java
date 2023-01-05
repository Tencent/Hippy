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
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.RenderProxy;

@SuppressWarnings("JavaJniMissingFunction")
public class TDFRenderer extends RenderConnector {

    private int mInstanceId;

    @Override public RenderProxy initRenderProxy() {
        mInstanceId = createTDFRenderManager(PixelUtil.getDensity());
        return new com.tencent.renderer.TDFRenderer(mInstanceId);
    }

    @Override public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    @Override public int getInstanceId() {
        return mInstanceId;
    }

    @Override public void destroy() {
        destroyTDFRenderManager(mInstanceId);
    }

    /**
     * Create native (C++) render manager instance.
     *
     * @return the unique id of native (C++) render manager
     */
    private native int createTDFRenderManager(float j_density);

    /**
     * Destroy native (C++) render manager instance.
     */
    private native void destroyTDFRenderManager(int instanceId);

    /**
     * Attach DomManager to native (C++) render manager instance
     */
    private native void attachToDom(int instanceId, int domId);

}
