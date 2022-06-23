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
constexpr char kNodeIds[] = "nodeIds";
constexpr char kDocumentName[] = "#document";
constexpr int32_t kDocumentNodeId = -3;

DomModel DomModel::CreateModel(const nlohmann::json& json) {
  assert(json.is_object());
  DomModel model;
  model.SetNodeId(TdfParseJsonUtil::GetJsonValue(json, kNodeId, 0));
  model.SetBackendNodeId(model.GetNodeId());
  model.SetParentId(TdfParseJsonUtil::GetJsonValue(json, kParentId, 0));
  model.SetRootId(TdfParseJsonUtil::GetJsonValue(json, kRootId, 0));
  model.SetX(TdfParseJsonUtil::GetJsonValue(json, kLayoutX, 0.0));
  model.SetY(TdfParseJsonUtil::GetJsonValue(json, kLayoutY, 0.0));
  model.SetWidth(TdfParseJsonUtil::GetJsonValue(json, kLayoutWidth, 0.0));
  model.SetHeight(TdfParseJsonUtil::GetJsonValue(json, kLayoutHeight, 0.0));
  model.SetNodeName(TdfParseJsonUtil::GetJsonValue(json, kNodeName, model.GetNodeName()));
  model.SetNodeValue(TdfParseJsonUtil::GetJsonValue(json, kNodeValue, model.GetNodeValue()));
  model.SetLocalName(TdfParseJsonUtil::GetJsonValue(json, kLocalName, model.GetLocalName()));
  model.SetChildNodeCount(static_cast<uint32_t>(TdfParseJsonUtil::GetJsonValue(json, kChildNodeCount, 0)));
  model.SetAttributes(TdfParseJsonUtil::GetJsonValue(json, kAttributes, nlohmann::json::object()));
  model.SetStyle(TdfParseJsonUtil::GetJsonValue(json, kDomDataStyle, nlohmann::json::object()));
  auto children_json = json.find(kChildren);
  if (children_json == json.end()) {
    return model;
  }
  for (auto& child : children_json.value()) {
    model.GetChildren().emplace_back(CreateModel(child));
  }
  return model;
}

nlohmann::json DomModel::BuildDocumentJson() {
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
    child_json.emplace_back(child.BuildNodeJson(DomNodeType::kElementNode));
  }
  root_json[kChildren] = child_json;
  document_json[kRoot] = root_json;

  return document_json;
}

nlohmann::json DomModel::BuildBoxModelJson() {
  auto result_json = nlohmann::json::object();
  auto box_model_json = nlohmann::json::object();
  auto border = BuildBoxModelBorder();
  auto padding = BuildBoxModelPadding(border);
  auto content = BuildBoxModelContent(padding);
  auto margin = BuildBoxModelMargin(border);
  box_model_json[kBoxModelContent] = content;
  box_model_json[kPadding] = padding;
  box_model_json[kBorder] = border;
  box_model_json[kMargin] = margin;
  box_model_json[kLayoutWidth] = width_;
  box_model_json[kLayoutHeight] = height_;
  result_json[kBoxModel] = box_model_json;
  return result_json;
}

nlohmann::json DomModel::BuildNodeForLocation(int32_t node_id) {
  auto node_json = nlohmann::json::object();
  node_json[kBackendId] = node_id;
  node_json[kFrameId] = kMainFrame;
  node_json[kNodeId] = node_id;
  return node_json;
}

nlohmann::json DomModel::BuildChildNodesJson() {
  auto node_json = nlohmann::json::object();
  node_json[kParentId] = node_id_;
  auto node_children_json = nlohmann::json::array();
  for (auto& child : children_) {
    node_children_json.emplace_back(child.BuildNodeJson(DomNodeType::kElementNode));
  }
  node_json[kNodes] = node_children_json;
  return node_json;
}

nlohmann::json DomModel::BuildPushNodeIds(std::vector<int32_t>& node_ids) {
  if (node_ids.empty()) {
    return nlohmann::json::object();
  }
  auto result = nlohmann::json::object();
  result[kNodeIds] = node_ids;
  return result;
}

nlohmann::json DomModel::BuildPushHitNode(int32_t hit_node_id) {
  auto result = nlohmann::json::object();
  result[kNodeId] = hit_node_id;
  return result;
}

nlohmann::json DomModel::BuildNodeJson(DomNodeType node_type) {
  auto node_json = BuildNodeBasicJson(node_type);
  auto child_json = nlohmann::json::array();
  if (!node_value_.empty()) {
    child_json.emplace_back(BuildTextNodeJson());
  }
  for (auto& child : children_) {
    child_json.emplace_back(child.BuildNodeJson(node_type));
  }
  if (!child_json.empty()) {
    node_json[kChildren] = child_json;
  }
  return node_json;
}

