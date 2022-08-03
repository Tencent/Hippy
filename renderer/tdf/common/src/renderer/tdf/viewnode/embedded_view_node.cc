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

#include "core/tdfi/view/embedded_view.h"
#include "nlohmann/json.hpp"

namespace tdfrender {

using nlohmann::json;

static constexpr const char kNodeInfoProps[] = "props";
static json ParseDomPrimitiveToJson(const std::shared_ptr<footstone::HippyValue> &value);
static json ParseDomArrayToJson(const footstone::HippyValue::DomValueArrayType &dom_array);
static json ParseDomObjectToJson(const footstone::HippyValue::HippyValueObjectType &dom_object);
static json ParseSharedDomValueToJson(const std::shared_ptr<footstone::HippyValue> &dom_value);

static json ParseDomPrimitiveToJson(const std::shared_ptr<footstone::HippyValue> &value) {
  if (value->IsString()) {
    return value->ToStringChecked();
  } else if (value->IsBoolean()) {
    return value->ToBooleanChecked();
  } else if (value->IsDouble()) {
    return value->ToDoubleChecked();
  } else if (value->IsInt32()) {
    return value->ToInt32Checked();
  } else if (value->IsUInt32()) {
    return value->ToUint32Checked();
  }
  return nullptr;
}

static json ParseDomArrayToJson(const footstone::HippyValue::DomValueArrayType &dom_array) {
  auto target_array = json::array();
  for (const auto &item : dom_array) {
    if (item.IsObject()) {
      target_array.push_back(ParseDomObjectToJson(item.ToObjectChecked()));
    } else if (item.IsArray()) {
      target_array.push_back(ParseDomArrayToJson(item.ToArrayChecked()));
    } else {
      target_array.push_back(ParseDomPrimitiveToJson(std::make_shared<footstone::HippyValue>(item)));
    }
  }
}

static json ParseDomObjectToJson(const footstone::HippyValue::HippyValueObjectType &dom_object) {
  json root;
  for (auto iterator : dom_object) {
    root[iterator.first] = ParseSharedDomValueToJson(std::make_shared<footstone::HippyValue>(iterator.second));
  }
  return root;
}

static json ParseSharedDomValueToJson(const std::shared_ptr<footstone::HippyValue> &dom_value) {
  if (dom_value->IsObject()) {
    return ParseDomObjectToJson(dom_value->ToObjectChecked());
  } else if (dom_value->IsArray()) {
    return ParseDomArrayToJson(dom_value->ToArrayChecked());
  } else {
    return ParseDomPrimitiveToJson(dom_value);
  }
}

static std::string GetJSONStringWithProps(const DomStyleMap &dom_style) {
  json root;
  for (auto iterator : dom_style) {
    root[iterator.first] = ParseSharedDomValueToJson(iterator.second);
  }

  return root.dump();
}

EmbeddedViewNode::EmbeddedViewNode(RenderInfo render_info, const std::string &native_view_type)
    : ViewNode(render_info), native_view_type_(native_view_type) {}

std::shared_ptr<tdfcore::View> EmbeddedViewNode::CreateView() {
  return TDF_MAKE_SHARED(tdfcore::EmbeddedView, native_view_type_);
}

void EmbeddedViewNode::HandleStyleUpdate(const DomStyleMap &dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  auto json_string = GetJSONStringWithProps(dom_style);
  property_ = {{kNodeInfoProps, std::move(json_string)}};
  GetView<tdfcore::EmbeddedView>()->SetProperty(property_);
}

}  // namespace tdfrender
