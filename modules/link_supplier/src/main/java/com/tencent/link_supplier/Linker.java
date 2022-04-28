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

import androidx.annotation.NonNull;

import com.tencent.link_supplier.proxy.LinkProxy;
import com.tencent.link_supplier.proxy.dom.DomProxy;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.RenderProxy;
import java.util.concurrent.atomic.AtomicInteger;

public class Linker implements LinkHelper {

    private static final int ROOT_VIEW_ID_INCREMENT = 10;
    private static final AtomicInteger sRootIdCounter = new AtomicInteger(0);
    private RenderProxy mRenderProxy;
    private DomProxy mDomProxy;
    private AnimationManagerProxy mAniManagerProxy;
    private final int mRootId;

    public Linker() {
        mRootId = sRootIdCounter.addAndGet(ROOT_VIEW_ID_INCREMENT);
    }

    public Linker(int rootId) {
        mRootId = rootId;
    }

    @Override
    public void setFrameworkProxy(@NonNull FrameworkProxy frameworkProxy) {
        if (mRenderProxy != null) {
            mRenderProxy.setFrameworkProxy(frameworkProxy);
        }
    }

    @Override
    public void createDomHolder() {
        if (mDomProxy == null) {
            mDomProxy = new DomHolder();
        }
    }

    @Override
    public void createAnimationManager() {
        if (mAniManagerProxy == null && mDomProxy != null) {
            mAniManagerProxy = new AnimationManagerProxy(mDomProxy.getInstanceId());
        }
    }


    @Override
    public void createDomHolder(int instanceId) {
        if (mDomProxy == null) {
            mDomProxy = new DomHolder(instanceId);
        }
    }

    @Override
    public void createRenderer(RenderMode mode) throws RuntimeException {
        switch (mode) {
            case TDF_RENDER:
                // TODO: Create TDF renderer.
                break;
            case FLUTTER_RENDER:
                // TODO: Create Flutter renderer.
                break;
            case NATIVE_RENDER:
            default:
                mRenderProxy = createNativeRenderer();
        }
        if (mRenderProxy == null) {
            throw new RuntimeException(
                    "Serious error: Failed to create renderer instance!");
        }
        mRenderProxy.setRootId(mRootId);
    }

    @Override
    public RenderProxy getRenderer() {
        return mRenderProxy;
    }

    @Override
    public DomProxy getDomHolder() {
        return mDomProxy;
    }

    @Override
    public void bind(int frameworkId) {
        doBind(mDomProxy.getInstanceId(), mRenderProxy.getInstanceId(), frameworkId);
    }

    @Override
    public void updateAnimationNode(byte[] params, int offset, int length) {
        updateAnimationNode(mAniManagerProxy.getInstanceId(), params, offset, length);
    }

    @Override
    public void destroy() {
        if (mDomProxy != null) {
            mDomProxy.destroy();
            mDomProxy = null;
        }
        if (mAniManagerProxy != null) {
            mAniManagerProxy.destroy();
            mAniManagerProxy = null;
        }
        if (mRenderProxy != null) {
            mRenderProxy.destroy();
            mRenderProxy = null;
        }
    }

    private class DomHolder implements DomProxy {

        private final int mInstanceId;

        public DomHolder() {
            mInstanceId = createDomInstance(mRootId);
        }

        /**
         * Support init dom holder with existing instance id
         */
        @SuppressWarnings("unused")
        public DomHolder(int instanceId) {
            mInstanceId = instanceId;
        }

        @Override
        public int getInstanceId() {
            return mInstanceId;
        }

        @Override
        public void destroy() {
            destroyDomInstance(mInstanceId);
        }
    }

    private class AnimationManagerProxy implements LinkProxy {

        private final int mInstanceId;

        public AnimationManagerProxy(int domId) {
            mInstanceId = createAnimationManager(domId);
        }

        @Override
        public int getInstanceId() {
            return mInstanceId;
        }

        @Override
        public void destroy() {
            destroyAnimationManager(mInstanceId);
        }
    }

    private RenderProxy createNativeRenderer() {
        try {
            Class nativeRendererClass = Class
                    .forName("com.tencent.renderer.NativeRenderer");
            return (RenderProxy) (nativeRendererClass.newInstance());
        } catch (Throwable e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Create native (C++) dom manager instance.
     *
     * @param rootId root view id
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomInstance(int rootId);

    /**
     * Create native (C++) dom manager instance.
     *
     * @param domId dom instance id
     * @return the unique id of native (C++) animation manager
     */
    private native int createAnimationManager(int domId);

    /**
     * Release native (C++) dom manager instance.
     *
     * @param instanceId the unique id of native (C++) dom manager
     */
    private native void destroyDomInstance(int instanceId);

    /**
     * Release native (C++) dom manager instance.
     *
     * @param instanceId the unique id of native (C++) dom manager
     */
    private native void destroyAnimationManager(int instanceId);

    /**
     * Bind native (C++) dom manager, render manager and framework with instance id.
     *
     * @param domId dom manager instance id
     * @param renderId render manager instance id
     * @param frameworkId framework instance id
     */
    private native void doBind(int domId, int renderId, int frameworkId);

    /**
     * Update node property on animation update, params buffer format: [ { animationId: nodeId:
     * animationKey: animationValue: } ]
     *
     * @param aniId dom manager instance id
     * @param params params buffer encoded by serializer
     * @param offset start position of params buffer
     * @param length available total length of params buffer
     */
    private native void updateAnimationNode(int aniId, byte[] params, int offset, int length);
}
