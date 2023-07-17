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

package com.tencent.mtt.hippy.modules;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;

import java.util.List;

public interface HippyModuleManager {

    void callNatives(HippyCallNativeParams params);

    void destroy();

    HippyNativeModuleInfo getModuleInfo(@NonNull String moduleName);

    <T extends HippyJavaScriptModule> T getJavaScriptModule(Class<T> cls);

    <T extends HippyNativeModuleBase> T getNativeModule(Class<T> cls);

    <T extends HippyNativeModuleBase> void addNativeModule(Class<T> cls, Provider<T> provider);

    /**
    * Add native modules and java script modules defined in {@link HippyAPIProvider}.
    *
    * @param apiProviders API providers need to be added.
    */
    void addModules(List<HippyAPIProvider> apiProviders);

    /**
     * Get the number of native module, use for data report
     * @return native module count
     */
    int getNativeModuleCount();
}
