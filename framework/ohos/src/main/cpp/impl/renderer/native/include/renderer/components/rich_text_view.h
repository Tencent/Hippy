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

#include "renderer/arkui/stack_node.h"
#include "renderer/arkui/custom_node.h"
#include "renderer/components/base_view.h"
#include "renderer/arkui/text_node.h"
#include <optional>

namespace hippy {
inline namespace render {
inline namespace native {

class RichTextView : public BaseView
#if defined(OHOS_DRAW_TEXT) && defined(OHOS_DRAW_CUSTOM_TEXT)
, CustomNodeDelegate
#endif
{
public:
  RichTextView(std::shared_ptr<NativeRenderContext> &ctx);
  ~RichTextView();

  ArkUINode *GetLocalRootArkUINode() override;
  void CreateArkUINodeImpl() override;
  void DestroyArkUINodeImpl() override;
  bool RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) override;
  bool SetPropImpl(const std::string &propKey, const HippyValue &propValue) override;
  void OnSetPropsEndImpl() override;
  void UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) override;

  void OnChildInsertedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;
  void OnChildRemovedImpl(std::shared_ptr<BaseView> const &childView, int32_t index) override;

  void SendTextEllipsizedEvent();
  
#ifdef OHOS_DRAW_TEXT
  void RegisterSpanClickEvent(const std::shared_ptr<BaseView> spanView);
  void UnregisterSpanClickEvent(const std::shared_ptr<BaseView> spanView);
#endif

private:
  void ClearProps();
  
#ifdef OHOS_DRAW_TEXT
# ifdef OHOS_DRAW_CUSTOM_TEXT
  // CustomNodeDelegate
  virtual void OnForegroundDraw(ArkUI_NodeCustomEvent *event) override;
# else
  void UpdateDrawTextContent();
# endif
  virtual void SetClickable(bool flag) override;
  virtual void OnClick(const HRPosition &position) override;
  std::shared_ptr<BaseView> GetTextSpanView(int spanIndex);
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-private-field"
  
#ifdef OHOS_DRAW_TEXT
  float drawTextWidth_ = 0;
  std::shared_ptr<TextMeasurer> oldUsedTextMeasurerHolder_ = nullptr;
  // 问题：绘制包含ImageSpan的Text组件时，ImageSpan可以作为child加到Text上，但是ImageSpan的x和y不生效。
  // 解决方法：套了一层容器组件，用来解决ImageSpan位置不生效的问题。
  std::shared_ptr<StackNode> containerNode_ = nullptr;
  std::set<std::shared_ptr<BaseView>> clickableSpanViews_;
# ifdef OHOS_DRAW_CUSTOM_TEXT
  std::shared_ptr<CustomNode> textNode_ = nullptr;
# else
  std::shared_ptr<TextNode> textNode_ = nullptr;
# endif
#else
  std::shared_ptr<TextNode> textNode_ = nullptr;
#endif

  std::optional<std::string> text_;
  std::optional<uint32_t> color_;
  std::optional<std::string> fontFamily_;
  std::optional<float> fontSize_;
  std::optional<int32_t> fontStyle_;
  std::optional<int32_t> fontWeight_;
  std::optional<float> letterSpacing_;
  std::optional<float> lineHeight_;
  std::optional<int32_t> numberOfLines_;
  std::optional<int32_t> textAlign_;
  std::optional<std::string> ellipsizeModeValue_;

  ArkUI_TextDecorationType decorationType_ = ARKUI_TEXT_DECORATION_TYPE_NONE;
  ArkUI_TextDecorationStyle decorationStyle_ = ARKUI_TEXT_DECORATION_STYLE_SOLID;
  uint32_t decorationColor_ = 0xff000000;
  float textShadowRadius_ = 0.f;
  float textShadowOffsetX_ = 0.f;
  float textShadowOffsetY_ = 0.f;
  uint32_t textShadowColor_ = 0xff000000;

  bool toSetTextDecoration_ = false;
  bool toSetTextShadow = false;

  bool isListenEllipsized_ = false;
  bool toSendEllipsizedEvent_ = false;
  
#pragma clang diagnostic pop
};

} // namespace native
} // namespace render
} // namespace hippy
