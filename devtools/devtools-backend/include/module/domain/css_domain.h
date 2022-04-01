//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <functional>
#include <map>
#include <memory>
#include <string>
#include "module/domain/base_domain.h"
#include "module/model/css_model.h"
#include "module/request/css_edit_style_texts_request.h"
#include "module/request/css_node_data_request.h"

namespace tdf {
namespace devtools {

/**
 * @brief CSSModel数据回调
 */
using CSSStyleDataCallback = std::function<void(CSSModel model)>;

/**
 * @brief 根据node id请求单个节点的style数据
 * @param node_id 节点id
 * @param callback 数据回调
 */
using CSSDataRequestCallback = std::function<void(int32_t node_id, CSSStyleDataCallback callback)>;

/**
 * @brief CSS domain 处理类
 *        处理 frontend 分发过来的 CSS 相关的 method
 */
class CSSDomain : public BaseDomain {
 public:
  explicit CSSDomain(std::weak_ptr<DomainDispatch> dispatch);
  std::string_view GetDomainName() override;
  void RegisterMethods() override;

 private:
  void GetMatchedStylesForNode(const CSSNodeDataRequest& request);
  void GetComputedStyleForNode(const CSSNodeDataRequest& request);
  void GetInlineStylesForNode(const CSSNodeDataRequest& request);
  void SetStyleTexts(const CSSEditStyleTextsRequest& request);

  CSSDataRequestCallback css_data_call_back_;
  std::map<int32_t, nlohmann::json> style_text_map_;
  std::map<int32_t, uint32_t> request_call_back_count_map_;
};
}  // namespace devtools
}  // namespace tdf
