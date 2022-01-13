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

import android.view.ViewGroup;
import androidx.annotation.Nullable;
import com.tencent.link_supplier.LinkHelper;
import java.util.List;

public interface NativeRenderProxy extends RenderProxy {

    /**
     * Initialize the native renderer after call {@link LinkHelper} createRenderer interface.
     *
     * @param controllers framework instance id
     * @param rootView the already exists root view, for example after reload in debug mode, root
     * view will be reused.
     */
    void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView);

    /**
     * Notify renderer the host life cycle {@link android.app.Activity} onResume call back
     */
    void onResume();

    /**
     * Notify renderer the host life cycle {@link android.app.Activity} onPause call back
     */
    void onPause();

    /**
     * Notify renderer the root view instance delete by framework.
     */
    void onRootDestroy();

    Object getDomManagerObject();

    Object getRenderManagerObject();
}
