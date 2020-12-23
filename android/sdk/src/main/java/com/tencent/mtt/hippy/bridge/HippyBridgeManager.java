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
package com.tencent.mtt.hippy.bridge;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;


/**
 * FileName: HippyBridgeManager
 * Description：
 * History：
 */
public interface HippyBridgeManager
{
	void initBridge(Callback<Boolean> callback);

	void runBundle(int id, HippyBundleLoader loader, HippyEngine.ModuleListener listener, HippyRootView hippyRootView);

	void notifyModuleJsException(final HippyJsException exception);

	void loadInstance(String name, int id, HippyMap params);

	void resumeInstance(int id);

	void pauseInstance(int id);

	void destroyInstance(int id);

	void execCallback(Object params);

	void destroy();

	void callJavaScriptModule(String mName, String name, Object params);

}
