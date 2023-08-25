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
#include "devtools/adapter/hippy_screen_adapter.h"

#include "dom/dom_manager.h"
#include "dom/dom_node.h"

namespace hippy::devtools {
constexpr char kScreenShot[] = "screenShot";
constexpr char kScreenWidth[] = "width";
constexpr char kScreenHeight[] = "height";
constexpr char kRequestMaxWidth[] = "maxWidth";
constexpr char kRequestMaxHeight[] = "maxHeight";
constexpr char kQuality[] = "quality";
constexpr char kGetScreenShot[] = "getScreenShot";
constexpr char kAddFrameCallback[] = "addFrameCallback";
constexpr char kRemoveFrameCallback[] = "removeFrameCallback";
constexpr char kScreenScale[] = "screenScale";
constexpr char kFrameCallbackId[] = "frameCallbackId";

uint64_t HippyScreenAdapter::AddPostFrameCallback(std::function<void()> callback) {
  frame_callback_id_++;
  auto dom_manager = hippy_dom_->dom_manager.lock();
  FOOTSTONE_CHECK(dom_manager);
  auto render_manager = dom_manager->GetRenderManager().lock();
  FOOTSTONE_CHECK(render_manager);
  auto root_node = hippy_dom_->root_node.lock();
  FOOTSTONE_CHECK(root_node);
  auto children = root_node->GetChildren();
  if (!children.empty()) {
    hippy::dom::DomArgument argument = makeFrameCallbackArgument(frame_callback_id_);
    children[0]->CallFunction(kAddFrameCallback, argument,
                              [WEAK_THIS, callback](std::shared_ptr<hippy::dom::DomArgument> arg) {
                                DEFINE_AND_CHECK_SELF(HippyScreenAdapter)
                                self->supportDirtyCallback = true;
                                callback();
                              });
  }
  return frame_callback_id_;
}

void HippyScreenAdapter::RemovePostFrameCallback(uint64_t id) {
  auto dom_manager = hippy_dom_->dom_manager.lock();
  FOOTSTONE_CHECK(dom_manager);
  auto render_manager = dom_manager->GetRenderManager().lock();
  FOOTSTONE_CHECK(render_manager);
  auto root_node = hippy_dom_->root_node.lock();
  if (!root_node) {
    return;
  }
  auto children = root_node->GetChildren();
  if (!children.empty()) {
    hippy::dom::DomArgument argument = makeFrameCallbackArgument(id);
    children[0]->CallFunction(kRemoveFrameCallback, argument,
                              [](std::shared_ptr<hippy::dom::DomArgument> arg) {});
  }
}

hippy::dom::DomArgument HippyScreenAdapter::makeFrameCallbackArgument(uint64_t id) const {
  footstone::value::HippyValue::HippyValueObjectType hippy_value_object;
  hippy_value_object[kFrameCallbackId] = footstone::value::HippyValue(static_cast<int32_t>(id));
  footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
  hippy_value_array.push_back(footstone::value::HippyValue(hippy_value_object));
  footstone::value::HippyValue argument_hippy_value(hippy_value_array);
  hippy::dom::DomArgument argument(argument_hippy_value);
  return argument;
}

void HippyScreenAdapter::GetScreenShot(const hippy::devtools::ScreenRequest& request, CoreScreenshotCallback callback) {
  auto dom_manager = hippy_dom_->dom_manager.lock();
  FOOTSTONE_CHECK(dom_manager);
  auto render_manager = dom_manager->GetRenderManager().lock();
  FOOTSTONE_CHECK(render_manager);
  auto root_node = hippy_dom_->root_node.lock();
  if (!root_node) {
    return;
  }
  auto children = root_node->GetChildren();
  if (!children.empty()) {
    hippy::dom::DomArgument argument = makeScreenRequestArgument(request);
    auto screen_shot_callback = [WEAK_THIS, callback](std::shared_ptr<hippy::dom::DomArgument> arg) {
      DEFINE_AND_CHECK_SELF(HippyScreenAdapter)
      footstone::value::HippyValue result_hippy_value;
      arg->ToObject(result_hippy_value);
      footstone::value::HippyValue::HippyValueObjectType base64_hippy_value;
      if (result_hippy_value.IsArray() && !result_hippy_value.ToArrayChecked().empty()) {
        base64_hippy_value = result_hippy_value.ToArrayChecked()[0].ToObjectChecked();
      } else if (result_hippy_value.IsObject()) {
        base64_hippy_value = result_hippy_value.ToObjectChecked();
      } else {
        // don't have screenshot
        return;
      }
      std::string base64_str = base64_hippy_value.find(kScreenShot)->second.ToStringChecked();
      int32_t width = base64_hippy_value.find(kScreenWidth)->second.ToInt32Checked();
      int32_t height = base64_hippy_value.find(kScreenHeight)->second.ToInt32Checked();
      self->screen_scale_ = base64_hippy_value.find(kScreenScale)->second.ToDoubleChecked();
      callback(base64_str, width, height);
    };
    children[0]->CallFunction(kGetScreenShot, argument, screen_shot_callback);
  }
}

hippy::dom::DomArgument HippyScreenAdapter::makeScreenRequestArgument(const ScreenRequest& request) const {
  footstone::value::HippyValue::HippyValueObjectType hippy_value_object;
  hippy_value_object[kRequestMaxWidth] = footstone::value::HippyValue(request.req_width);
  hippy_value_object[kRequestMaxHeight] = footstone::value::HippyValue(request.req_height);
  hippy_value_object[kQuality] = footstone::value::HippyValue(request.quality);
  footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
  hippy_value_array.push_back(footstone::value::HippyValue(hippy_value_object));
  footstone::value::HippyValue argument_hippy_value(hippy_value_array);
  hippy::dom::DomArgument argument(argument_hippy_value);
  return argument;
}
}  // namespace hippy::devtools
