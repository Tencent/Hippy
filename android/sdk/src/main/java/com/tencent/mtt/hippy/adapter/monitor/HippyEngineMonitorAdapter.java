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
package com.tencent.mtt.hippy.adapter.monitor;

import com.tencent.mtt.hippy.HippyRootView;

import java.util.List;

public interface HippyEngineMonitorAdapter
{

	int	ENGINE_LOAD_RESULT_SUCCESS	= 0;
	int	ENGINE_LOAD_RESULT_ERROR	= 1;
	int	ENGINE_LOAD_RESULE_TIMEOUT	= 2;

	void reportEngineLoadStart();

	void reportEngineLoadResult(int code, int loadTime, List<HippyEngineMonitorEvent> loadEvents, Throwable e);

	void reportModuleLoadComplete(HippyRootView rootView, int loadTime, List<HippyEngineMonitorEvent> loadEvents);

	boolean needReportBridgeANR();

	void reportBridgeANR(String message);

	void reportDoCallNatives(String moduleName, String moduleFunc);

	void reportGestureEventCallStack(String funcName, String msg);

	void reportClickEvent(Object object, boolean isCustomEvent);
}
