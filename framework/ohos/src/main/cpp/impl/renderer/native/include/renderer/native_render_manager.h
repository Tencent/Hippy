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
#include <atomic>
#include <memory>
#include <unordered_set>
#include <napi/native_api.h>
#include "dom/dom_node.h"
#include "dom/render_manager.h"
#include "footstone/persistent_object_map.h"
#include "footstone/serializer.h"
#include "footstone/macros.h"
#include "renderer/native_render_provider.h"

namespace hippy {
inline namespace render {
inline namespace native {

class StyleFilter {
public:
  StyleFilter();
  ~StyleFilter() = default;
  StyleFilter(const StyleFilter &) = delete;
  StyleFilter(StyleFilter &&) = delete;
  StyleFilter &operator=(const StyleFilter &) = delete;
  StyleFilter &operator=(StyleFilter &&) = delete;

  bool Enable(const std::string &style) { return styles_.find(style) != styles_.end(); }

private:
  std::unordered_set<std::string> styles_;
};

class NativeRenderManager : public RenderManager, public std::enable_shared_from_this<NativeRenderManager> {
 public:
  NativeRenderManager();

  virtual ~NativeRenderManager();
  NativeRenderManager(const NativeRenderManager &) = delete;
  NativeRenderManager &operator=(const NativeRenderManager &) = delete;
  NativeRenderManager(NativeRenderManager &&) = delete;
  NativeRenderManager &operator=(NativeRenderManager &&) = delete;

  inline uint32_t GetId() { return id_; }

  void SetRenderDelegate(napi_env ts_env, bool enable_ark_c_api, napi_ref ts_render_provider_ref,
                         std::set<std::string> &custom_views, std::set<std::string> &custom_measure_views, std::map<std::string, std::string> &mapping_views,
                         std::string &bundle_path, bool is_rawfile, const std::string &res_module_name);
  void SetBundlePath(const std::string &bundle_path);
  void InitDensity(double density, double density_scale, double font_size_scale, double font_weight_scale);
  void AddCustomFontPath(const std::string &fontFamilyName, const std::string &fontPath);

  void CreateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void DeleteRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes) override;
  void UpdateLayout(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes) override;
  void MoveRenderNode(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids,
                      int32_t from_pid, int32_t to_pid, int32_t index) override;
  void EndBatch(std::weak_ptr<RootNode> root_node) override;

  void BeforeLayout(std::weak_ptr<RootNode> root_node) override;
  void AfterLayout(std::weak_ptr<RootNode> root_node) override;

  using HippyValue = footstone::value::HippyValue;
  using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

  void AddEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void RemoveEventListener(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name) override;

  void CallFunction(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                    uint32_t cb_id) override;

  void ReceivedEvent(std::weak_ptr<RootNode> root_node, uint32_t dom_id, const std::string& event_name,
                     const std::shared_ptr<HippyValue>& params, bool capture, bool bubble);

  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<NativeRenderManager>>& PersistentMap() {
    return persistent_map_;
  }

  static std::shared_ptr<StyleFilter> GetStyleFilter() {
    static std::shared_ptr<StyleFilter> style_filter = std::make_shared<StyleFilter>();
    return style_filter;
  }

  void BindNativeRoot(ArkUI_NodeContentHandle contentHandle, uint32_t root_id, uint32_t node_id);
  void UnbindNativeRoot(uint32_t root_id, uint32_t node_id);

  void BindNativeRootToParent(ArkUI_NodeHandle parentNodeHandle, uint32_t root_id, uint32_t node_id);
  void UnbindNativeRootFromParent(uint32_t root_id, uint32_t node_id);

  void DestroyRoot(uint32_t root_id);

  void DoCallbackForCallCustomTsView(uint32_t root_id, uint32_t node_id, uint32_t callback_id, const HippyValue &result);

  bool GetViewParent(uint32_t root_id, uint32_t node_id, uint32_t &parent_id, std::string &parent_view_type);
  bool GetViewChildren(uint32_t root_id, uint32_t node_id, std::vector<uint32_t> &children_ids, std::vector<std::string> &children_view_types);
  void CallViewMethod(uint32_t root_id, uint32_t node_id, const std::string &method, const std::vector<HippyValue> params, std::function<void(const HippyValue &result)> callback);
  void SetViewEventListener(uint32_t root_id, uint32_t node_id, napi_ref callback_ref);
  HRRect GetViewFrameInRoot(uint32_t root_id, uint32_t node_id);
  void AddBizViewInRoot(uint32_t root_id, uint32_t biz_view_id, ArkUI_NodeHandle node_handle, const HRPosition &position);
  void RemoveBizViewInRoot(uint32_t root_id, uint32_t biz_view_id);
  std::shared_ptr<NativeRenderProvider> &GetNativeRenderProvider() { return c_render_provider_; }

private:
  inline void MarkTextDirty(std::weak_ptr<RootNode> weak_root_node, uint32_t node_id);

  inline float DpToPx(float dp) const;

  inline float PxToDp(float px) const;

  void CallNativeMethod(const std::string& method, uint32_t root_id, const std::pair<uint8_t*, size_t>& buffer);

  void CallNativeMethod(const std::string& method, uint32_t root_id);

  void CallNativeMeasureMethod(const uint32_t root_id, const int32_t id, const float width, const int32_t width_mode, const float height,
                               const int32_t height_mode, int64_t& result);

  void CallNativeCustomMeasureMethod(const uint32_t root_id, const int32_t id, const float width, const int32_t width_mode,
                                     const float height, const int32_t height_mode, int64_t &result);

  void DoMeasureText(const std::weak_ptr<RootNode> root_node, const std::weak_ptr<hippy::dom::DomNode> dom_node,
                     const float width, const int32_t width_mode,
                     const float height, const int32_t height_mode, int64_t &result);

  bool IsCustomMeasureNode(const std::string &name);
  bool IsCustomMeasureCNode(const std::string &name);

  void HandleListenerOps(std::weak_ptr<RootNode> root_node, std::map<uint32_t, std::vector<ListenerOp>>& ops, const std::string& method_name);

  void CreateRenderNode_TS(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void CreateRenderNode_C(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes);
  void UpdateRenderNode_TS(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void UpdateRenderNode_C(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes);
  void DeleteRenderNode_TS(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void DeleteRenderNode_C(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes);
  void MoveRenderNode_TS(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void MoveRenderNode_C(std::weak_ptr<RootNode> root_node, std::vector<std::shared_ptr<DomNode>> &&nodes);
  void UpdateLayout_TS(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>>& nodes);
  void UpdateLayout_C(std::weak_ptr<RootNode> root_node, const std::vector<std::shared_ptr<DomNode>> &nodes);
  void MoveRenderNode_TS(std::weak_ptr<RootNode> root_node, std::vector<int32_t>&& moved_ids,
                        int32_t from_pid, int32_t to_pid, int32_t index);
  void MoveRenderNode_C(std::weak_ptr<RootNode> root_node, std::vector<int32_t> &&moved_ids, int32_t from_pid,
                        int32_t to_pid, int32_t index);
  void EndBatch_TS(std::weak_ptr<RootNode> root_node);
  void EndBatch_C(std::weak_ptr<RootNode> root_node);
  void CallFunction_TS(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> domNode, const std::string &name,
                       const DomArgument &param, uint32_t cb_id);
  void CallFunction_C(std::weak_ptr<RootNode> root_node, std::weak_ptr<DomNode> domNode, const std::string &name,
                      const DomArgument &param, uint32_t cb_id);
  void HandleListenerOps_TS(std::weak_ptr<RootNode> root_node, std::map<uint32_t, std::vector<ListenerOp>> &ops,
                            const std::string &method_name);
  void HandleListenerOps_C(std::weak_ptr<RootNode> root_node, std::map<uint32_t, std::vector<ListenerOp>> &ops,
                           const std::string &method_name);
  LayoutSize CallNativeCustomMeasureMethod_C(uint32_t root_id, uint32_t node_id,
    float width, LayoutMeasureMode width_measure_mode,
    float height, LayoutMeasureMode height_measure_mode);

  std::shared_ptr<DomNode> GetAncestorTextNode(const std::shared_ptr<DomNode> &node);
  bool GetTextNodeSizeProp(const std::shared_ptr<DomNode> &node, float &width, float &height);
  
private:
  uint32_t id_;
  napi_env ts_env_ = 0;
  napi_ref ts_render_provider_ref_ = 0;

  std::set<std::string> custom_measure_views_;
  std::unordered_map<std::string, std::string> custom_font_path_map_;

  std::shared_ptr<footstone::value::Serializer> serializer_;
  
  static std::atomic<uint32_t> unique_native_render_manager_id_;
  static footstone::utils::PersistentObjectMap<uint32_t, std::shared_ptr<NativeRenderManager>> persistent_map_;

  bool enable_ark_c_api_ = false;
  std::shared_ptr<NativeRenderProvider> c_render_provider_;
  
  std::shared_ptr<FontCollectionManager> font_collection_manager_;
#ifdef OHOS_DRAW_TEXT
  std::shared_ptr<DrawTextNodeManager> draw_text_node_manager_;
#endif
};

}  // namespace native
}  // namespace render
}  // namespace hippy