nlohmann::json DomModel::BuildTextNodeJson() {
  auto node_json = BuildNodeBasicJson(DomNodeType::kTextNode);
  node_json[kChildNodeCount] = 0;
  node_json[kChildren] = nlohmann::json::array();
  return node_json;
}

nlohmann::json DomModel::BuildBoxModelBorder() {
  auto border = nlohmann::json::array();
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetBoxModelBorder ScreenAdapter is null");
    return border;
  }
  auto x = TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, x_);
  auto y = TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, y_);
  auto width = TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, width_);
  auto height = TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, height_);
  //  left-top                  right-top
  //  (border[0],border[1])     (border[2],border[3])
  //     --------------------------
  //     |                        |
  //     |         Border         |
  //     |                        |
  //     --------------------------
  //  left-bottom               right-bottom
  //  (border[6],border[7])     (border[4],border[5])
  //
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

nlohmann::json DomModel::BuildBoxModelPadding(const nlohmann::json& border) {
  auto padding = nlohmann::json::array();
  if (!border.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelPadding, border isn't array");
    return padding;
  }
  std::vector<std::string> keys = {kBorderWidth, kBorderLeftWidth, kBorderTopWidth, kBorderRightWidth,
                                   kBorderBottomWidth};
  auto ltrb_values = GetLeftTopRightBottomValueFromStyle(keys);
  if (ltrb_values.empty()) {
    return padding;
  }
  auto border_vector = border.get<std::vector<int32_t>>();
  //  left-top                  right-top
  //  (padding[0],padding[1])   (padding[2],padding[3])
  //     --------------------------
  //     | border                 |
  //     |   ------------------   |
  //     |   | padding        |   |
  //     |   |                |   |
  //     |   ------------------   |
  //     --------------------------
  //  left-bottom               right-bottom
  //  (padding[6],padding[7])   (padding[4],padding[5])
  //  pdding in border
  //  left-top = (border_x + border_left, border_y + border_top)
  //  right-top = (border_x - border_right, border_y + border_top)
  //  right-bottom = (border_x - border_right, border_y - border_bottom)
  //  left-bottom = (border_x + border_left, border_y - border_bottom)
  padding.emplace_back(border_vector[0] + ltrb_values[0]);
  padding.emplace_back(border_vector[1] + ltrb_values[1]);
  padding.emplace_back(border_vector[2] - ltrb_values[2]);
  padding.emplace_back(border_vector[3] + ltrb_values[1]);
  padding.emplace_back(border_vector[4] - ltrb_values[2]);
  padding.emplace_back(border_vector[5] - ltrb_values[3]);
  padding.emplace_back(border_vector[6] + ltrb_values[0]);
  padding.emplace_back(border_vector[7] - ltrb_values[3]);
  return padding;
}

nlohmann::json DomModel::BuildBoxModelContent(const nlohmann::json& padding) {
  auto content = nlohmann::json::array();
  if (!padding.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelContent, padding isn't array");
    return content;
  }
  std::vector<std::string> keys = {kPadding, kPaddingLeft, kPaddingTop, kPaddingRight, kPaddingBottom};
  auto ltrb_values = GetLeftTopRightBottomValueFromStyle(keys);
  if (ltrb_values.empty()) {
    return content;
  }
  auto padding_vector = padding.get<std::vector<int32_t>>();
  //  left-top                  right-top
  //  (content[0],content[1])   (content[2],content[3])
  //     --------------------------
  //     | padding                |
  //     |   ------------------   |
  //     |   | content        |   |
  //     |   |                |   |
  //     |   ------------------   |
  //     --------------------------
  //  left-bottom               right-bottom
  //  (content[6],content[7])   (content[4],content[5])
  //  content in padding
  //  left-top = (padding_x + padding_left, padding_y + padding_top)
  //  right-top = (padding_x - padding_right, padding_y + padding_top)
  //  right-bottom = (padding_x - padding_right, padding_y - padding_bottom)
  //  left-bottom = (padding_x + padding_left, padding_y - padding_bottom)
  content.emplace_back(padding_vector[0] + ltrb_values[0]);
  content.emplace_back(padding_vector[1] + ltrb_values[1]);
  content.emplace_back(padding_vector[2] - ltrb_values[2]);
  content.emplace_back(padding_vector[3] + ltrb_values[1]);
  content.emplace_back(padding_vector[4] - ltrb_values[2]);
  content.emplace_back(padding_vector[5] - ltrb_values[3]);
  content.emplace_back(padding_vector[6] + ltrb_values[0]);
  content.emplace_back(padding_vector[7] - ltrb_values[3]);
  return content;
}

