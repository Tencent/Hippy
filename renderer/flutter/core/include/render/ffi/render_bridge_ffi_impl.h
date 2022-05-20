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
#include "render/ffi/render_bridge_ffi_impl.h"
#include "render/ffi/callback_manager.h"
#include "render/ffi/bridge_define.h"
#include "render/ffi/bridge_manager.h"
#include "render/queue/voltron_render_manager.h"

#ifdef __cplusplus
extern "C" {
#endif

EXTERN_C int32_t RegisterCallFunc(int32_t type, void *func);

EXTERN_C void UpdateNodeSize(int32_t engine_id, int32_t root_id,
                             int32_t node_id, double width, double height);

EXTERN_C void NotifyRenderManager(int32_t engine_id);

bool CallGlobalCallback(int32_t callback_id, int64_t value);

#ifdef __cplusplus
}
#endif
