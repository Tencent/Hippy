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

#include <stdint.h>

#if defined(__cplusplus)
#define HIPPY_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define HIPPY_EXTERN extern __attribute__((visibility("default")))
#endif

HIPPY_EXTERN uint32_t HippyViewProvider_CreateRoot(uint32_t first_dom_manager_id);
HIPPY_EXTERN void HippyViewProvider_DestroyRoot(uint32_t render_manager_id, uint32_t root_id);
HIPPY_EXTERN void HippyViewProvider_BindNativeRoot(void *parent_node_handle, uint32_t render_manager_id, uint32_t root_id);
HIPPY_EXTERN void HippyViewProvider_UnbindNativeRoot(uint32_t render_manager_id, uint32_t root_id);
HIPPY_EXTERN void HippyViewProvider_UpdateRootSize(uint32_t render_manager_id, uint32_t root_id, float width, float height);
