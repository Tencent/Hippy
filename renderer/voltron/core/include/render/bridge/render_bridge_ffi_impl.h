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

#include "common_header.h"
#include "callback_manager.h"
#include "render/bridge/bridge_define.h"
#include "render/bridge/bridge_manager.h"
#include "render/queue/voltron_render_manager.h"

#ifdef __cplusplus
extern "C" {
#endif
// 由于头文件没有其他模块引用，会导致在so中符号表隐藏，这里加个常量引用，避免库优化
EXTERN_C const char* KeepRenderLibStr();

EXTERN_C uint32_t CreateVoltronRenderProvider(double density);

EXTERN_C void DestroyVoltronRenderProvider(uint32_t render_manager_id);

EXTERN_C void CallNativeFunctionFFI(int32_t engine_id, uint32_t render_manager_id,
                                    const char16_t *call_id,
                                    const uint8_t *params, int32_t params_len,
                                    int32_t keep);

EXTERN_C void CallNativeEventFFI(uint32_t render_manager_id, uint32_t root_id,
                                 int32_t node_id, const char16_t *event,
                                 bool capture, bool bubble,
                                 const uint8_t *params, int32_t params_len);

EXTERN_C void UpdateNodeSize(uint32_t render_manager_id, uint32_t root_id,
                             int32_t node_id, double width, double height);

EXTERN_C void Notify(int32_t engine_id, uint32_t render_manager_id);

EXTERN_C uint32_t CreateDomInstance();

EXTERN_C void DestroyDomInstance(uint32_t dom_manager_id);

EXTERN_C void AddRoot(uint32_t dom_manager_id, uint32_t root_id);

EXTERN_C void RemoveRoot(uint32_t dom_manager_id, uint32_t root_id);

#ifdef __cplusplus
}
#endif
