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

package com.tencent.renderer;

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.Callback;
import java.util.List;
import java.util.Map;

public interface RenderProxy {

    /**
     * Get renderer instance identify.
     *
     * @return the instance id of renderer.
     */
    int getInstanceId();

    /**
     * Will destroy renderer instance.
     */
    void destroy();

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
     * @return the rootView {@link ViewGroup} will attach to host view tree
     */
    @NonNull
    View createRootView(@NonNull Context context);

    /**
     * Get root view by root id
     *
     * @param rootId the id of root view
     * @return the rootView {@link ViewGroup} has been registered
     */
    @Nullable
    View getRootView(int rootId);

    /**
     * Find view by node id
     *
     * @param rootId the id of root view
     * @param nodeId the id of view
     * @return the view has been registered
     */
    @Nullable
    View findViewById(int rootId, int nodeId);

    /**
     * Notify renderer the host life cycle {@link android.app.Activity} onResume call back
     */
    void onResume();

    /**
     * Notify renderer the host life cycle {@link android.app.Activity} onPause call back
     */
    void onPause();

    /**
     * Initialize the native renderer after call createRenderer interface.
     *
     * @param controllers the list of controller extends from {@link com.tencent.mtt.hippy.uimanager.HippyViewController}
     * @param rootView the already exists root view, for example after reload in debug mode, root
     * view will be reused.
     */
    void init(@Nullable List<Class<?>> controllers, @Nullable ViewGroup rootView);

    /**
     * Add controllers after hippy engine initialization, use for engine preloading.
     *
     * @param controllers the list of controller extends from {@link com.tencent.mtt.hippy.uimanager.HippyViewController}
     */
    void addControllers(@NonNull List<Class<?>> controllers);

    /**
     * Notify renderer the root view instance delete by framework.
     */
    void destroyRoot(int rootId);

    /**
     * Notify renderer the js bridger has been initialized.
     */
    void onRuntimeInitialized(int rootId);

    /**
     * Notify renderer to record node tree snapshot.
     */
    void recordSnapshot(int rootId, @NonNull final Callback<byte[]> callback);

    /**
     * Notify renderer to replay node tree snapshot with node buffer.
     */
    View replaySnapshot(@NonNull Context context, @NonNull byte[] buffer);

    /**
     * Notify renderer to replay node tree snapshot with node map.
     */
    View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap);

    /**
     * Notify renderer to remove snapshot view and delete snapshot node.
     */
    void removeSnapshotView();

}
