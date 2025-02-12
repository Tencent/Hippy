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

#include "renderer/components/base_view.h"
#include "renderer/arkui/image_span_node.h"

namespace hippy {
inline namespace render {
inline namespace native {

class RichTextImageSpanView : public BaseView {
public:
  RichTextImageSpanView(std::shared_ptr<NativeRenderContext> &ctx);
  ~RichTextImageSpanView();

  ImageSpanNode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;
  bool IsValidFrame(const HRRect &frame) override;

private:
  void FetchAltImage(const std::string &imageUrl);
  void fetchImage(const std::string &imageUrl);
  
  void ClearProps();

  std::shared_ptr<ImageSpanNode> imageSpanNode_;

  std::string src_;
};

} // namespace native
} // namespace render
} // namespace hippy
