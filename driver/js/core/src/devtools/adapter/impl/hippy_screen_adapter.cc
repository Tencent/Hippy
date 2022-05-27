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
#include "dom/macro.h"

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
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
  if (dom_manager) {
    auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
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
  }
  return frame_callback_id_;
}

void HippyScreenAdapter::RemovePostFrameCallback(uint64_t id) {
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
  if (dom_manager) {
    auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
    auto children = root_node->GetChildren();
    if (!children.empty()) {
      hippy::dom::DomArgument argument = makeFrameCallbackArgument(id);
      children[0]->CallFunction(kRemoveFrameCallback, argument, [](std::shared_ptr<hippy::dom::DomArgument> arg) {});
    }
  }
}

hippy::dom::DomArgument HippyScreenAdapter::makeFrameCallbackArgument(uint64_t id) const {
  tdf::base::DomValue::DomValueObjectType dom_value_object;
  dom_value_object[kFrameCallbackId] = tdf::base::DomValue(static_cast<int32_t>(id));
  tdf::base::DomValue::DomValueArrayType dom_value_array;
  dom_value_array.push_back(tdf::base::DomValue(dom_value_object));
  tdf::base::DomValue argument_dom_value(dom_value_array);
  hippy::dom::DomArgument argument(argument_dom_value);
  return argument;
}

void HippyScreenAdapter::GetScreenShot(const hippy::devtools::ScreenRequest& request, CoreScreenshotCallback callback) {
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
  if (dom_manager) {
    auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
    auto children = root_node->GetChildren();
    if (!children.empty()) {
      hippy::dom::DomArgument argument = makeScreenRequestArgument(request);
      std::function screen_shot_callback = [WEAK_THIS, callback](std::shared_ptr<hippy::dom::DomArgument> arg) {
        DEFINE_AND_CHECK_SELF(HippyScreenAdapter)
        tdf::base::DomValue result_dom_value;
        arg->ToObject(result_dom_value);
        tdf::base::DomValue::DomValueObjectType base64_dom_value;
        if (result_dom_value.IsArray()) {
          base64_dom_value = result_dom_value.ToArrayChecked()[0].ToObjectChecked();
        } else {
          base64_dom_value = result_dom_value.ToObjectChecked();
        }
        std::string base64_str = base64_dom_value.find(kScreenShot)->second.ToStringChecked();
        int32_t width = base64_dom_value.find(kScreenWidth)->second.ToInt32Checked();
        int32_t height = base64_dom_value.find(kScreenHeight)->second.ToInt32Checked();
        self->screen_scale_ = base64_dom_value.find(kScreenScale)->second.ToDoubleChecked();
        callback(base64_str, width, height);
      };
      children[0]->CallFunction(kGetScreenShot, argument, screen_shot_callback);
    }
  }
}

hippy::dom::DomArgument HippyScreenAdapter::makeScreenRequestArgument(const ScreenRequest& request) const {
  tdf::base::DomValue::DomValueObjectType dom_value_object;
  dom_value_object[kRequestMaxWidth] = tdf::base::DomValue(request.req_width);
  dom_value_object[kRequestMaxHeight] = tdf::base::DomValue(request.req_height);
  dom_value_object[kQuality] = tdf::base::DomValue(request.quality);
  tdf::base::DomValue::DomValueArrayType dom_value_array;
  dom_value_array.push_back(tdf::base::DomValue(dom_value_object));
  tdf::base::DomValue argument_dom_value(dom_value_array);
  hippy::dom::DomArgument argument(argument_dom_value);
  return argument;
}
}  // namespace hippy::devtools
