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
#include <nlohmann/json.hpp>

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

EmbeddedViewNode::EmbeddedViewNode(RenderInfo render_info, const std::string &native_view_type)
    : ViewNode(render_info), native_view_type_(native_view_type) {}

std::shared_ptr<tdfcore::View> EmbeddedViewNode::CreateView() {
  auto view = TDF_MAKE_SHARED(tdfcore::EmbeddedView, native_view_type_);
  // 默认不要支持tdfcore手势，因为业务可以写一个全屏的自定义View在最上面但什么也不显示，从而把下面手势都竞技掉。
  view->SetSupportedGestures({});
  return view;
}

void EmbeddedViewNode::HandleStyleUpdate(const DomStyleMap &dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);
  auto s = DomStyleMap2Json(dom_style);
  property_ = {{kNodeInfoProps, s}};
  GetView<tdfcore::EmbeddedView>()->SetProperty(property_);
}

std::string EmbeddedViewNode::DomStyleMap2Json(const DomStyleMap &dom_style) {
  nlohmann::json j;

  for (auto& kv : dom_style) {
    auto value = kv.second;
    if (value->IsString()) {
      j[kv.first] = value->ToStringChecked();
    } else if (value->IsBoolean()) {
      j[kv.first] = value->ToBooleanChecked();
    } else if (value->IsInt32()) {
      j[kv.first] = value->ToInt32Checked();
    } else if (value->IsUInt32()) {
      j[kv.first] = value->ToUint32Checked();
    } else if (value->IsDouble()) {
      j[kv.first] = value->ToDoubleChecked();
    } else if (value->IsObject()) {
      auto sub_obj = value->ToObjectChecked();
      for (auto& sub_kv : sub_obj) {
        auto sub_value = sub_kv.second;
        if (sub_value.IsString()) {
          j[kv.first][sub_kv.first] = sub_value.ToStringChecked();
        } else if (sub_value.IsBoolean()) {
          j[kv.first][sub_kv.first] = sub_value.ToBooleanChecked();
        } else if (sub_value.IsInt32()) {
          j[kv.first][sub_kv.first] = sub_value.ToInt32Checked();
        } else if (sub_value.IsUInt32()) {
          j[kv.first][sub_kv.first] = sub_value.ToUint32Checked();
        } else if (sub_value.IsDouble()) {
          j[kv.first][sub_kv.first] = sub_value.ToDoubleChecked();
        }
      }
    }
  }

  std::string s = j.dump();
  return s;
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
