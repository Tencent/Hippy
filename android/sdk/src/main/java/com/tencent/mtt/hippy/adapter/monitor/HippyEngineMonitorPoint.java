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
