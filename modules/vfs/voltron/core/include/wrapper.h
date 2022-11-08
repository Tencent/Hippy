/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include <any>

#include "common_header.h"
#include "footstone/persistent_object_map.h"

namespace voltron {

extern std::atomic<uint32_t> global_data_holder_key;
extern footstone::utils::PersistentObjectMap<uint32_t, std::any> global_data_holder;

}

#ifdef __cplusplus
extern "C" {
#endif


EXTERN_C int32_t CreateVfsWrapper();

EXTERN_C void DestroyVfsWrapper(int32_t id);

EXTERN_C void OnDartInvokeAsync(int32_t id,
                                       const uint8_t *params,
                                       int32_t params_len,
                                       int32_t
                                       callback_id);

#ifdef __cplusplus
}
#endif
