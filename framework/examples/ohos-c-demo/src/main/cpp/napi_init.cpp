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
#include "napi/native_api.h"
#include "biz_view_manager.h"
#include <arkui/native_node_napi.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"

napi_value BindNativeBizView(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value args[2] = {nullptr};

  napi_get_cb_info(env, info, &argc, args , nullptr, nullptr);
  
  // NodeContent
  ArkUI_NodeContentHandle contentHandle = nullptr;
  auto code = OH_ArkUI_GetNodeContentFromNapiValue(env, args[0], &contentHandle);
  if (code != ARKUI_ERROR_CODE_NO_ERROR || !contentHandle) {
    return nullptr;
  }

  uint32_t biz_view_id = 0;
  napi_get_value_uint32(env, args[1], &biz_view_id);

  BizViewManager::GetInstance()->BindBizNativeView(contentHandle, biz_view_id);

  return nullptr;
}

napi_value UnbindNativeBizView(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1] = {nullptr};

  napi_get_cb_info(env, info, &argc, args , nullptr, nullptr);
  
  uint32_t biz_view_id = 0;
  napi_get_value_uint32(env, args[0], &biz_view_id);
  
  BizViewManager::GetInstance()->UnbindBizNativeView(biz_view_id);
  
  return nullptr;
}

napi_value OnHippyRootViewReady(napi_env env, napi_callback_info info) {
  BizViewManager::GetInstance()->OnHippyRootViewReady();
  return nullptr;
}

napi_value TestDestroy(napi_env env, napi_callback_info info) {
  BizViewManager::GetInstance()->TestDestroy();
  return nullptr;
}

REGISTER_OH_NAPI("Demo", "Demo_BindNativeBizView", BindNativeBizView)
REGISTER_OH_NAPI("Demo", "Demo_UnbindNativeBizView", UnbindNativeBizView)
REGISTER_OH_NAPI("Demo", "Demo_OnHippyRootViewReady", OnHippyRootViewReady)
REGISTER_OH_NAPI("Demo", "Demo_TestDestroy", TestDestroy)
