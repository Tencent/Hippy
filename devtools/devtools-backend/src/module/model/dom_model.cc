/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#include "module/model/dom_model.h"
#include <sstream>
#include "api/devtools_backend_service.h"
#include "devtools_base/logging.h"
#include "devtools_base/parse_json_util.h"
#include "devtools_base/tdf_base_util.h"
#include "devtools_base/tdf_string_util.h"
#include "module/inspect_props.h"

namespace hippy::devtools {
constexpr char kRoot[] = "root";
constexpr char kRootId[] = "rootId";
constexpr char kNodeId[] = "nodeId";
constexpr char kNodes[] = "nodes";
constexpr char kBackendNodeId[] = "backendNodeId";
constexpr char kNodeType[] = "nodeType";
constexpr char kChildren[] = "children";
constexpr char kChildNodeCount[] = "childNodeCount";
constexpr char kNodeName[] = "nodeName";
constexpr char kLocalName[] = "localName";
constexpr char kNodeValue[] = "nodeValue";
constexpr char kParentId[] = "parentId";
constexpr char kAttributes[] = "attributes";
constexpr char kLayoutX[] = "x";
constexpr char kLayoutY[] = "y";
constexpr char kLayoutWidth[] = "width";
constexpr char kLayoutHeight[] = "height";
constexpr char kBaseURL[] = "baseURL";
constexpr char kDocumentURL[] = "documentURL";
constexpr char kBoxModel[] = "model";
constexpr char kBoxModelContent[] = "content";
constexpr char kBackendId[] = "backendId";
constexpr char kFrameId[] = "frameId";
constexpr char kMainFrame[] = "main_frame";
constexpr char kDomDataStyle[] = "style";
constexpr char kDocumentName[] = "#document";
constexpr int32_t kDocumentNodeId = -3;
constexpr int32_t kDocumentChildNodeCount = 1;
constexpr int32_t kInvalidNodeId = -1;

DOMModel DOMModel::CreateModelByJSON(const nlohmann::json& json) {
  assert(json.is_object());
  DOMModel model;
  model.SetNodeId(TDFParseJSONUtil::GetJSONValue(json, kNodeId, 0));
  model.SetParentId(TDFParseJSONUtil::GetJSONValue(json, kParentId, 0));
  model.SetRootId(TDFParseJSONUtil::GetJSONValue(json, kRootId, 0));
  model.SetX(TDFParseJSONUtil::GetJSONValue(json, kLayoutX, 0.0));
  model.SetY(TDFParseJSONUtil::GetJSONValue(json, kLayoutY, 0.0));
  model.SetWidth(TDFParseJSONUtil::GetJSONValue(json, kLayoutWidth, 0.0));
  model.SetHeight(TDFParseJSONUtil::GetJSONValue(json, kLayoutHeight, 0.0));
  model.SetNodeName(TDFParseJSONUtil::GetJSONValue(json, kNodeName, model.GetNodeName()));
  model.SetNodeValue(TDFParseJSONUtil::GetJSONValue(json, kNodeValue, model.GetNodeValue()));
  model.SetLocalName(TDFParseJSONUtil::GetJSONValue(json, kLocalName, model.GetLocalName()));
  model.SetChildNodeCount(TDFParseJSONUtil::GetJSONValue(json, kChildNodeCount, 0));
  model.SetAttributes(TDFParseJSONUtil::GetJSONValue(json, kAttributes, nlohmann::json::object()));
  model.SetStyle(TDFParseJSONUtil::GetJSONValue(json, kDomDataStyle, nlohmann::json::object()));
  auto children_json = json.find(kChildren);
  if (children_json == json.end()) {
    return model;
  }
  for (auto& child : children_json.value()) {
    model.GetChildren().emplace_back(CreateModelByJSON(child));
  }
  return model;
}

nlohmann::json DOMModel::GetDocumentJSON() {
  auto document_json = nlohmann::json::object();
  auto root_json = nlohmann::json::object();
  // document root
  root_json[kNodeId] = kDocumentNodeId;
  root_json[kBackendNodeId] = kDocumentNodeId;
  root_json[kNodeType] = static_cast<int32_t>(DomNodeType::kDocumentFragmentNode);
  root_json[kChildNodeCount] = child_node_count_;
  root_json[kNodeName] = kDocumentName;
  root_json[kBaseURL] = "";
  root_json[kDocumentURL] = "";

  auto child_json = nlohmann::json::array();
  for (auto& child : children_) {
    child_json.emplace_back(child.GetNodeJSON(DomNodeType::kElementNode));
  }
  root_json[kChildren] = child_json;
  document_json[kRoot] = root_json;

  return document_json;
}

nlohmann::json DOMModel::GetBoxModelJSON() {
  auto result_json = nlohmann::json::object();
  auto box_model_json = nlohmann::json::object();
  auto border = GetBoxModelBorder();
  auto padding = GetBoxModelPadding(border);
  auto content = GetBoxModelContent(padding);
  auto margin = GetBoxModelMargin(border);
  box_model_json[kBoxModelContent] = content;
  box_model_json[kPadding] = padding;
  box_model_json[kBorder] = border;
  box_model_json[kMargin] = margin;
  box_model_json[kLayoutWidth] = width_;
  box_model_json[kLayoutHeight] = height_;
  result_json[kBoxModel] = box_model_json;
  return result_json;
}

nlohmann::json DOMModel::GetNodeForLocation(int32_t node_id) {
  auto node_json = nlohmann::json::object();
  node_json[kBackendId] = node_id;
  node_json[kFrameId] = kMainFrame;
  node_json[kNodeId] = node_id;
  return node_json;
}

nlohmann::json DOMModel::GetChildNodesJSON() {
  auto node_json = nlohmann::json::object();
  node_json[kParentId] = node_id_;
  auto node_children_json = nlohmann::json::array();
  for (auto& child : children_) {
    node_children_json.emplace_back(child.GetNodeJSON(DomNodeType::kElementNode));
  }
  node_json[kNodes] = node_children_json;
  return node_json;
}

nlohmann::json DOMModel::GetNodeJSON(DomNodeType node_type) {
  auto node_json = ParseNodeBasicJSON(node_type);
  auto child_json = nlohmann::json::array();
  if (!node_value_.empty()) {
    child_json.emplace_back(GetTextNodeJSON());
  }
  for (auto& child : children_) {
    child_json.emplace_back(child.GetNodeJSON(node_type));
  }
  if (!child_json.empty()) {
    node_json[kChildren] = child_json;
  }
  return node_json;
}

nlohmann::json DOMModel::GetTextNodeJSON() {
  auto node_json = ParseNodeBasicJSON(DomNodeType::kTextNode);
  node_json[kChildNodeCount] = 0;
  node_json[kChildren] = nlohmann::json::array();
  return node_json;
}

nlohmann::json DOMModel::GetBoxModelBorder() {
  auto border = nlohmann::json::array();
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetBoxModelBorder ScreenAdapter is null");
    return border;
  }
  auto x = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, x_);
  auto y = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, y_);
  auto width = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, width_);
  auto height = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, height_);
  // left-top
  border.emplace_back(x);
  border.emplace_back(y);
  // right-top
  border.emplace_back(x + width);
  border.emplace_back(y);
  // right-bottom
  border.emplace_back(x + width);
  border.emplace_back(y + height);
  // left-bottom
  border.emplace_back(x);
  border.emplace_back(y + height);
  return border;
}

