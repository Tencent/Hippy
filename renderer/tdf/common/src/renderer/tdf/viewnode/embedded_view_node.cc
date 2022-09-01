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

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#include "tdfview/embedded_view.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdfrender {

static constexpr const char kNodeInfoProps[] = "props";

EmbeddedViewNode::EmbeddedViewNode(RenderInfo render_info, const std::string &native_view_type)
    : ViewNode(render_info), native_view_type_(native_view_type) {}

std::shared_ptr<tdfcore::View> EmbeddedViewNode::CreateView() {
  return TDF_MAKE_SHARED(tdfcore::EmbeddedView, native_view_type_);
}

void EmbeddedViewNode::HandleStyleUpdate(const DomStyleMap &dom_style) {
  ViewNode::HandleStyleUpdate(dom_style);
  property_ = {{kNodeInfoProps, ""}};
  GetView<tdfcore::EmbeddedView>()->SetProperty(property_);
}

}  // namespace tdfrender
}  // namespace render
}  // namespace hippy
