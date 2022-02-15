//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/1/19.
//

#pragma once

#if TDF_SERVICE_ENABLED
#include "devtools/devtool_data_source.h"
#include "devtools_backend/devtools_backend_service.h"

#define DEVTOOLS_JS_REGISTER_RECEIVE_V8_RESPONSE(result) hippy::devtools::DevtoolDataSource::SendV8Response(result)

#define DEVTOOLS_JS_REGISTER_TRACE_CONTROL(trace_control) \
  hippy::devtools::DevtoolDataSource::OnGlobalTracingControlGenerate(trace_control)

#define DEVTOOLS_INIT_V8_TRACING_CACHE(trace_dir) \
  tdf::devtools::DevtoolsBackendService::GetInstance().SetFileCacheDir(trace_dir)

#else
#define DEVTOOLS_JS_REGISTER_RECEIVE_V8_RESPONSE(result) void(0)
#define DEVTOOLS_JS_REGISTER_TRACE_CONTROL(trace_control) void(0)
#define DEVTOOLS_INIT_V8_TRACING_CACHE(trace_dir) void(0)
#endif
