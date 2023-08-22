/**
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

#include "renderer/tdf/viewnode/embedded_view_node.h"
#include "footstone/serializer.h"
#include "core/common/base64.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#include "tdfui/view/embedded_view.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdf {

static constexpr const char kNodeInfoProps[] = "props";

EmbeddedViewNode::EmbeddedViewNode(const std::shared_ptr<hippy::dom::DomNode> &dom_node, RenderInfo render_info,
                                   const std::string &native_view_type)
    : ViewNode(dom_node, render_info), native_view_type_(native_view_type) {}

std::shared_ptr<tdfcore::View> EmbeddedViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto view = TDF_MAKE_SHARED(tdfcore::EmbeddedView, context, native_view_type_);
  // 默认不要支持tdfcore手势，因为业务可以写一个全屏的自定义View在最上面但什么也不显示，从而把下面手势都竞技掉。
  view->SetSupportedGestures({});
  return view;
}

void EmbeddedViewNode::HandleStyleUpdate(const DomStyleMap &dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
  auto s = DomStyleMap2String(dom_style);
  property_ = {{kNodeInfoProps, s}};
  GetView<tdfcore::EmbeddedView>()->SetProperty(property_);
}

std::string EmbeddedViewNode::DomStyleMap2String(const DomStyleMap &dom_style) {
  footstone::value::HippyValue::HippyValueObjectType value;
  for (auto& kv : dom_style) {
    value[kv.first] = *(kv.second);
  }

  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  serializer.WriteValue(footstone::value::HippyValue(value));
  std::pair<uint8_t*, size_t> buffer = serializer.Release();
  return tdfcore::Base64::Encode(buffer.first, buffer.second);
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
