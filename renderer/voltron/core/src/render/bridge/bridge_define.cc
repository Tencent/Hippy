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
#include "port_holder.h"
#include "render/bridge/bridge_define.h"

constexpr char kRenderRegisterHeader[] = "voltron_renderer_register";

extern post_render_op GetPostRenderOpFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR)
        << "get post render op func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kRenderRegisterHeader,
                                        RenderFFIRegisterFuncType::kPostRenderOp);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get post render op func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<post_render_op>(func);
}

extern calculate_node_layout GetCalculateNodeLayoutFunc(uint32_t ffi_id) {
  auto port_holder = voltron::DartPortHolder::FindPortHolder(ffi_id);
  if (!port_holder) {
    FOOTSTONE_DLOG(ERROR)
        << "get calculate node layout func error, ffi port holder not found, ensure ffi module init";
    return nullptr;
  }

  auto func = port_holder->FindCallFunc(kRenderRegisterHeader,
                                        RenderFFIRegisterFuncType::kCalculateNodeLayout);
  if (!func) {
    FOOTSTONE_DLOG(ERROR) << "get calculate node layout  func error, func not found, ensure func has register";
    return nullptr;
  }
  return reinterpret_cast<calculate_node_layout>(func);
}
