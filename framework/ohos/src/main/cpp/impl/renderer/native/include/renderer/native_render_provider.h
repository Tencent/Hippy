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

#include <js_native_api.h>
#include <js_native_api_types.h>
#include <memory>
#include "renderer/native_render_impl.h"
#include "renderer/uimanager/hr_mutation.h"
#include "renderer/utils/hr_event_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

class NativeRenderProvider : public std::enable_shared_from_this<NativeRenderProvider>{
public:
  NativeRenderProvider(uint32_t instance_id, const std::string &bundle_path, bool is_rawfile, const std::string &res_module_name);
  ~NativeRenderProvider() = default;

  uint32_t GetInstanceId() { return instance_id_; }

  std::shared_ptr<NativeRenderImpl> &GetNativeRenderImpl() { return render_impl_; }

  void SetTsEnv(napi_env ts_env) { ts_env_ = ts_env; }
  void SetBundlePath(const std::string &bundle_path);

  void BindNativeRoot(ArkUI_NodeContentHandle contentHandle, uint32_t root_id, uint32_t node_id);
  void UnbindNativeRoot(uint32_t root_id, uint32_t node_id);

  void BindNativeRootToParent(ArkUI_NodeHandle parentNodeHandle, uint32_t root_id, uint32_t node_id);
  void UnbindNativeRootFromParent(uint32_t root_id, uint32_t node_id);

  void RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views);

  void DestroyRoot(uint32_t root_id, bool is_c_inteface);

  void DoCallbackForCallCustomTsView(uint32_t root_id, uint32_t node_id, uint32_t callback_id, const HippyValue &result);

  void CreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations);
  void PreCreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations);
  void UpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations);
  void PreUpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations);
  void MoveNode(uint32_t root_id, const std::shared_ptr<HRMoveMutation> &mutation);
  void MoveNode2(uint32_t root_id, const std::shared_ptr<HRMove2Mutation> &mutation);
  void DeleteNode(uint32_t root_id, const std::vector<std::shared_ptr<HRDeleteMutation>> &mutations);
  void UpdateLayout(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateLayoutMutation>> &mutations);
  void UpdateEventListener(uint32_t root_id,
                           const std::vector<std::shared_ptr<HRUpdateEventListenerMutation>> &mutations);
  void EndBatch(uint32_t root_id);
  
  void UpdateTextMeasurer(uint32_t root_id, uint32_t node_id, const std::shared_ptr<TextMeasurer> text_measurer, int32_t incCreateCount);

  void CallUIFunction(uint32_t root_id, uint32_t node_id, uint32_t cb_id, const std::string &func_name, const std::vector<HippyValue> &params);

  LayoutSize CustomMeasure(uint32_t root_id, uint32_t node_id,
    float width, LayoutMeasureMode width_measure_mode,
    float height, LayoutMeasureMode height_measure_mode);

  void SpanPosition(uint32_t root_id, uint32_t node_id, float x, float y);
  void TextEllipsized(uint32_t root_id, uint32_t node_id);
  
  void DispatchEvent(uint32_t root_id, uint32_t node_id, const std::string &event_name,
      const std::shared_ptr<HippyValue> &params, bool capture, bool bubble, HREventType event_type);
  void DoCallBack(int32_t result, uint32_t cb_id, const std::string &func_name,
      uint32_t root_id, uint32_t node_id, const HippyValue &params);

  bool GetViewParent(uint32_t root_id, uint32_t node_id, uint32_t &parent_id, std::string &parent_view_type);
  bool GetViewChildren(uint32_t root_id, uint32_t node_id, std::vector<uint32_t> &children_ids, std::vector<std::string> &children_view_types);
  void CallViewMethod(uint32_t root_id, uint32_t node_id, const std::string &method, const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback);
  void SetViewEventListener(uint32_t root_id, uint32_t node_id, napi_ref callback_ref);
  HRRect GetViewFrameInRoot(uint32_t root_id, uint32_t node_id);
  void AddBizViewInRoot(uint32_t root_id, uint32_t biz_view_id, ArkUI_NodeHandle node_handle, const HRPosition &position);
  void RemoveBizViewInRoot(uint32_t root_id, uint32_t biz_view_id);

private:
  constexpr static const char * EVENT_PREFIX = "on";

  napi_env ts_env_ = 0;
  uint32_t instance_id_;
  std::shared_ptr<NativeRenderImpl> render_impl_;
};

} // namespace native
} // namespace render
} // namespace hippy
