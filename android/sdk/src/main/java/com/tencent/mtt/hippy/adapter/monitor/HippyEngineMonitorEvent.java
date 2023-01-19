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

@SuppressWarnings("unused")
public class HippyEngineMonitorEvent {

  public static final String ENGINE_LOAD_EVENT_INIT_INSTANCE = "initInstance";
  public static final String ENGINE_LOAD_EVENT_INIT_BRIDGE = "initBridge";
  public static final String ENGINE_LOAD_EVENT_LOAD_COMMONJS = "loadCommonJS";
  public static final String ENGINE_LOAD_EVENT_NOTIFY_ENGINE_INITED = "notifyEngineInited";
  public static final String MODULE_LOAD_EVENT_WAIT_ENGINE = "waitEngine";
  public static final String MODULE_LOAD_EVENT_WAIT_LOAD_BUNDLE = "waitLoadBundle";
  public static final String MODULE_LOAD_EVENT_LOAD_BUNDLE = "loadBundle";
  public static final String MODULE_LOAD_EVENT_RUN_BUNDLE = "runBundle";
  public static final String MODULE_LOAD_EVENT_CREATE_VIEW = "createView";
  public static final String MODULE_LOAD_EVENT_RESTORE_INSTANCE_STATE = "restoreInstanceState";
  public static final String SEPARATE_EVENT_INIT_JS_FRAMEWORK = "InitJsFramework";
  public static final String SEPARATE_EVENT_COMMON_LOAD_SOURCE = "CommonLoadSource";
  public static final String SEPARATE_EVENT_COMMON_EXECUTE_SOURCE = "CommonExecuteSource";
  public static final String SEPARATE_EVENT_SECONDARY_LOAD_SOURCE = "SecondaryLoadSource";
  public static final String SEPARATE_EVENT_SECONDARY_EXECUTE_SOURCE = "SecondaryExecuteSource";
  public static final String SEPARATE_EVENT_BRIDGE_STARTUP = "BridgeStartup";
  public static final String SEPARATE_EVENT_RUN_APPLICATION = "RunApplication";
  public static final String SEPARATE_EVENT_FP = "FP";

  public String eventName;
  public long startTime;
  public long endTime;
}