nlohmann::json DOMModel::GetBoxModelPadding(const nlohmann::json& border) {
  auto padding = nlohmann::json::array();
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetBoxModelPadding ScreenAdapter is null");
    return padding;
  }
  if (!style_.is_object() || !border.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelPadding, style isn't object");
    return padding;
  }
  int32_t border_top = 0, border_right = 0, border_left = 0, border_bottom = 0;
  auto border_width_it = style_.find(kBorderWidth);
  if (border_width_it != style_.end()) {
    border_top = border_width_it.value();
    border_left = border_width_it.value();
    border_right = border_width_it.value();
    border_bottom = border_width_it.value();
  }
  auto border_top_it = style_.find(kBorderTopWidth);
  if (border_top_it != style_.end()) {
    border_top = border_top_it.value();
  }
  auto border_left_it = style_.find(kBorderLeftWidth);
  if (border_left_it != style_.end()) {
    border_left = border_left_it.value();
  }
  auto border_right_it = style_.find(kBorderRightWidth);
  if (border_right_it != style_.end()) {
    border_right = border_right_it.value();
  }
  auto border_bottom_it = style_.find(kBorderBottomWidth);
  if (border_bottom_it != style_.end()) {
    border_bottom = border_bottom_it.value();
  }
  border_left = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, border_left);
  border_top = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, border_top);
  border_right = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, border_right);
  border_bottom = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, border_bottom);
  auto border_vector = border.get<std::vector<int32_t>>();
  padding.emplace_back(border_vector[0] + border_left);
  padding.emplace_back(border_vector[1] + border_top);
  padding.emplace_back(border_vector[2] - border_right);
  padding.emplace_back(border_vector[3] + border_top);
  padding.emplace_back(border_vector[4] - border_right);
  padding.emplace_back(border_vector[5] - border_bottom);
  padding.emplace_back(border_vector[6] + border_left);
  padding.emplace_back(border_vector[7] - border_bottom);
  return padding;
}

