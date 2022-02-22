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
constexpr const char* kScreenShot = "screenShot";
constexpr const char* kScreenWidth = "width";
constexpr const char* kScreenHeight = "height";
constexpr const char* kMaxWidth = "maxWidth";
constexpr const char* kMaxHeight = "maxHeight";
constexpr const char* kQuality = "quality";

static const char *const kGetScreenShot = "getScreenShot";
class HippyScreenAdapter : public tdf::devtools::ScreenAdapter {
 public:
  explicit HippyScreenAdapter(int32_t dom_id) : dom_id_(dom_id) {}
  void GetScreenShot(const tdf::devtools::ScreenRequest& request, CoreScreenshotCallback callback) override {
    if (callback) {
      std::function func = [this, callback, request] {
        std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id_));
        if (dom_manager) {
          auto root_node = dom_manager->GetNode(dom_manager->GetRootId());
          auto children = root_node->GetChildren();
          if (!children.empty()) {
            tdf::base::DomValue::DomValueObjectType domValueObject;
            domValueObject[kMaxWidth] = tdf::base::DomValue(request.req_width);
            domValueObject[kMaxHeight] = tdf::base::DomValue(request.req_height);
            domValueObject[kQuality] = tdf::base::DomValue(request.quality);
            tdf::base::DomValue::DomValueArrayType domValueArray;
            domValueArray.push_back(tdf::base::DomValue(domValueObject));
            tdf::base::DomValue argumentValue(domValueArray);
            hippy::dom::DomArgument argument(argumentValue);
            std::function screen_shot_callback = [callback](std::shared_ptr<DomArgument> arg) {
              tdf::base::DomValue result_dom_value;
              arg->ToObject(result_dom_value);
              tdf::base::DomValue::DomValueObjectType base64_dom_value;
              if (result_dom_value.IsArray()) {
                base64_dom_value = result_dom_value.ToArray()[0].ToObject();
              } else {
                base64_dom_value = result_dom_value.ToObject();
              }
              std::string base64_str = base64_dom_value.find(kScreenShot)->second.ToString();
              int32_t width = base64_dom_value.find(kScreenWidth)->second.ToInt32();
              int32_t height = base64_dom_value.find(kScreenHeight)->second.ToInt32();
              TDF_BASE_DLOG(INFO) << "GetScreenShot callback " << base64_str.size();
              callback(base64_str, width, height);
            };
            children[0]->CallFunction(kGetScreenShot, argument, screen_shot_callback);
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
