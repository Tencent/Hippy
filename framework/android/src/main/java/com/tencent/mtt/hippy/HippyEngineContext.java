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

package com.tencent.mtt.hippy;

import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.openhippy.connector.DomManager;
import com.openhippy.connector.JsDriver;
import com.openhippy.connector.RenderConnector;
import com.tencent.devtools.DevtoolsManager;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.common.BaseEngineContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import com.tencent.vfs.VfsManager;
import java.util.HashMap;

public interface HippyEngineContext extends BaseEngineContext {

    String getComponentName();

    @Nullable
    HashMap<String, Object> getNativeParams();

    @Nullable
    HippyMap getJsParams();

    @NonNull
    VfsManager getVfsManager();

    @NonNull
    JsDriver getJsDriver();

    @NonNull
    TimeMonitor getMonitor();

    HippyGlobalConfigs getGlobalConfigs();

    HippyModuleManager getModuleManager();

    HippyBridgeManager getBridgeManager();

    DevSupportManager getDevSupportManager();

    DevtoolsManager getDevtoolsManager();

    ThreadExecutor getThreadExecutor();

    ViewGroup getRootView();

    View getRootView(int rootId);

    @Nullable
    View findViewById(int nodeId);

    void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

    void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener);

    void handleException(Throwable throwable);

    int getDomManagerId();

    DomManager getDomManager();

    RenderConnector getRenderer();

    int getVfsId();

    int getDevtoolsId();

    void onRuntimeInitialized();

    void onBridgeDestroyed(boolean isReload, Throwable e);

    void onLoadModuleCompleted(ModuleLoadStatus statusCode, @Nullable String msg);

    void onLoadInstanceCompleted(long result, String reason);
}