nlohmann::json DOMModel::GetBoxModelContent(const nlohmann::json& padding) {
  auto content = nlohmann::json::array();
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetBoxModelContent ScreenAdapter is null");
    return content;
  }
  if (!style_.is_object() || !padding.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelContent, style isn't object");
    return content;
  }
  int32_t padding_top = 0, padding_right = 0, padding_left = 0, padding_bottom = 0;
  auto padding_it = style_.find(kPadding);
  if (padding_it != style_.end()) {
    padding_top = padding_it.value();
    padding_left = padding_it.value();
    padding_right = padding_it.value();
    padding_bottom = padding_it.value();
  }
  auto padding_top_it = style_.find(kPaddingTop);
  if (padding_top_it != style_.end()) {
    padding_top = padding_top_it.value();
  }
  auto padding_left_it = style_.find(kPaddingLeft);
  if (padding_left_it != style_.end()) {
    padding_left = padding_left_it.value();
  }
  auto padding_right_it = style_.find(kPaddingRight);
  if (padding_right_it != style_.end()) {
    padding_right = padding_right_it.value();
  }
  auto padding_bottom_it = style_.find(kPaddingBottom);
  if (padding_bottom_it != style_.end()) {
    padding_bottom = padding_bottom_it.value();
  }
  padding_left = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, padding_left);
  padding_top = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, padding_top);
  padding_right = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, padding_right);
  padding_bottom = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, padding_bottom);
  auto padding_vector = padding.get<std::vector<int32_t>>();
  content.emplace_back(padding_vector[0] + padding_left);
  content.emplace_back(padding_vector[1] + padding_top);
  content.emplace_back(padding_vector[2] - padding_right);
  content.emplace_back(padding_vector[3] + padding_top);
  content.emplace_back(padding_vector[4] - padding_right);
  content.emplace_back(padding_vector[5] - padding_bottom);
  content.emplace_back(padding_vector[6] + padding_left);
  content.emplace_back(padding_vector[7] - padding_bottom);
  return content;
}

nlohmann::json DOMModel::GetBoxModelMargin(const nlohmann::json& border) {
  auto margin = nlohmann::json::array();
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetBoxModelPadding ScreenAdapter is null");
    return margin;
  }
  if (!style_.is_object() || !border.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelMargin, style isn't object");
    return margin;
  }
  int32_t margin_top = 0, margin_right = 0, margin_left = 0, margin_bottom = 0;
  auto margin_it = style_.find(kMargin);
  if (margin_it != style_.end()) {
    margin_top = margin_it.value();
    margin_left = margin_it.value();
    margin_right = margin_it.value();
    margin_bottom = margin_it.value();
  }
  auto margin_top_it = style_.find(kMarginTop);
  if (margin_top_it != style_.end()) {
    margin_top = margin_top_it.value();
  }
  auto margin_left_it = style_.find(kMarginLeft);
  if (margin_left_it != style_.end()) {
    margin_left = margin_left_it.value();
  }
  auto margin_right_it = style_.find(kMarginRight);
  if (margin_right_it != style_.end()) {
    margin_right = margin_right_it.value();
  }
  auto margin_bottom_it = style_.find(kMarginBottom);
  if (margin_bottom_it != style_.end()) {
    margin_bottom = margin_bottom_it.value();
  }
  margin_left = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, margin_left);
  margin_top = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, margin_top);
  margin_right = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, margin_right);
  margin_bottom = TDFBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, margin_bottom);
  auto border_vector = border.get<std::vector<int32_t>>();
  margin.emplace_back(border_vector[0] - margin_left);
  margin.emplace_back(border_vector[1] - margin_top);
  margin.emplace_back(border_vector[2] + margin_right);
  margin.emplace_back(border_vector[3] - margin_top);
  margin.emplace_back(border_vector[4] + margin_right);
  margin.emplace_back(border_vector[5] + margin_bottom);
  margin.emplace_back(border_vector[6] - margin_left);
  margin.emplace_back(border_vector[7] + margin_bottom);
  return margin;
}

nlohmann::json DOMModel::ParseNodeBasicJSON(DomNodeType node_type) {
  auto node_json = nlohmann::json::object();
  auto result_id = node_id_;
  if (node_type == DomNodeType::kTextNode) {
    // text node id need be negative
    result_id = -node_id_;
  }
  node_json[kNodeId] = result_id;
  node_json[kBackendNodeId] = backend_node_id_;
  node_json[kNodeType] = static_cast<int32_t>(node_type);
  node_json[kLocalName] = local_name_;
  node_json[kNodeName] = node_name_;
  node_json[kNodeValue] = node_value_;
  node_json[kParentId] = parent_id_;
  node_json[kChildNodeCount] = child_node_count_;
  node_json[kAttributes] = ParseAttributesObjectToArray();
  return node_json;
}

nlohmann::json DOMModel::ParseAttributesObjectToArray() {
  nlohmann::json attributes_array = nlohmann::json::array();
  if (!attributes_.is_object()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, attributes isn't object, parse error, return empty");
    return attributes_array;
  }
  for (auto& attribute : attributes_.items()) {
    auto value = attribute.value();
    bool is_string_empty = value.is_string() && value.get<std::string>().empty();
    if (is_string_empty || value.is_null()) {
      continue;
    }
    if (attribute.key() == kDomDataStyle && value.is_object()) {
      // parse to inline style
      std::stringstream style_stream;
      for (auto& inline_style : value.items()) {
        style_stream << inline_style.key() << ":" << inline_style.value() << ";";
      }
      value = style_stream.str();
    }
    if (!value.is_string()) {
      // non string type need change to string type
      value = TDFStringUtil::Characterization(value);
    }
    attributes_array.emplace_back(attribute.key());
    attributes_array.emplace_back(value);
  }
  return attributes_array;
}

}  // namespace hippy::devtools
