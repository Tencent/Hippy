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

public enum HippyEngineMonitorPoint {
    INIT_JS_FRAMEWORK_START("hippyInitJsFrameworkStart"),
    INIT_JS_FRAMEWORK_END("hippyInitJsFrameworkEnd"),
    COMMON_LOAD_SOURCE_START("hippyCommonLoadSourceStart"),
    COMMON_LOAD_SOURCE_END("hippyCommonLoadSourceEnd"),
    COMMON_EXECUTE_SOURCE_START("hippyCommonExecuteSourceStart"),
    COMMON_EXECUTE_SOURCE_END("hippyCommonExecuteSourceEnd"),
    SECONDARY_LOAD_SOURCE_START("hippySecondaryLoadSourceStart"),
    SECONDARY_LOAD_SOURCE_END("hippySecondaryLoadSourceEnd"),
    SECONDARY_EXECUTE_SOURCE_START("hippySecondaryExecuteSourceStart"),
    SECONDARY_EXECUTE_SOURCE_END("hippySecondaryExecuteSourceEnd"),
    BRIDGE_STARTUP_START("hippyBridgeStartupStart"),
    BRIDGE_STARTUP_END("hippyBridgeStartupEnd"),
    RUN_APPLICATION_START("hippyRunApplicationStart"),
    RUN_APPLICATION_END("hippyRunApplicationEnd"),
    FIRST_PAINT_START("hippyFirstPaintStart"),
    FIRST_PAINT_END("hippyFirstPaintEnd");

    private final String value;

    HippyEngineMonitorPoint(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}
