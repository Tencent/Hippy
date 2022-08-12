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

#include <cstdint>

enum class RenderFFIRegisterFuncType {
  kGlobalCallback,
  kPostRenderOp,
  kCalculateNodeLayout
};

typedef void (*global_callback)(int32_t callback_id, int64_t value);
typedef void (*post_render_op)(int32_t engine_id, int32_t root_id, const void* data, int64_t length);
typedef int64_t* (*calculate_node_layout)(int32_t engine_id, int32_t root_id, int32_t node_id, double width,
                                          int32_t width_mode, double height, int32_t height_mode);
typedef int32_t (*register_call_func_ex)(int32_t type, void *func);

extern global_callback global_callback_func;
extern post_render_op post_render_op_func;
extern calculate_node_layout calculate_node_layout_func;
extern register_call_func_ex ex_register_func;


