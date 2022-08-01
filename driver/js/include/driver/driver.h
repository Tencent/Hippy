/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include "driver/base/common.h"
#include "driver/base/file.h"
#include "driver/base/macros.h"
#include "driver/base/uri_loader.h"
#include "driver/engine.h"
#include "driver/modules/console_module.h"
#include "driver/modules/contextify_module.h"
#include "driver/modules/module_base.h"
#include "driver/modules/module_register.h"
#include "driver/modules/timer_module.h"
#include "driver/napi/callback_info.h"
#include "driver/napi/js_native_api.h"
#include "driver/napi/js_native_api_types.h"
#include "driver/napi/native_source_code.h"
#include "driver/scope.h"

#ifdef JS_V8
#include "driver/napi/v8/js_native_api_v8.h"
#include "driver/napi/v8/js_native_turbo_v8.h"
#include "driver/runtime/v8/bridge.h"
#if defined(ENABLE_INSPECTOR) && !defined(V8_WITHOUT_INSPECTOR)
#include "driver/runtime/v8/inspector/v8_inspector_client_impl.h"
#endif
#else
#include "driver/napi/jsc/js_native_api_jsc.h"
#include "driver/napi/jsc/js_native_jsc_helper.h"
#include "driver/napi/jsc/js_native_turbo_jsc.h"
#endif