nlohmann::json DomModel::BuildBoxModelMargin(const nlohmann::json& border) {
  auto margin = nlohmann::json::array();
  if (!border.is_array()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, BoxModelMargin, border isn't array");
    return margin;
  }
  std::vector<std::string> keys = {kMargin, kMarginLeft, kMarginTop, kMarginRight, kMarginBottom};
  auto ltrb_values = GetLeftTopRightBottomValueFromStyle(keys);
  if (ltrb_values.empty()) {
    return margin;
  }
  auto border_vector = border.get<std::vector<int32_t>>();
  //  left-top                  right-top
  //  (margin[0],margin[1])     (margin[2],margin[3])
  //     --------------------------
  //     | margin                 |
  //     |   ------------------   |
  //     |   | border         |   |
  //     |   |                |   |
  //     |   ------------------   |
  //     --------------------------
  //  left-bottom               right-bottom
  //  (margin[6],margin[7])     (margin[4],margin[5])
  //  border in margin
  //  left-top = (border_x - border_left, border_y - border_top)
  //  right-top = (border_x + border_right, border_y - border_top)
  //  right-bottom = (border_x + border_right, border_y + border_bottom)
  //  left-bottom = (border_x - border_left, border_y + border_bottom)
  margin.emplace_back(border_vector[0] - ltrb_values[0]);
  margin.emplace_back(border_vector[1] - ltrb_values[1]);
  margin.emplace_back(border_vector[2] + ltrb_values[2]);
  margin.emplace_back(border_vector[3] - ltrb_values[1]);
  margin.emplace_back(border_vector[4] + ltrb_values[2]);
  margin.emplace_back(border_vector[5] + ltrb_values[3]);
  margin.emplace_back(border_vector[6] - ltrb_values[0]);
  margin.emplace_back(border_vector[7] + ltrb_values[3]);
  return margin;
}

nlohmann::json DomModel::BuildNodeBasicJson(DomNodeType node_type) {
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
  node_json[kAttributes] = BuildAttributesObjectToArray();
  return node_json;
}

nlohmann::json DomModel::BuildAttributesObjectToArray() {
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
      value = TdfStringUtil::ToString(value);
    }
    attributes_array.emplace_back(attribute.key());
    attributes_array.emplace_back(value);
  }
  return attributes_array;
}

std::vector<int32_t> DomModel::GetLeftTopRightBottomValueFromStyle(std::vector<std::string> keys) {
  std::vector<int32_t> result;
  if (keys.size() < 5) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetLeftTopRightBottomValueFromStyle keys is empty");
    return result;
  }
  if (!provider_ || !provider_->screen_adapter) {
    BACKEND_LOGD(TDF_BACKEND, "DOMModel::GetLeftTopRightBottomValueFromStyle ScreenAdapter is null");
    return result;
  }
  if (!style_.is_object()) {
    BACKEND_LOGE(TDF_BACKEND, "DOMModel, GetLeftTopRightBottomValueFromStyle, style isn't object");
    return result;
  }
  // keys [width, left_width, top_width, right_width, bottom_width]
  int32_t left = 0, top = 0, right = 0, bottom = 0;
  auto total_it = style_.find(keys[0]);
  if (total_it != style_.end()) {
    left = total_it.value();
    top = total_it.value();
    right = total_it.value();
    bottom = total_it.value();
  }
  auto left_it = style_.find(keys[1]);
  if (left_it != style_.end()) {
    left = left_it.value();
  }
  auto top_it = style_.find(keys[2]);
  if (top_it != style_.end()) {
    top = top_it.value();
  }
  auto right_it = style_.find(keys[3]);
  if (right_it != style_.end()) {
    right = right_it.value();
  }
  auto bottom_it = style_.find(keys[4]);
  if (bottom_it != style_.end()) {
    bottom = bottom_it.value();
  }
  left = static_cast<int32_t>(TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, left));
  top = static_cast<int32_t>(TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, top));
  right = static_cast<int32_t>(TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, right));
  bottom = static_cast<int32_t>(TdfBaseUtil::AddScreenScaleFactor(provider_->screen_adapter, bottom));
  result.emplace_back(left);
  result.emplace_back(top);
  result.emplace_back(right);
  result.emplace_back(bottom);
  return result;
}

}  // namespace hippy::devtools
