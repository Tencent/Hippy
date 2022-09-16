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

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;

import com.tencent.link_supplier.proxy.LinkProxy;
import com.tencent.link_supplier.proxy.dom.DomProxy;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.RenderProxy;
import java.util.concurrent.atomic.AtomicInteger;

public class Linker implements LinkHelper {

    private static final int ROOT_VIEW_ID_INCREMENT = 10;
    private static final AtomicInteger sRootIdCounter = new AtomicInteger(0);
    private final int mWorkerManagerId;
    private RenderProxy mRenderProxy;
    private DomProxy mDomProxy;

    public Linker() {
        mWorkerManagerId = createWorkerManager();
    }

    public Linker(int workerManagerId) {
        mWorkerManagerId = workerManagerId;
    }

    @Override
    public int getWorkerManagerId() {
        return mWorkerManagerId;
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
    public void createDomHolder(int rootId, int instanceId) {
        if (mDomProxy == null) {
            mDomProxy = new DomHolder(rootId, instanceId);
        }
    }

    @NonNull
    public View createRootView(@NonNull Context context) {
        if (mRenderProxy == null || mDomProxy == null) {
            throw new RuntimeException(
                    "Should create renderer and dom instance before create root view!");
        }
        int rootId = sRootIdCounter.addAndGet(ROOT_VIEW_ID_INCREMENT);
        mDomProxy.addRootId(rootId);
        return mRenderProxy.createRootView(context, rootId);
    }

    public void destroyRootView(int rootId) {
        if (mDomProxy != null) {
            mDomProxy.removeRootId(rootId);
        }
    }

    @Override
    public void createRenderer(RenderMode mode) throws RuntimeException {
        try {
            Class rendererClass = Class.forName("com.tencent.renderer." + mode.renderClassName);
            mRenderProxy = (RenderProxy) (rendererClass.newInstance());
        } catch (Throwable e) {
            e.printStackTrace();
        }
        if (mRenderProxy == null) {
            throw new RuntimeException(
                    "Serious error: Failed to create renderer instance!");
        }
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
    public void bind(int runtimeId) {
        doBind(mDomProxy.getInstanceId(), mRenderProxy.getInstanceId(), runtimeId);
    }

    @Override
    public void connect(int runtimeId, int rootId) {
        doConnect(runtimeId, rootId);
    }

    @Override
    public void destroy(boolean onReLoad) {
        if (mRenderProxy != null) {
            mRenderProxy.destroy();
            mRenderProxy = null;
        }
        if (!onReLoad) {
            if (mDomProxy != null) {
              mDomProxy.destroy();
              mDomProxy = null;
            }
            destroyWorkerManager(mWorkerManagerId);
        }
    }

    private class DomHolder implements DomProxy {

        private final int mInstanceId;

        public DomHolder() {
            mInstanceId = createDomInstance(mWorkerManagerId);
        }

        /**
         * Support init dom holder with existing root node id
         */
        public DomHolder(int rootId, int instanceId) {
            mInstanceId = instanceId;
            addRoot(mInstanceId, rootId);
        }

        @Override
        public int getInstanceId() {
            return mInstanceId;
        }

        @Override
        public void destroy() {
            destroyDomInstance(mWorkerManagerId, mInstanceId);
        }

        @Override
        public void addRootId(int rootId) {
            addRoot(mInstanceId, rootId);
        }

        @Override
        public void removeRootId(int rootId) {
            removeRoot(mInstanceId, rootId);
        }
    }

    /**
     * Create native (C++) worker manager instance.
     *
     * @return the unique id of native (C++) worker manager
     */
    private native int createWorkerManager();

    /**
     * Destroy native (C++) worker manager instance.
     *
     * @param workerManagerId the unique id of native (C++) worker manager
     */
    private native void destroyWorkerManager(int workerManagerId);

    /**
     * Create native (C++) dom manager instance.
     *
     * @return the unique id of native (C++) dom manager
     */
    private native int createDomInstance(int workerManagerId);

    /**
     * Release native (C++) dom manager instance.
     * @param workerManagerId the unique id of native (C++) worker manager
     * @param domId the unique id of native (C++) dom manager
     */
    private native void destroyDomInstance(int workerManagerId, int domId);

    /**
     * Bind native (C++) dom manager, render manager and driver run time with instance id.
     *
     * @param domId dom manager instance id
     * @param renderId render manager instance id
     * @param runtimeId driver runtime id
     */
    private native void doBind(int domId, int renderId, int runtimeId);

    /**
     * Add the specified root id to native (C++) dom manager.
     *
     * @param domId the unique id of native (C++) dom manager
     * @param rootId the root node id
     */
    private native void addRoot(int domId, int rootId);

    /**
     * Remove the specified root id from native (C++) dom manager.
     *
     * @param domId the unique id of native (C++) dom manager
     * @param rootId the root node id
     */
    private native void removeRoot(int domId, int rootId);

    /**
     * Connect runtime instance with root node.
     *
     * @param runtimeId driver runtime id
     * @param rootId the root node id
     */
    private native void doConnect(int runtimeId, int rootId);
}
