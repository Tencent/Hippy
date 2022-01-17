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
import androidx.annotation.Nullable;
import com.tencent.link_supplier.proxy.dom.DomProxy;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;
import com.tencent.link_supplier.proxy.renderer.RenderProxy;

/**
 * Provide for framework to create dom manager and renderer instance when initialization.
 */
public interface LinkHelper {

    enum RenderMode {
        NATIVE_RENDER,
        TDF_RENDER,
        FLUTTER_RENDER
    }

    /**
     * Get renderer instance
     *
     * @return {@link RenderProxy} interface
     */
    @Nullable
    RenderProxy getRenderer();

    /**
     * Get dom holder instance
     *
     * @return {@link DomProxy} interface
     */
    @SuppressWarnings("unused")
    @Nullable
    DomProxy getDomHolder();

    /**
     * Set framework proxy to renderer
     *
     * @param frameworkProxy {@link FrameworkProxy} interface
     */
    void setFrameworkProxy(@NonNull FrameworkProxy frameworkProxy);

    /**
     * Create renderer
     *
     * @param mode {@link RenderMode}
     */
    void createRenderer(RenderMode mode);

    /**
     * Create dom holder, will call native jni {@link Linker#createDomInstance()}
     */
    void createDomHolder();

    /**
     * Create dom holder with instance id, just set new id, not call native jni {@link
     * Linker#createDomInstance()}
     *
     * @param instanceId existing dom instance id
     */
    @SuppressWarnings("unused")
    void createDomHolder(int instanceId);

    /**
     * Will call native jni {@link Linker#doBind()} to bind framework with dom manager
     * and renderer, if call by js framework should wait until js bridge initialized.
     *
     * @param frameworkId framework instance id
     */
    void bind(int frameworkId);

    /**
     * Will destroy native (C++) dom manager and renderer instance, call by framework.
     */
    void destroy();
}
