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

#include "renderer/tdf/devtools/devtools_util.h"

#include "core/engine/graphics/texture.h"
#include "core/common/base64.h"
#include "tdfcodec/image_encoder.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace devtools {
constexpr const char kGetScreenShot[] = "getScreenShot";
constexpr const char kAddFrameCallback[] = "addFrameCallback";
constexpr const char kRemoveFrameCallback[] = "removeFrameCallback";
constexpr const char kGetLocationOnScreen[] = "getLocationOnScreen";

constexpr const char kMaxWidth[] = "maxWidth";
constexpr const char kMaxHeight[] = "maxHeight";
constexpr const char kScreenShot[] = "screenShot";
constexpr const char kScreenScale[] = "screenScale";
constexpr const char kWidth[] = "width";
constexpr const char kHeight[] = "height";
constexpr const char kXOnScreen[] = "xOnScreen";
constexpr const char kYOnScreen[] = "yOnScreen";
constexpr const char kViewWidth[] = "viewWidth";
constexpr const char kViewHeight[] = "viewHeight";

using DomValueObjectType = footstone::HippyValue::HippyValueObjectType;
uint64_t listener_id_;
float screen_scale_ = 1.0f;

void DevtoolsUtil::CallDevtoolsFunction(const std::weak_ptr<RootViewNode> &root_node,
                                        const std::shared_ptr<ViewNode> &view_node,
                                        const std::string &name,
                                        const DomArgument &param,
                                        const uint32_t call_back_id) {
  auto shell = root_node.lock()->GetShell();
  auto vew_context = root_node.lock()->GetViewContext();
  if (name == kGetScreenShot) {
    GetScreenshot(root_node, view_node, name, param, call_back_id);
  } else if (name == kAddFrameCallback) {
    std::weak_ptr<ViewNode> weak_view_node = view_node;
    auto event_center = shell->GetEventCenter();
    if (event_center) {
      event_center->AddListener(tdfcore::PostPaintEvent::ClassType(),
                                [name, call_back_id, weak_view_node](const std::shared_ptr<tdfcore::Event> &event,
                                                                     uint64_t id) {
                                  auto view_node = weak_view_node.lock();
                                  if (view_node) {
                                    DomValueObjectType obj;
                                    view_node->DoCallback(name,
                                                          call_back_id,
                                                          std::make_shared<footstone::HippyValue>(obj));
                                  }
                                  listener_id_ = id;
                                  return tdfcore::EventDispatchBehavior::kContinue;
                                });
    }
  } else if (name == kRemoveFrameCallback) {
    auto event_center = shell->GetEventCenter();
    if (event_center && listener_id_ != 0) {
      event_center->RemoveListener(tdfcore::PostPaintEvent::ClassType(), listener_id_);
    }
  } else if (name == kGetLocationOnScreen) {
    DomValueObjectType obj;
    auto ratio = vew_context->GetViewportMetrics().device_pixel_ratio;
    int32_t x_onScreen = 0, y_onScreen = 0, view_width = 0, view_height = 0;
    if (view_node->IsAttached()) {
      auto frame = view_node->GetView()->GetFrame();
      auto global_point = view_node->GetView()->LocalToGlobal(tdfcore::TPoint::Make(0, 0));
      x_onScreen = (int32_t) (global_point.x * ratio * screen_scale_);
      y_onScreen = (int32_t) (global_point.y * ratio * screen_scale_);
      view_width = (int32_t) (frame.Width() * ratio * screen_scale_);
      view_height = (int32_t) (frame.Height() * ratio * screen_scale_);
    }
    obj[kXOnScreen] = x_onScreen;
    obj[kYOnScreen] = y_onScreen;
    obj[kViewWidth] = view_width;
    obj[kViewHeight] = view_height;
    view_node->DoCallback(name, call_back_id, std::make_shared<footstone::HippyValue>(obj));
  }
}

void DevtoolsUtil::GetScreenshot(const std::weak_ptr<RootViewNode> &root_node,
                                 const std::shared_ptr<ViewNode> &view_node,
                                 const std::string &name,
                                 const DomArgument &param,
                                 const uint32_t call_back_id) {
  footstone::HippyValue value;
  param.ToObject(value);
  footstone::HippyValue::HippyValueObjectType hippy_value;
  if (value.IsArray() && !value.ToArrayChecked().empty()) {
    hippy_value = value.ToArrayChecked()[0].ToObjectChecked();
  } else if (value.IsObject()) {
    hippy_value = value.ToObjectChecked();
  }
  auto max_width = hippy_value.find(kMaxWidth)->second.ToInt32Checked();
  auto max_height = hippy_value.find(kMaxHeight)->second.ToInt32Checked();
  auto shell = root_node.lock()->GetShell();
  auto vew_context = root_node.lock()->GetViewContext();
  auto scaleX = static_cast<float>(max_width) / static_cast<float>(vew_context->GetViewportMetrics().width);
  auto scaleY = static_cast<float>(max_height) / static_cast<float>(vew_context->GetViewportMetrics().height);
  auto scale = std::min(scaleX, scaleY);
  screen_scale_ = scale;
  std::weak_ptr<ViewNode> weak_view_node = view_node;
  std::weak_ptr<tdfcore::Shell> weak_shell = shell;
  auto pipeline_id = root_node.lock()->GetRenderContext()->GetPipeline()->GetId();
  shell->GetLastScreenshot(static_cast<int>(pipeline_id), [weak_shell, name, call_back_id, weak_view_node](const std::shared_ptr<tdfcore::Texture> &screenshot) {
    auto shell = weak_shell.lock();
    if (screenshot && shell) {
      tdfcore::RenderCommand command;
      command.exec = [weak_view_node, name, call_back_id, screenshot](tdfcore::GraphicsContext *graphics_context) {
        auto data = tdfcore::ImageEncoder::Encode(TDF_MAKE_SHARED(tdfcore::TextureImageFrame, screenshot),
                                                  tdfcore::ImageCodecFormat::kPNG);
        auto view_node = weak_view_node.lock();
        if (view_node) {
          DomValueObjectType obj;
          obj[kScreenShot] = tdfcore::Base64::Encode(data->bytes(), data->size());
          obj[kScreenScale] = 1.0f;
          obj[kWidth] = screenshot->Width();
          obj[kHeight] = screenshot->Height();
          view_node->DoCallback(name, call_back_id, std::make_shared<footstone::HippyValue>(obj));
        }
      };
      shell->GetResourceDevice()->ExecuteOrPostRenderCommand(command);
      shell->GetResourceDevice()->Flush(false);
    }
  }, scale);
}
}  // namespace devtools
}  // namespace tdf
}  // namespace render
}  // namespace hippy
