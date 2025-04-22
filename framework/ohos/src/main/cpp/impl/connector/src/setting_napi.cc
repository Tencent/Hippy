/*
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "connector/setting_napi.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"
#include "footstone/logging.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace setting {

static napi_value SetFlags(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  bool enableUpdateAnimLog = arkTs.GetBoolean(args[0]);
  
  footstone::gEnableUpdateAnimLog = enableUpdateAnimLog;
  
  return arkTs.GetUndefined();
}

static napi_value SetDensity(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  float density = (float)arkTs.GetDouble(args[0]);

  HRPixelUtils::SetDensity(density);

  return arkTs.GetUndefined();
}

static napi_value SetDensityScale(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  float densityScale = (float)arkTs.GetDouble(args[0]);
  
  HRPixelUtils::SetDensityScale(densityScale);
  
  return arkTs.GetUndefined();
}

static napi_value SetFontSizeScale(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  float fontSizeScale = (float)arkTs.GetDouble(args[0]);
  
  HRPixelUtils::SetFontSizeScale(fontSizeScale);
  
  return arkTs.GetUndefined();
}

static napi_value SetFontWeightScale(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  float fontSizeScale = (float)arkTs.GetDouble(args[0]);
  
  HRPixelUtils::SetFontWeightScale(fontSizeScale);
  
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("Setting", "Setting_SetFlags", SetFlags)
REGISTER_OH_NAPI("Setting", "Setting_SetDensity", SetDensity)
REGISTER_OH_NAPI("Setting", "Setting_SetDensityScale", SetDensityScale)
REGISTER_OH_NAPI("Setting", "Setting_SetFontSizeScale", SetFontSizeScale)
REGISTER_OH_NAPI("Setting", "Setting_SetFontWeightScale", SetFontWeightScale)

}
}
}
}
