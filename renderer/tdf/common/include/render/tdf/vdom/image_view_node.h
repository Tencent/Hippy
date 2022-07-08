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

#pragma once

#include "core/tdfi/view/view.h"
#include "render/tdf/vdom/view_node.h"

namespace tdfrender {

class ImageViewNode : public ViewNode {
 public:
  using ViewNode::ViewNode;
  static node_creator GetImageViewNodeCreator();

  void SetDefaultSrc(const std::string &src);
  void SetSrc(const std::string &src);
  void SetScaleType(const std::string &type);
  void LoadImage(std::string url);

 protected:
  void HandleStyleUpdate(const DomStyleMap &dom_style) override;

 private:
  std::string default_src_;
  std::string src_;
  bool main_image_set_ = false;
  std::string scale_type_;
  std::shared_ptr<tdfcore::View> CreateView() override;

  static constexpr const char *kScaleTypeCover = "cover";
  static constexpr const char *kScaleTypeContain = "contain";
  static constexpr const char *kScaleTypeStretch = "stretch";
  static constexpr const char *kScaleTypeRepeat = "repeat";
  static constexpr const char *kScaleTypeCenter = "center";
  static constexpr const char *kError = "error";
  static constexpr const char *kLoad = "load";
  static constexpr const char *kLoadEnd = "loadEnd";
  static constexpr const char *kLoadStart = "loadStart";
};

}  // namespace tdfrender
