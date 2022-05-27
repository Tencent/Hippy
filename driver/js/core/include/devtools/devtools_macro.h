/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#pragma once

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"

#define DEVTOOLS_JS_REGISTER_TRACE_CONTROL(trace_control) \
  hippy::devtools::DevtoolsDataSource::OnGlobalTracingControlGenerate(trace_control)

#define DEVTOOLS_INIT_VM_TRACING_CACHE(trace_dir) \
  hippy::devtools::DevtoolsDataSource::SetFileCacheDir(trace_dir)

#else
#define DEVTOOLS_JS_REGISTER_TRACE_CONTROL(trace_control) void(0)
#define DEVTOOLS_INIT_VM_TRACING_CACHE(trace_dir) void(0)
#endif
