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

#include "renderer/tdf/viewnode/view_node.h"
#include "renderer/tdf/viewnode/view_names.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

class ImageViewNode : public ViewNode {
 public:
  using ViewNode::ViewNode;

  void SetDefaultSrc(const std::string &src);
  void SetSrc(const std::string &src);
  void SetScaleType(const std::string &type);
  void LoadImage(std::string url);

  std::string GetViewName() const override { return kImageViewName; }

 protected:
  void HandleStyleUpdate(const DomStyleMap &dom_style, const DomDeleteProps& dom_delete_props) override;

 private:
  std::string default_src_;
  std::string image_src_;
  std::string scale_type_;
  std::shared_ptr<tdfcore::View> CreateView(const std::shared_ptr<ViewContext> &context) override;
};

}  // namespace tdf
}  // namespace render
}  // namespace hippy
