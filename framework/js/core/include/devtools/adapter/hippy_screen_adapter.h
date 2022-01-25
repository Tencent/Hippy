//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

#include "devtools/devtool_utils.h"
#include "devtools_backend/provider/devtools_screen_adapter.h"

namespace hippy {
namespace devtools {
class HippyScreenAdapter : public tdf::devtools::ScreenAdapter {
 public:
  explicit HippyScreenAdapter(int32_t dom_id) : dom_id_(dom_id) {}
  void GetScreenShot(const tdf::devtools::ScreenRequest& request, CoreScreenshotCallback callback) override {
    if (callback) {
      std::function func = [this, callback] {
        std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
        if (dom_manager) {
          auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
          auto children = root_node->GetChildren();
          if (!children.empty()) {
            hippy::dom::DomArgument argument;
            std::function screen_width_callback = [this](std::shared_ptr<DomArgument> arg) {
              tdf::base::DomValue result_dom_value;
              arg->ToObject(result_dom_value);
              auto base64_dom_value = result_dom_value.ToObject();
              width_ = base64_dom_value.find("width")->second.ToInt32();
              TDF_BASE_DLOG(INFO) << "GetScreenShot callback width:" << width_;
            };
            children[0]->CallFunction("getViewWidth", argument, screen_width_callback);
            std::function screen_height_callback = [this](std::shared_ptr<DomArgument> arg) {
              tdf::base::DomValue result_dom_value;
              arg->ToObject(result_dom_value);
              auto base64_dom_value = result_dom_value.ToObject();
              height_ = base64_dom_value.find("height")->second.ToInt32();
              TDF_BASE_DLOG(INFO) << "GetScreenShot callback height:" << height_;
            };
            children[0]->CallFunction("getViewHeight", argument, screen_height_callback);
            std::function screen_shot_callback = [this, callback](std::shared_ptr<DomArgument> arg) {
              tdf::base::DomValue result_dom_value;
              arg->ToObject(result_dom_value);
              auto base64_dom_value = result_dom_value.ToObject();
              std::string base64_str = base64_dom_value.find("screenShot")->second.ToString();
              TDF_BASE_DLOG(INFO) << "GetScreenShot callback" << base64_str.size();
              callback(base64_str, width_, height_);
            };
            children[0]->CallFunction("getScreenShot", argument, screen_shot_callback);
          }
        }
      };
      DevToolUtils::PostDomTask(dom_id_, func);
    }
  }

  uint64_t AddPostFrameCallback(std::function<void()> callback) override { return 0; }

  void RemovePostFrameCallback(uint64_t id) override {}

  double GetScreenScale() override { return 1.0f; }

 private:
  int16_t dom_id_;
  int32_t width_;
  int32_t height_;
};
}  // namespace devtools
}  // namespace hippy
