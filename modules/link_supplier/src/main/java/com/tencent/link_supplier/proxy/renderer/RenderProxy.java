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

package com.tencent.link_supplier.proxy.renderer;

import android.app.Activity;
import android.content.Context;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import com.tencent.link_supplier.proxy.LinkProxy;
import com.tencent.link_supplier.proxy.framework.FrameworkProxy;

public interface RenderProxy extends LinkProxy {

    /**
     * Set framework proxy to renderer
     *
     * @param proxy {@link FrameworkProxy} interface
     */
    void setFrameworkProxy(@NonNull FrameworkProxy proxy);

    /**
     * Create root view by renderer
     *
     * @param context {@link Context} the root view container context, such as {@link Activity}
     */
    @NonNull
    ViewGroup createRootView(@NonNull Context context);
}
