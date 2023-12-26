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

#include "connector/native_renderer_napi.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/ark_ts.h"
#include "renderer/native_render_manager.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"
#include "renderer/native_render_params.h"

using DomArgument = hippy::dom::DomArgument;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using HippyValue = footstone::value::HippyValue;
using NativeRenderManager = hippy::NativeRenderManager;
using RenderManager = hippy::dom::RenderManager;
using RootNode = hippy::dom::RootNode;
using Scene = hippy::dom::Scene;

namespace hippy {
inline namespace framework {
inline namespace connector {
inline namespace renderer {
inline namespace native {

static napi_value CreateNativeRenderManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto enable_ark_c_api = arkTs.GetBoolean(args[0]);
  auto ts_render_provider_ref = arkTs.CreateReference(args[1]);
  
  std::set<std::string> custom_views;
  auto ts_array = args[2];
  if (arkTs.IsArray(ts_array)) {
    auto length = arkTs.GetArrayLength(ts_array);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i ++) {
        auto ts_view = arkTs.GetArrayElement(ts_array, i);
        auto view_name = arkTs.GetString(ts_view);
        if (view_name.length() > 0) {
          custom_views.insert(view_name);
        }
      }
    }
  }

  std::set<std::string> custom_measure_views;
  ts_array = args[3];
  if (arkTs.IsArray(ts_array)) {
    auto length = arkTs.GetArrayLength(ts_array);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i ++) {
        auto ts_view = arkTs.GetArrayElement(ts_array, i);
        auto view_name = arkTs.GetString(ts_view);
        if (view_name.length() > 0) {
          custom_measure_views.insert(view_name);
        }
      }
    }
  }
  
  std::map<std::string, std::string> mapping_views;
  ts_array = args[4];
  if (arkTs.IsArray(ts_array)) {
    auto length = arkTs.GetArrayLength(ts_array);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i += 2) {
        auto ts_view = arkTs.GetArrayElement(ts_array, i);
        auto view_name = arkTs.GetString(ts_view);
        if (view_name.length() > 0 && i + 1 < length) {
          auto ts_mapped_view = arkTs.GetArrayElement(ts_array, i + 1);
          auto mapped_view_name = arkTs.GetString(ts_mapped_view);
          if (mapped_view_name.length() > 0) {
            mapping_views[view_name] = mapped_view_name;
          }
        }
      }
    }
  }
  
  auto bundle_path = arkTs.GetString(args[5]);
  auto density = arkTs.GetDouble(args[6]);
  auto density_scale = arkTs.GetDouble(args[7]);
  auto font_size_scale = arkTs.GetDouble(args[8]);
  auto is_rawfile = arkTs.GetBoolean(args[9]);
  auto res_module_name = arkTs.GetString(args[10]);
  
  auto render_manager = std::make_shared<NativeRenderManager>();

  render_manager->SetRenderDelegate(env, enable_ark_c_api, ts_render_provider_ref, custom_views, custom_measure_views, mapping_views, bundle_path, is_rawfile, res_module_name);
  render_manager->InitDensity(density, density_scale, font_size_scale);
  auto render_id = hippy::global_data_holder_key.fetch_add(1);
  auto flag = hippy::global_data_holder.Insert(render_id,
                                               std::static_pointer_cast<RenderManager>(render_manager));
  FOOTSTONE_CHECK(flag);
  return arkTs.CreateInt(static_cast<int>(render_id));
}

static napi_value DestroyNativeRenderManager(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  uint32_t render_manager_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  auto flag = hippy::global_data_holder.Erase(render_manager_id);
  FOOTSTONE_DCHECK(flag);
  return arkTs.GetUndefined();
}

static napi_value SetBundlePath(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t render_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  auto bundle_path = arkTs.GetString(args[1]);

  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_id, render_manager);
  FOOTSTONE_CHECK(flag);
  auto render_manager_object = std::any_cast<std::shared_ptr<RenderManager>>(render_manager);
  auto native_render_manager = std::static_pointer_cast<NativeRenderManager>(render_manager_object);

  native_render_manager->SetBundlePath(bundle_path);
  
  return arkTs.GetUndefined();
}

static napi_value InitRendererParams(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  auto statusBarHeight = (float)arkTs.GetDouble(args[0]);
  NativeRenderParams::InitParams(statusBarHeight);
  return arkTs.GetUndefined();
}

static napi_value RegisterCustomFontWithPaths(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 2);
  uint32_t render_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));

  // get native_render_manager
  std::any render_manager;
  auto flag = hippy::global_data_holder.Find(render_id, render_manager);
  FOOTSTONE_CHECK(flag);
  auto render_manager_object = std::any_cast<std::shared_ptr<RenderManager>>(render_manager);
  auto native_render_manager = std::static_pointer_cast<NativeRenderManager>(render_manager_object);
  
  // get fontFamily:fontPath map
  std::map<std::string, std::string> font_path_map;
  auto ts_array = args[1];
  if (arkTs.IsArray(ts_array)) {
    auto length = arkTs.GetArrayLength(ts_array);
    if (length > 0) {
      for (uint32_t i = 0; i < length; i += 2) {
        auto ts_font_family = arkTs.GetArrayElement(ts_array, i);
        auto font_family = arkTs.GetString(ts_font_family);
        if (font_family.length() > 0 && i + 1 < length) {
          auto ts_font_path = arkTs.GetArrayElement(ts_array, i + 1);
          auto font_path = arkTs.GetString(ts_font_path);
          if (font_path.length() > 0) {
            font_path_map[font_family] = font_path;
          }
        }
      }
    }
  }
    
  for (const std::pair<const std::string, std::string>& item : font_path_map) {
    native_render_manager->AddCustomFontPath(item.first, item.second);
  }
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("NativeRenderer", "NativeRenderer_CreateNativeRenderManager", CreateNativeRenderManager)
REGISTER_OH_NAPI("NativeRenderer", "NativeRenderer_DestroyNativeRenderManager", DestroyNativeRenderManager)
REGISTER_OH_NAPI("NativeRenderer", "NativeRenderer_SetBundlePath", SetBundlePath)
REGISTER_OH_NAPI("NativeRenderer", "NativeRenderer_InitRendererParams", InitRendererParams)
REGISTER_OH_NAPI("NativeRenderer", "NativeRenderer_RegisterFontPaths", RegisterCustomFontWithPaths)

}
}
}
}
}
