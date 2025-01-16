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

#include <ace/xcomponent/native_interface_xcomponent.h>
#include <memory>
#include "renderer/native_render.h"
#include "renderer/uimanager/hr_manager.h"
#include "renderer/uimanager/hr_mutation.h"

namespace hippy {
inline namespace render {
inline namespace native {

class NativeRenderImpl : public NativeRender {
public:
  NativeRenderImpl(uint32_t instance_id, const std::string &bundle_path, bool is_rawfile, const std::string &res_module_name);
  ~NativeRenderImpl() = default;

  void InitRenderManager();

  uint32_t GetInstanceId() { return instance_id_; }
  
  void SetBundlePath(const std::string &bundle_path);

  void BindNativeRoot(ArkUI_NodeContentHandle contentHandle, uint32_t root_id, uint32_t node_id);
  void UnbindNativeRoot(uint32_t root_id, uint32_t node_id);
  void RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views);

  void DestroyRoot(uint32_t root_id);

  void DoCallbackForCallCustomTsView(uint32_t root_id, uint32_t node_id, uint32_t callback_id, const HippyValue &result);

  void CreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations);
  void PreCreateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRCreateMutation>> &mutations);
  void UpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations);
  void PreUpdateNode(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateMutation>> &mutations);
  void MoveNode(uint32_t root_id, const std::shared_ptr<HRMoveMutation> &mutation);
  void MoveNode2(uint32_t root_id, const std::shared_ptr<HRMove2Mutation> &mutation);
  void DeleteNode(uint32_t root_id, const std::vector<std::shared_ptr<HRDeleteMutation>> &mutations);
  void UpdateLayout(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateLayoutMutation>> &mutations);
  void UpdateEventListener(uint32_t root_id, const std::vector<std::shared_ptr<HRUpdateEventListenerMutation>> &mutations);
  void EndBatch(uint32_t root_id);

  bool CheckRegisteredEvent(uint32_t root_id, uint32_t node_id, std::string &event_name);

  void CallUIFunction(uint32_t root_id, uint32_t node_id, const std::string &functionName,
                      const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback);

  LayoutSize CustomMeasure(uint32_t root_id, uint32_t node_id,
    float width, LayoutMeasureMode width_measure_mode,
    float height, LayoutMeasureMode height_measure_mode);

  void SpanPosition(uint32_t root_id, uint32_t node_id, float x, float y);
  void TextEllipsized(uint32_t root_id, uint32_t node_id);

  std::string GetBundlePath() override;
  
  void OnSizeChanged(uint32_t root_id, float width, float height) override;
  void OnSizeChanged2(uint32_t root_id, uint32_t node_id, float width, float height, bool isSync) override;

  HRPosition GetRootViewtPositionInWindow(uint32_t root_id) override;

  uint64_t AddEndBatchCallback(uint32_t root_id, const EndBatchCallback &cb) override;
  void RemoveEndBatchCallback(uint32_t root_id, uint64_t cbId) override;

  bool GetViewParent(uint32_t root_id, uint32_t node_id, uint32_t &parent_id, std::string &parent_view_type);
  bool GetViewChildren(uint32_t root_id, uint32_t node_id, std::vector<uint32_t> &children_ids, std::vector<std::string> &children_view_types);
  void CallViewMethod(uint32_t root_id, uint32_t node_id, const std::string &method, const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback);
  void SetViewEventListener(uint32_t root_id, uint32_t node_id, napi_ref callback_ref);
  HRRect GetViewFrameInRoot(uint32_t root_id, uint32_t node_id);
  void AddBizViewInRoot(uint32_t root_id, uint32_t biz_view_id, ArkUI_NodeHandle node_handle, const HRPosition &position);
  void RemoveBizViewInRoot(uint32_t root_id, uint32_t biz_view_id);
  std::shared_ptr<HRManager> &GetHRManager() { return hr_manager_; }

private:
  uint32_t instance_id_;
  std::string bundle_path_;
  bool is_rawfile_ = false;
  std::string res_module_name_;
  std::shared_ptr<HRManager> hr_manager_;
};

} // namespace native
} // namespace render
} // namespace hippy
